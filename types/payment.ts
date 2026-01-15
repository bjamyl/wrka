// Supports all providers from Ghana and Nigeria
export type MomoProvider = 'mtn' | 'vodafone' | 'airteltigo' | 'airtel' | 'glo' | '9mobile';

export interface PaymentMethod {
  id: string;
  handyman_id: string;
  momo_provider: string; // Dynamic based on country
  momo_number: string;
  account_name: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentMethodRequest {
  momo_provider: MomoProvider;
  momo_number: string;
  account_name?: string;
  is_default?: boolean;
}

export interface UpdatePaymentMethodRequest {
  id: string;
  momo_provider?: MomoProvider;
  momo_number?: string;
  account_name?: string;
  is_default?: boolean;
}
