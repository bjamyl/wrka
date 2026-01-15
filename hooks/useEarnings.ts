import { supabase } from '@/lib/supabase';
import {
  EarningsPeriod,
  EarningsStats,
  HandymanBalance,
  PlatformSettings,
  TransactionWithDetails,
} from '@/types/earnings';
import { useQuery } from '@tanstack/react-query';
import { useHandymanProfile } from './useHandymanProfile';

// Get date range for period
const getDateRange = (period: EarningsPeriod): { start: Date; end: Date } | null => {
  if (period === 'all') {
    return null; // No date filtering for all-time
  }

  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  let start: Date;

  switch (period) {
    case 'today':
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start = new Date(now);
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      break;
    case 'month':
      start = new Date(now);
      start.setMonth(now.getMonth() - 1);
      start.setHours(0, 0, 0, 0);
      break;
  }

  return { start, end };
};

// Fetch handyman balance
const fetchBalance = async (handymanId: string): Promise<HandymanBalance | null> => {
  const { data, error } = await supabase
    .from('handyman_balances')
    .select('*')
    .eq('handyman_id', handymanId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;

  return data || {
    handyman_id: handymanId,
    available_balance: 0,
    total_earnings: 0,
    total_jobs: 0,
  };
};

// Fetch earnings stats for period
const fetchEarningsStats = async (handymanId: string, period: EarningsPeriod): Promise<EarningsStats> => {
  const dateRange = getDateRange(period);

  let query = supabase
    .from('transactions')
    .select('net_amount')
    .eq('handyman_id', handymanId)
    .eq('type', 'earning')
    .eq('status', 'completed');

  if (dateRange) {
    query = query
      .gte('created_at', dateRange.start.toISOString())
      .lte('created_at', dateRange.end.toISOString());
  }

  const { data, error } = await query;

  if (error) throw error;

  const earned = data?.reduce((sum, t) => sum + Number(t.net_amount), 0) || 0;
  const jobsCompleted = data?.length || 0;
  const averagePerJob = jobsCompleted > 0 ? earned / jobsCompleted : 0;

  return {
    earned,
    jobsCompleted,
    averagePerJob,
  };
};

// Fetch recent transactions
const fetchTransactions = async (handymanId: string, limit = 20): Promise<TransactionWithDetails[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      service_request:service_requests (
        id,
        title,
        category:service_categories (
          name,
          icon_name,
          color
        )
      )
    `)
    .eq('handyman_id', handymanId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return data || [];
};

// Fetch platform settings
const fetchPlatformSettings = async (): Promise<PlatformSettings> => {
  const { data, error } = await supabase
    .from('platform_settings')
    .select('key, value');

  if (error) throw error;

  const settings: PlatformSettings = {
    platform_fee_percentage: 15,
    min_withdrawal_amount: 20,
  };

  data?.forEach((item) => {
    if (item.key === 'platform_fee_percentage') {
      settings.platform_fee_percentage = item.value?.value || 15;
    }
    if (item.key === 'min_withdrawal_amount') {
      settings.min_withdrawal_amount = item.value?.value || 20;
    }
  });

  return settings;
};

// Main hook
export const useEarnings = (period: EarningsPeriod = 'week') => {
  const { handymanProfile } = useHandymanProfile();
  const handymanId = handymanProfile?.id;

  const balanceQuery = useQuery({
    queryKey: ['earnings', 'balance', handymanId],
    queryFn: () => fetchBalance(handymanId!),
    enabled: !!handymanId,
  });

  const statsQuery = useQuery({
    queryKey: ['earnings', 'stats', period, handymanId],
    queryFn: () => fetchEarningsStats(handymanId!, period),
    enabled: !!handymanId,
  });

  const transactionsQuery = useQuery({
    queryKey: ['earnings', 'transactions', handymanId],
    queryFn: () => fetchTransactions(handymanId!),
    enabled: !!handymanId,
  });

  const settingsQuery = useQuery({
    queryKey: ['platform', 'settings'],
    queryFn: fetchPlatformSettings,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  const refetch = () => {
    balanceQuery.refetch();
    statsQuery.refetch();
    transactionsQuery.refetch();
  };

  return {
    balance: balanceQuery.data,
    stats: statsQuery.data || { earned: 0, jobsCompleted: 0, averagePerJob: 0 },
    transactions: transactionsQuery.data || [],
    settings: settingsQuery.data || { platform_fee_percentage: 15, min_withdrawal_amount: 20 },
    loading: balanceQuery.isLoading || statsQuery.isLoading || transactionsQuery.isLoading,
    error: balanceQuery.error || statsQuery.error || transactionsQuery.error,
    refetch,
  };
};
