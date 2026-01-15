# Customer App Payment Integration Spec

This document describes the payment integration that needs to be implemented in the customer (public) app to work with the Paystack payment system set up in the handyman app.

## Overview

When a handyman completes a job, a payment request is created and the customer needs to pay via the customer app. The customer can pay using:
- **Ghana**: Mobile Money (MTN, Vodafone, AirtelTigo)
- **Nigeria**: Card or Bank Transfer

## Database Schema

The following table is used (already created in Supabase):

```sql
-- payment_requests table
CREATE TABLE payment_requests (
  id uuid PRIMARY KEY,
  service_request_id uuid NOT NULL,
  customer_id uuid NOT NULL,
  handyman_id uuid,

  amount numeric(10,2) NOT NULL,
  platform_fee numeric(10,2) NOT NULL,
  handyman_earnings numeric(10,2) NOT NULL,
  currency varchar(3) DEFAULT 'GHS', -- GHS or NGN

  paystack_reference varchar(100) UNIQUE,
  paystack_access_code varchar(100),
  paystack_authorization_url text,

  payment_channel varchar(50),  -- mobile_money, card, bank_transfer
  payment_provider varchar(50), -- mtn, vodafone, etc.

  status varchar(20) DEFAULT 'pending',
  -- Values: pending, initiated, processing, completed, failed, expired

  expires_at timestamp,
  created_at timestamp,
  completed_at timestamp
);

-- service_requests now has these additional columns:
-- payment_status: 'unpaid' | 'pending' | 'processing' | 'paid' | 'failed'
-- payment_request_id: uuid reference to payment_requests
-- payment_completed_at: timestamp
```

## Supabase Edge Functions

The following Edge Functions are available:

### 1. `charge-mobile-money` (Ghana MoMo)
**POST** `/functions/v1/charge-mobile-money`

```typescript
// Request
{
  paymentRequestId: string;
  provider: 'mtn' | 'vodafone' | 'airteltigo';
  phoneNumber: string; // e.g., "0551234567"
}

// Response
{
  success: boolean;
  status: string; // 'pending', 'send_otp'
  message: string; // "Please check your phone for the payment prompt"
  reference: string;
  displayText?: string;
}
```

After calling this, the customer receives a USSD prompt on their phone to enter their MoMo PIN.

### 2. `initialize-card-payment` (Nigeria Card/Bank)
**POST** `/functions/v1/initialize-card-payment`

```typescript
// Request
{
  paymentRequestId: string;
}

// Response
{
  success: boolean;
  authorization_url: string; // Paystack checkout URL
  access_code: string;
  reference: string;
}
```

Open `authorization_url` in a WebView or browser for the customer to complete payment.

### 3. `verify-payment`
**POST** `/functions/v1/verify-payment`

```typescript
// Request
{
  paymentRequestId: string;
  // OR
  reference: string;
}

// Response
{
  success: boolean;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  paystackStatus?: string;
  message: string;
}
```

Use this to poll for payment status or manually verify.

## Customer App Implementation

### 1. Hook: usePayment

Create a hook to manage payment state:

```typescript
// hooks/usePayment.ts

import { supabase } from '@/lib/supabase';
import { useQuery, useMutation } from '@tanstack/react-query';

// Fetch pending payments for customer
const fetchPendingPayments = async (customerId: string) => {
  const { data, error } = await supabase
    .from('payment_requests')
    .select(`
      *,
      service_request:service_requests(
        id, title, description, final_cost,
        category:service_categories(name, icon_name, color)
      ),
      handyman:handyman_profiles(
        id,
        profile:profiles!profile_id(full_name, avatar_url)
      )
    `)
    .eq('customer_id', customerId)
    .in('status', ['pending', 'initiated', 'processing'])
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Initiate MoMo payment
const initiateMoMoPayment = async ({ paymentRequestId, provider, phoneNumber }) => {
  const { data, error } = await supabase.functions.invoke('charge-mobile-money', {
    body: { paymentRequestId, provider, phoneNumber },
  });
  if (error) throw error;
  return data;
};

// Initialize card payment
const initiateCardPayment = async (paymentRequestId: string) => {
  const { data, error } = await supabase.functions.invoke('initialize-card-payment', {
    body: { paymentRequestId },
  });
  if (error) throw error;
  return data;
};

// Verify payment
const verifyPayment = async (paymentRequestId: string) => {
  const { data, error } = await supabase.functions.invoke('verify-payment', {
    body: { paymentRequestId },
  });
  if (error) throw error;
  return data;
};

export const usePayment = (customerId: string) => {
  // Query pending payments
  const pendingQuery = useQuery({
    queryKey: ['pending-payments', customerId],
    queryFn: () => fetchPendingPayments(customerId),
    enabled: !!customerId,
    refetchInterval: 30000, // Poll every 30 seconds
  });

  // Mutations
  const momoMutation = useMutation({ mutationFn: initiateMoMoPayment });
  const cardMutation = useMutation({ mutationFn: initiateCardPayment });
  const verifyMutation = useMutation({ mutationFn: verifyPayment });

  return {
    pendingPayments: pendingQuery.data || [],
    pendingCount: pendingQuery.data?.length || 0,
    isLoading: pendingQuery.isLoading,
    refetch: pendingQuery.refetch,

    initiateMoMoPayment: momoMutation.mutateAsync,
    isMoMoProcessing: momoMutation.isPending,

    initiateCardPayment: cardMutation.mutateAsync,
    isCardProcessing: cardMutation.isPending,

    verifyPayment: verifyMutation.mutateAsync,
  };
};
```

