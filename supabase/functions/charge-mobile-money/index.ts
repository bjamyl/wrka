import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Map our provider names to Paystack provider codes
const PROVIDER_MAP: Record<string, string> = {
  mtn: 'mtn',
  vodafone: 'vod',
  airteltigo: 'tgo',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { paymentRequestId, provider, phoneNumber } = await req.json();

    if (!paymentRequestId || !provider || !phoneNumber) {
      throw new Error('paymentRequestId, provider, and phoneNumber are required');
    }

    if (!PAYSTACK_SECRET_KEY) {
      throw new Error('Paystack secret key not configured');
    }

    const paystackProvider = PROVIDER_MAP[provider];
    if (!paystackProvider) {
      throw new Error(`Unsupported MoMo provider: ${provider}`);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get payment request
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

    if (paymentRequest.status === 'processing') {
      return new Response(
        JSON.stringify({
          success: true,
          status: 'processing',
          message: 'Payment is already being processed. Check your phone for the prompt.',
          reference: paymentRequest.paystack_reference,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format phone number (remove leading 0, add country code if needed)
    let formattedPhone = phoneNumber.replace(/\s/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '233' + formattedPhone.substring(1); // Ghana country code
    } else if (!formattedPhone.startsWith('233')) {
      formattedPhone = '233' + formattedPhone;
    }

    // Create a pseudo-email since Paystack requires email
    const email = `${formattedPhone}@wrka.app`;

    // Call Paystack Charge API for Mobile Money
    const chargeResponse = await fetch('https://api.paystack.co/charge', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: Math.round(paymentRequest.amount * 100), // Paystack uses pesewas
        currency: paymentRequest.currency,
        reference: paymentRequest.paystack_reference,
        mobile_money: {
          phone: formattedPhone,
          provider: paystackProvider,
        },
        metadata: {
          payment_request_id: paymentRequestId,
          service_request_id: paymentRequest.service_request_id,
          customer_name: paymentRequest.customer?.full_name,
          custom_fields: [
            {
              display_name: 'Payment For',
              variable_name: 'payment_for',
              value: 'WRKA Service',
            },
          ],
        },
      }),
    });

    const chargeData = await chargeResponse.json();

    console.log('Paystack charge response:', JSON.stringify(chargeData));

    if (!chargeData.status) {
      throw new Error(chargeData.message || 'Failed to initiate MoMo charge');
    }

    // Update payment request status
    await supabase
      .from('payment_requests')
      .update({
        status: 'processing',
        initiated_at: new Date().toISOString(),
        payment_channel: 'mobile_money',
        payment_provider: provider,
      })
      .eq('id', paymentRequestId);

    // Update service request payment status
    await supabase
      .from('service_requests')
      .update({ payment_status: 'processing' })
      .eq('id', paymentRequest.service_request_id);

    // The user will receive a USSD prompt on their phone
    return new Response(
      JSON.stringify({
        success: true,
        status: chargeData.data.status, // 'send_otp', 'pending', etc.
        message: 'Please check your phone for the payment prompt and enter your MoMo PIN.',
        reference: paymentRequest.paystack_reference,
        displayText: chargeData.data.display_text,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('MoMo charge error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
