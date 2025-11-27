import { supabase } from '@/lib/supabase';
import { Profile, ProfileWithAuth } from '@/types/profile';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

export const fetchProfile = async (): Promise<ProfileWithAuth> => {
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error('No user found');

  // Fetch profile data
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) throw profileError;

  // Combine user and profile data
  const combinedProfile: ProfileWithAuth = {
    ...profileData as Profile,
    email: user.email,
    email_verified: user.email_confirmed_at ? true : false,
    avatar_url: user.user_metadata?.avatar_url,
  };

  return combinedProfile;
};

const updateProfileData = async (updates: Partial<Profile>): Promise<ProfileWithAuth> => {
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error('No user found');

  // Update profile data
  const { data, error: updateError } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()
    .single();

  if (updateError) throw updateError;

  // Combine with user data
  const updatedProfile: ProfileWithAuth = {
    ...data as Profile,
    email: user.email,
    email_verified: user.email_confirmed_at ? true : false,
    avatar_url: user.user_metadata?.avatar_url,
  };

  return updatedProfile;
};

export const useProfile = () => {
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    retry: 1,
  });

  const updateProfileMutation = useMutation({
    mutationFn: updateProfileData,
    onSuccess: (data) => {
      // Update the cache with the new data
      queryClient.setQueryData(['profile'], data);
      Alert.alert('Success', 'Profile updated successfully');
    },
    onError: (err: any) => {
      console.error('Error updating profile:', err);
      Alert.alert('Error', err.message || 'Failed to update profile');
    },
  });

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      const data = await updateProfileMutation.mutateAsync(updates);
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  };

  return {
    profile: profile ?? null,
    loading,
    updating: updateProfileMutation.isPending,
    error: queryError?.message ?? null,
    refetch,
    updateProfile,
  };
};
