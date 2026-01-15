import { supabase } from '@/lib/supabase';
import { Withdrawal, WithdrawalRequest } from '@/types/earnings';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { useHandymanProfile } from './useHandymanProfile';

// Fetch withdrawal history
const fetchWithdrawals = async (handymanId: string): Promise<Withdrawal[]> => {
  const { data, error } = await supabase
    .from('withdrawals')
    .select('*')
    .eq('handyman_id', handymanId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;

  return data || [];
};

interface WithdrawalRequestWithId extends WithdrawalRequest {
  handymanId: string;
}

// Submit withdrawal request
const submitWithdrawal = async ({ handymanId, ...request }: WithdrawalRequestWithId): Promise<Withdrawal> => {
  // First check balance
  const { data: balanceData } = await supabase
    .from('handyman_balances')
    .select('available_balance')
    .eq('handyman_id', handymanId)
    .single();

  const availableBalance = balanceData?.available_balance || 0;

  if (request.amount > availableBalance) {
    throw new Error('Insufficient balance');
  }

  // Create withdrawal record
  const { data: withdrawal, error: withdrawalError } = await supabase
    .from('withdrawals')
    .insert({
      handyman_id: handymanId,
      amount: request.amount,
      momo_provider: request.momo_provider,
      momo_number: request.momo_number,
      status: 'pending',
    })
    .select()
    .single();

  if (withdrawalError) throw withdrawalError;

  // Create transaction record for the withdrawal
  const { error: transactionError } = await supabase
    .from('transactions')
    .insert({
      handyman_id: handymanId,
      type: 'withdrawal',
      amount: request.amount,
      platform_fee: 0,
      net_amount: request.amount,
      status: 'pending',
      description: `Withdrawal to ${request.momo_provider.toUpperCase()} - ${request.momo_number}`,
    });

  if (transactionError) throw transactionError;

  return withdrawal;
};

export const useWithdrawal = () => {
  const queryClient = useQueryClient();
  const { handymanProfile } = useHandymanProfile();
  const handymanId = handymanProfile?.id;

  const withdrawalsQuery = useQuery({
    queryKey: ['withdrawals', handymanId],
    queryFn: () => fetchWithdrawals(handymanId!),
    enabled: !!handymanId,
  });

  const withdrawMutation = useMutation({
    mutationFn: submitWithdrawal,
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['earnings', 'balance'] });
      queryClient.invalidateQueries({ queryKey: ['earnings', 'transactions'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
      Alert.alert(
        'Withdrawal Requested',
        'Your withdrawal request has been submitted. You will receive your funds shortly.',
      );
    },
    onError: (error: Error) => {
      Alert.alert('Withdrawal Failed', error.message || 'Failed to process withdrawal');
    },
  });

  const withdraw = async (request: WithdrawalRequest) => {
    if (!handymanId) {
      throw new Error('Handyman profile not found');
    }
    return withdrawMutation.mutateAsync({ ...request, handymanId });
  };

  return {
    withdrawals: withdrawalsQuery.data || [],
    loading: withdrawalsQuery.isLoading,
    withdrawing: withdrawMutation.isPending,
    error: withdrawalsQuery.error,
    withdraw,
    refetch: withdrawalsQuery.refetch,
  };
};
