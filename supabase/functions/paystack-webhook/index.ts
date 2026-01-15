import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts';

const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY');

serve(async (req) => {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-paystack-signature');

    // Verify webhook signature
    if (!PAYSTACK_SECRET_KEY) {
      console.error('Paystack secret key not configured');
      return new Response('Configuration error', { status: 500 });
    }

    const hash = createHmac('sha512', PAYSTACK_SECRET_KEY)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      console.error('Invalid webhook signature');
      return new Response('Invalid signature', { status: 401 });
    }

    const event = JSON.parse(body);
    console.log('Paystack webhook event:', event.event);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Handle successful charge
    if (event.event === 'charge.success') {
      const { reference, channel, authorization, amount, currency } = event.data;

      console.log('Processing successful payment:', reference);

      // Get payment request by reference
      const { data: paymentRequest, error: prError } = await supabase
        .from('payment_requests')
        .select('*')
        .eq('paystack_reference', reference)
        .single();

      if (prError || !paymentRequest) {
        console.error('Payment request not found for reference:', reference);
        // Return 200 to acknowledge receipt (avoid retry loops)
        return new Response('OK', { status: 200 });
      }

      // Check if already processed (idempotency)
      if (paymentRequest.status === 'completed') {
        console.log('Payment already processed:', reference);
        return new Response('OK', { status: 200 });
      }

      // Update payment request to completed
      const { error: updateError } = await supabase
        .from('payment_requests')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          paystack_transaction_id: event.data.id.toString(),
          payment_channel: channel,
        })
        .eq('id', paymentRequest.id);

      if (updateError) {
        console.error('Failed to update payment request:', updateError);
      }

      // Update service request payment status
      await supabase
        .from('service_requests')
        .update({
          payment_status: 'paid',
          payment_completed_at: new Date().toISOString(),
        })
        .eq('id', paymentRequest.service_request_id);

      // Create earning transaction for handyman
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          handyman_id: paymentRequest.handyman_id,
          service_request_id: paymentRequest.service_request_id,
          payment_request_id: paymentRequest.id,
          type: 'earning',
          amount: paymentRequest.amount,
          platform_fee: paymentRequest.platform_fee,
          net_amount: paymentRequest.handyman_earnings,
          status: 'completed',
          paystack_reference: reference,
          description: `Payment received for completed job`,
        });

      if (txError) {
        console.error('Failed to create transaction:', txError);
      }

      // TODO: Send push notification to handyman - "Payment received!"
      // TODO: Send push notification to customer - "Payment successful!"

      console.log('Payment processed successfully:', reference);
    }

    // Handle failed charge
    if (event.event === 'charge.failed') {
      const { reference, gateway_response } = event.data;

      console.log('Processing failed payment:', reference);

      // Get payment request
      const { data: paymentRequest } = await supabase
        .from('payment_requests')
        .select('id, service_request_id')
        .eq('paystack_reference', reference)
        .single();

      if (paymentRequest) {
        // Update payment request status
        await supabase
          .from('payment_requests')
          .update({
            status: 'failed',
            failure_reason: gateway_response || 'Payment failed',
          })
          .eq('id', paymentRequest.id);

        // Update service request payment status
        await supabase
          .from('service_requests')
          .update({ payment_status: 'failed' })
          .eq('id', paymentRequest.service_request_id);

        // TODO: Send notification to customer about failed payment
      }

      console.log('Failed payment recorded:', reference);
    }

    // Handle transfer success (for future withdrawal payouts)
    if (event.event === 'transfer.success') {
      const { reference, recipient } = event.data;
      console.log('Transfer successful:', reference);
      // This will be used when we implement withdrawal payouts
    }

    // Handle transfer failure
    if (event.event === 'transfer.failed') {
      const { reference, reason } = event.data;
      console.log('Transfer failed:', reference, reason);
      // This will be used when we implement withdrawal payouts
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Return 200 to prevent Paystack from retrying for parsing errors
    return new Response('Error', { status: 200 });
  }
});
