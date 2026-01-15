export type TransactionType = 'earning' | 'withdrawal';
export type TransactionStatus = 'pending' | 'completed' | 'failed';
export type WithdrawalStatus = 'pending' | 'processing' | 'completed' | 'failed';
// Supports all providers from Ghana and Nigeria
export type MomoProvider = 'mtn' | 'vodafone' | 'airteltigo' | 'airtel' | 'glo' | '9mobile';

export interface Transaction {
  id: string;
  handyman_id: string;
  service_request_id: string | null;
  type: TransactionType;
  amount: number;
  platform_fee: number;
  net_amount: number;
  status: TransactionStatus;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransactionWithDetails extends Transaction {
  service_request?: {
    id: string;
    title: string;
    category?: {
      name: string;
      icon_name: string;
      color: string;
    };
  };
}

export interface Withdrawal {
  id: string;
  handyman_id: string;
  amount: number;
  momo_provider: MomoProvider;
  momo_number: string;
  status: WithdrawalStatus;
  reference: string | null;
  failure_reason: string | null;
  processed_at: string | null;
  created_at: string;
}

export interface HandymanBalance {
  handyman_id: string;
  available_balance: number;
  total_earnings: number;
  total_jobs: number;
}

export interface EarningsStats {
  earned: number;
  jobsCompleted: number;
  averagePerJob: number;
}

export interface PlatformSettings {
  platform_fee_percentage: number;
  min_withdrawal_amount: number;
}

export type EarningsPeriod = 'today' | 'week' | 'month' | 'all';

export interface WithdrawalRequest {
  amount: number;
  momo_provider: MomoProvider;
  momo_number: string;
}

// =============================================
// PAYMENT REQUEST TYPES (Paystack Integration)
// =============================================

export type PaymentRequestStatus =
  | 'pending'
  | 'initiated'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'expired';

export type PaymentChannel = 'mobile_money' | 'card' | 'bank_transfer';

export type PaymentStatus = 'unpaid' | 'pending' | 'processing' | 'paid' | 'failed';

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
  paystack_access_code: string | null;
  paystack_authorization_url: string | null;
  paystack_transaction_id: string | null;

  payment_channel: PaymentChannel | null;
  payment_provider: MomoProvider | null;

  status: PaymentRequestStatus;
  failure_reason: string | null;

  initiated_at: string | null;
  completed_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentRequestWithDetails extends PaymentRequest {
  service_request?: {
    id: string;
    title: string;
    description: string;
    final_cost: number | null;
    estimated_cost: number | null;
    category?: {
      name: string;
      icon_name: string;
      color: string;
    };
  };
  customer?: {
    id: string;
    full_name: string;
    phone_number: string | null;
    avatar_url: string | null;
  };
  handyman?: {
    id: string;
    profile?: {
      full_name: string;
      avatar_url: string | null;
    };
  };
}

export interface InitiatePaymentResponse {
  success: boolean;
  authorization_url?: string;
  access_code?: string;
  reference?: string;
  status?: string;
  message?: string;
  error?: string;
}

export interface MoMoPaymentRequest {
  paymentRequestId: string;
  provider: MomoProvider;
  phoneNumber: string;
}

export interface CardPaymentRequest {
  paymentRequestId: string;
}
