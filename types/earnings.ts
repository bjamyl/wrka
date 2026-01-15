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