### 2. UI Components Needed

#### PendingPaymentBanner
Shows on home screen when customer has pending payments:

```tsx
// Shows amber/warning banner
// "Payment Required - GHS 150.00 for Plumbing Service"
// Tap to go to payment screen
```

#### PaymentScreen
Full screen for completing payment:

```tsx
// app/payment/[requestId].tsx

// 1. Amount Display
//    - Show amount due (e.g., GHS 150.00)
//    - Service title
//    - Handyman name

// 2. Payment Method Selection
//    Ghana: Show MoMo option prominently, Card as secondary
//    Nigeria: Show Card/Bank Transfer options

// 3. MoMo Payment Flow
//    - Select provider (MTN, Vodafone, AirtelTigo)
//    - Enter phone number
//    - Tap "Pay GHS 150.00"
//    - Show "Check your phone for payment prompt"
//    - Poll for completion

// 4. Card Payment Flow
//    - Tap "Continue to Payment"
//    - Open Paystack checkout URL in WebBrowser
//    - Handle callback
//    - Verify payment

// 5. Success State
//    - Green checkmark
//    - "Payment Successful!"
//    - "Done" button
```

### 3. Payment Flow

#### MoMo Flow (Ghana)
```
1. Customer taps "Pay Now" on pending payment
2. Customer selects MoMo provider (MTN/Vodafone/AirtelTigo)
3. Customer enters phone number
4. Customer taps "Pay"
5. App calls `charge-mobile-money` Edge Function
6. Customer receives USSD prompt on their phone
7. Customer enters MoMo PIN on their phone
8. App polls `verify-payment` every 5 seconds
9. When status = 'completed', show success screen
```

#### Card Flow (Nigeria)
```
1. Customer taps "Pay Now" on pending payment
2. Customer selects "Card / Bank Transfer"
3. Customer taps "Continue to Payment"
4. App calls `initialize-card-payment` Edge Function
5. App opens authorization_url in WebBrowser/WebView
6. Customer completes payment on Paystack page
7. Browser redirects back to app (wrka://payment-callback)
8. App calls `verify-payment` to confirm
9. Show success screen
```

### 4. Deep Linking

Configure deep link for payment callback:

```typescript
// app.json or app.config.js
{
  "expo": {
    "scheme": "wrka"
  }
}
```

Handle the callback URL: `wrka://payment-callback`

### 5. Push Notifications

When a payment request is created, the customer should receive a push notification:

```
Title: "Payment Required"
Body: "GHS 150.00 for Plumbing Service. Tap to pay."
Data: { type: "payment_request", paymentRequestId: "uuid" }
```

Handle notification tap to navigate to payment screen.

### 6. Types

```typescript
// types/payment.ts

export type PaymentRequestStatus =
  | 'pending'
  | 'initiated'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'expired';

export type PaymentChannel = 'mobile_money' | 'card' | 'bank_transfer';

export type MomoProvider = 'mtn' | 'vodafone' | 'airteltigo' | 'airtel' | 'glo' | '9mobile';

export interface PaymentRequest {
  id: string;
  service_request_id: string;
  customer_id: string;
  handyman_id: string | null;
  amount: number;
  platform_fee: number;
  handyman_earnings: number;
  currency: string;
  paystack_reference: string | null;
  status: PaymentRequestStatus;
  created_at: string;
  expires_at: string | null;
}

export interface PaymentRequestWithDetails extends PaymentRequest {
  service_request?: {
    id: string;
    title: string;
    category?: { name: string; icon_name: string; color: string };
  };
  handyman?: {
    id: string;
    profile?: { full_name: string; avatar_url?: string };
  };
}
```

### 7. Country-Specific Logic

```typescript
// Use existing country context to determine payment options

const { countryCode, config } = useCountry();

const isGhana = countryCode === 'GH';
const isNigeria = countryCode === 'NG';

// Ghana: Show MoMo prominently
// Nigeria: Show Card/Bank Transfer (MoMo not popular)
```

### 8. Error Handling

Handle these error scenarios:
- Payment timeout (show retry option)
- Insufficient funds (show error, allow retry)
- Card declined (show specific error from Paystack)
- Network failure (show retry)
- Payment expired (show message, option to request new payment)

### 9. Testing

Use Paystack test mode:
- Test card: `4084084084084081` (any expiry, any CVV)
- Test MoMo (Ghana): `0551234987` with MTN provider

## Environment Variables

Add to customer app `.env`:

```bash
# Not needed for customer app - all calls go through Edge Functions
# But if using Paystack inline/popup directly:
EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
```

## Webhook (Already Configured)

The Paystack webhook is handled by the `paystack-webhook` Edge Function. Configure in Paystack dashboard:
- URL: `https://[project-ref].supabase.co/functions/v1/paystack-webhook`
- Events: `charge.success`, `charge.failed`

## Summary Checklist

- [ ] Create `usePayment` hook
- [ ] Create `PaymentScreen` (`app/payment/[requestId].tsx`)
- [ ] Create `PendingPaymentBanner` component
- [ ] Add banner to home screen when pending payments exist
- [ ] Handle deep link `wrka://payment-callback`
- [ ] Add push notification handling for payment requests
- [ ] Test MoMo flow (Ghana)
- [ ] Test Card flow (Nigeria)
- [ ] Handle all error states
