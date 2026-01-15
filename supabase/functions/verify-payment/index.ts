import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { reference, paymentRequestId } = await req.json();

    if (!reference && !paymentRequestId) {
      throw new Error('reference or paymentRequestId is required');
    }

    if (!PAYSTACK_SECRET_KEY) {
      throw new Error('Paystack secret key not configured');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get payment request
    let paymentRequest;
    if (paymentRequestId) {
      const { data, error } = await supabase
        .from('payment_requests')
        .select('*')
        .eq('id', paymentRequestId)
        .single();

      if (error || !data) {
        throw new Error('Payment request not found');
      }
      paymentRequest = data;
    } else {
      const { data, error } = await supabase
        .from('payment_requests')
        .select('*')
        .eq('paystack_reference', reference)
        .single();

      if (error || !data) {
        throw new Error('Payment request not found');
      }
      paymentRequest = data;
    }

    // If already completed, return current status
    if (paymentRequest.status === 'completed') {
      return new Response(
        JSON.stringify({
          success: true,
          status: 'completed',
          message: 'Payment has been completed',
          paymentRequest,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify with Paystack
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${paymentRequest.paystack_reference}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const verifyData = await verifyResponse.json();

    console.log('Paystack verify response:', JSON.stringify(verifyData));

    if (!verifyData.status) {
      return new Response(
        JSON.stringify({
          success: false,
          status: paymentRequest.status,
          message: 'Payment not yet confirmed',
          paymentRequest,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const txStatus = verifyData.data.status;

    // If Paystack confirms success but our record isn't updated, update it now
    if (txStatus === 'success' && paymentRequest.status !== 'completed') {
      // Update payment request
      await supabase
        .from('payment_requests')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          paystack_transaction_id: verifyData.data.id.toString(),
          payment_channel: verifyData.data.channel,
        })
        .eq('id', paymentRequest.id);

      // Update service request
      await supabase
        .from('service_requests')
        .update({
          payment_status: 'paid',
          payment_completed_at: new Date().toISOString(),
        })
        .eq('id', paymentRequest.service_request_id);

      // Create transaction if it doesn't exist
      const { data: existingTx } = await supabase
        .from('transactions')
        .select('id')
        .eq('paystack_reference', paymentRequest.paystack_reference)
        .single();

      if (!existingTx) {
        await supabase.from('transactions').insert({
          handyman_id: paymentRequest.handyman_id,
          service_request_id: paymentRequest.service_request_id,
          payment_request_id: paymentRequest.id,
          type: 'earning',
          amount: paymentRequest.amount,
          platform_fee: paymentRequest.platform_fee,
          net_amount: paymentRequest.handyman_earnings,
          status: 'completed',
          paystack_reference: paymentRequest.paystack_reference,
          description: 'Payment received for completed job',
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          status: 'completed',
          message: 'Payment verified and confirmed',
          paystackStatus: txStatus,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return current status
    return new Response(
      JSON.stringify({
        success: true,
        status: paymentRequest.status,
        paystackStatus: txStatus,
        message: txStatus === 'pending' ? 'Payment is pending' : `Payment status: ${txStatus}`,
        paymentRequest,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Verify payment error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
