import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const PLATFORM_FEE_PERCENTAGE = 15;

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
    const { serviceRequestId, amount } = await req.json();

    if (!serviceRequestId || !amount) {
      throw new Error('serviceRequestId and amount are required');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get service request details with customer and handyman info
    const { data: serviceRequest, error: srError } = await supabase
      .from('service_requests')
      .select(`
        *,
        customer:profiles!customer_id(id, full_name, phone_number, country),
        handyman:handyman_profiles!handyman_id(id, profile_id)
      `)
      .eq('id', serviceRequestId)
      .single();

    if (srError || !serviceRequest) {
      throw new Error('Service request not found');
    }

    // Check if payment request already exists for this service request
    const { data: existingPayment } = await supabase
      .from('payment_requests')
      .select('id, status')
      .eq('service_request_id', serviceRequestId)
      .in('status', ['pending', 'initiated', 'processing'])
      .single();

    if (existingPayment) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Payment request already exists',
          paymentRequest: existingPayment,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate fees
    const platformFee = amount * (PLATFORM_FEE_PERCENTAGE / 100);
    const handymanEarnings = amount - platformFee;

    // Generate unique reference
    const reference = `WRKA_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`.toUpperCase();

    // Determine currency based on customer country
    const currency = serviceRequest.customer?.country === 'Nigeria' ? 'NGN' : 'GHS';

    // Create payment request
    const { data: paymentRequest, error: prError } = await supabase
      .from('payment_requests')
      .insert({
        service_request_id: serviceRequestId,
        customer_id: serviceRequest.customer_id,
        handyman_id: serviceRequest.handyman_id,
        amount,
        platform_fee: platformFee,
        handyman_earnings: handymanEarnings,
        currency,
        paystack_reference: reference,
        status: 'pending',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      })
      .select()
      .single();

    if (prError) {
      console.error('Failed to create payment request:', prError);
      throw new Error(`Failed to create payment request: ${prError.message}`);
    }

    // Update service request with payment request ID and status
    await supabase
      .from('service_requests')
      .update({
        payment_request_id: paymentRequest.id,
        payment_status: 'pending',
      })
      .eq('id', serviceRequestId);

    // TODO: Send push notification to customer
    // TODO: Send SMS to customer with payment link

    console.log('Payment request created:', reference);

    return new Response(
      JSON.stringify({
        success: true,
        paymentRequest: {
          ...paymentRequest,
          customer: serviceRequest.customer,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating payment request:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
