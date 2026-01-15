import { supabase } from '@/lib/supabase';
import {
  CreatePaymentMethodRequest,
  PaymentMethod,
  UpdatePaymentMethodRequest,
} from '@/types/payment';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

// Fetch all payment methods for current user
const fetchPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('handyman_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Create a new payment method
const createPaymentMethod = async (
  request: CreatePaymentMethodRequest
): Promise<PaymentMethod> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // If this is set as default, unset other defaults first
  if (request.is_default) {
    await supabase
      .from('payment_methods')
      .update({ is_default: false })
      .eq('handyman_id', user.id);
  }

  const { data, error } = await supabase
    .from('payment_methods')
    .insert({
      handyman_id: user.id,
      momo_provider: request.momo_provider,
      momo_number: request.momo_number,
      account_name: request.account_name || null,
      is_default: request.is_default || false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update a payment method
const updatePaymentMethod = async (
  request: UpdatePaymentMethodRequest
): Promise<PaymentMethod> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // If setting as default, unset other defaults first
  if (request.is_default) {
    await supabase
      .from('payment_methods')
      .update({ is_default: false })
      .eq('handyman_id', user.id);
  }

  const { id, ...updates } = request;
  const { data, error } = await supabase
    .from('payment_methods')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('handyman_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete a payment method
const deletePaymentMethod = async (id: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('payment_methods')
    .delete()
    .eq('id', id)
    .eq('handyman_id', user.id);

  if (error) throw error;
};

// Set a payment method as default
const setDefaultPaymentMethod = async (id: string): Promise<PaymentMethod> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Unset all defaults
  await supabase
    .from('payment_methods')
    .update({ is_default: false })
    .eq('handyman_id', user.id);

  // Set the new default
  const { data, error } = await supabase
    .from('payment_methods')
    .update({ is_default: true, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('handyman_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const usePaymentMethods = () => {
  const queryClient = useQueryClient();

  const paymentMethodsQuery = useQuery({
    queryKey: ['payment-methods'],
    queryFn: fetchPaymentMethods,
  });

  const createMutation = useMutation({
    mutationFn: createPaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      Alert.alert('Success', 'Payment method added');
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message || 'Failed to add payment method');
    },
  });

  const updateMutation = useMutation({
    mutationFn: updatePaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      Alert.alert('Success', 'Payment method updated');
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message || 'Failed to update payment method');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      Alert.alert('Success', 'Payment method removed');
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message || 'Failed to remove payment method');
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: setDefaultPaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message || 'Failed to set default');
    },
  });

  // Get the default payment method
  const defaultPaymentMethod = paymentMethodsQuery.data?.find((pm) => pm.is_default);

  return {
    paymentMethods: paymentMethodsQuery.data || [],
    defaultPaymentMethod,
    loading: paymentMethodsQuery.isLoading,
    error: paymentMethodsQuery.error,
    refetch: paymentMethodsQuery.refetch,
    // Mutations
    addPaymentMethod: createMutation.mutateAsync,
    updatePaymentMethod: updateMutation.mutateAsync,
    removePaymentMethod: deleteMutation.mutateAsync,
    setDefault: setDefaultMutation.mutateAsync,
    // Mutation states
    adding: createMutation.isPending,
    updating: updateMutation.isPending,
    removing: deleteMutation.isPending,
  };
};
