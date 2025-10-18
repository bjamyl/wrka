import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile, ProfileWithAuth } from '@/types/profile';
import { Alert } from 'react-native';

export const useProfile = () => {
  const [profile, setProfile] = useState<ProfileWithAuth | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

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

      setProfile(combinedProfile);
      return { data: combinedProfile, error: null };
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message);
      Alert.alert('Error', 'Failed to load profile');
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      setUpdating(true);

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

      // Update local state
      const updatedProfile: ProfileWithAuth = {
        ...data as Profile,
        email: user.email,
        email_verified: user.email_confirmed_at ? true : false,
        avatar_url: user.user_metadata?.avatar_url,
      };

      setProfile(updatedProfile);
      Alert.alert('Success', 'Profile updated successfully');
      return { data: updatedProfile, error: null };
    } catch (err: any) {
      console.error('Error updating profile:', err);
      Alert.alert('Error', err.message || 'Failed to update profile');
      return { data: null, error: err };
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    updating,
    error,
    refetch: fetchProfile,
    updateProfile,
  };
};
