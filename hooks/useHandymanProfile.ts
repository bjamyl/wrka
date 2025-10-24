import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { HandymanProfile } from '@/types/profile';
import { Alert } from 'react-native';

const fetchHandymanProfile = async (): Promise<HandymanProfile | null> => {
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error('No user found');

  // Fetch handyman profile data
  const { data: handymanData, error: handymanError } = await supabase
    .from('handyman_profiles')
    .select('*')
    .eq('profile_id', user.id)
    .single();

  if (handymanError) {
    // If no handyman profile exists, that's okay - return null
    if (handymanError.code === 'PGRST116') {
      return null;
    }
    throw handymanError;
  }

  return handymanData as HandymanProfile;
};

const updateHandymanAvailability = async (isAvailable: boolean): Promise<HandymanProfile> => {
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error('No user found');

  // Update availability
  const { data, error: updateError } = await supabase
    .from('handyman_profiles')
    .update({ is_available: isAvailable })
    .eq('profile_id', user.id)
    .select()
    .single();

  if (updateError) throw updateError;

  return data as HandymanProfile;
};

export const useHandymanProfile = () => {
  const queryClient = useQueryClient();

  const {
    data: handymanProfile,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['handyman-profile'],
    queryFn: fetchHandymanProfile,
    retry: 1,
  });

  const updateAvailabilityMutation = useMutation({
    mutationFn: updateHandymanAvailability,
    onSuccess: (data) => {
      // Update the cache with the new data
      queryClient.setQueryData(['handyman-profile'], data);
    },
    onError: (err: any) => {
      console.error('Error updating availability:', err);
      Alert.alert('Error', 'Failed to update availability');
    },
  });

  const updateAvailability = async (isAvailable: boolean) => {
    try {
      const data = await updateAvailabilityMutation.mutateAsync(isAvailable);
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  };

  return {
    handymanProfile: handymanProfile ?? null,
    loading,
    updating: updateAvailabilityMutation.isPending,
    error: queryError?.message ?? null,
    refetch,
    updateAvailability,
  };
};
