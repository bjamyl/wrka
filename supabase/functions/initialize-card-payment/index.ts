import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY');
const APP_CALLBACK_URL = Deno.env.get('APP_CALLBACK_URL') || 'wrka://payment-callback';

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
    const { paymentRequestId } = await req.json();

    if (!paymentRequestId) {
      throw new Error('paymentRequestId is required');
    }

    if (!PAYSTACK_SECRET_KEY) {
      throw new Error('Paystack secret key not configured');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get payment request with customer details
    const { data: paymentRequest, error } = await supabase
      .from('payment_requests')
      .select('*, customer:profiles!customer_id(full_name, phone_number)')
      .eq('id', paymentRequestId)
      .single();

    if (error || !paymentRequest) {
      throw new Error('Payment request not found');
    }

    if (paymentRequest.status === 'completed') {
      throw new Error('Payment already completed');
    }

    // If already initiated and has authorization URL, return it
    if (paymentRequest.status === 'initiated' && paymentRequest.paystack_authorization_url) {
      return new Response(
        JSON.stringify({
          success: true,
          authorization_url: paymentRequest.paystack_authorization_url,
          access_code: paymentRequest.paystack_access_code,
          reference: paymentRequest.paystack_reference,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a pseudo-email using phone number
    const email = paymentRequest.customer?.phone_number
      ? `${paymentRequest.customer.phone_number.replace(/\D/g, '')}@wrka.app`
      : `customer_${paymentRequest.customer_id}@wrka.app`;

    // Initialize Paystack transaction
    const initResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: Math.round(paymentRequest.amount * 100), // Paystack uses kobo/pesewas
        currency: paymentRequest.currency,
        reference: paymentRequest.paystack_reference,
        callback_url: APP_CALLBACK_URL,
        channels: ['card', 'bank', 'bank_transfer', 'ussd'], // All Nigeria payment options
        metadata: {
          payment_request_id: paymentRequestId,
          service_request_id: paymentRequest.service_request_id,
          customer_name: paymentRequest.customer?.full_name,
          custom_fields: [
            {
              display_name: 'Service',
              variable_name: 'service',
              value: 'WRKA Handyman Service',
            },
          ],
        },
      }),
    });

    const initData = await initResponse.json();

    console.log('Paystack initialize response:', JSON.stringify(initData));

    if (!initData.status) {
      throw new Error(initData.message || 'Failed to initialize payment');
    }

    // Update payment request with Paystack details
    await supabase
      .from('payment_requests')
      .update({
        status: 'initiated',
        initiated_at: new Date().toISOString(),
        paystack_access_code: initData.data.access_code,
        paystack_authorization_url: initData.data.authorization_url,
      })
      .eq('id', paymentRequestId);

    // Update service request payment status
    await supabase
      .from('service_requests')
      .update({ payment_status: 'pending' })
      .eq('id', paymentRequest.service_request_id);

    return new Response(
      JSON.stringify({
        success: true,
        authorization_url: initData.data.authorization_url,
        access_code: initData.data.access_code,
        reference: paymentRequest.paystack_reference,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Card payment initialization error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
