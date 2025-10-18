import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { HandymanProfile } from '@/types/profile';
import { Alert } from 'react-native';

export const useHandymanProfile = () => {
  const [handymanProfile, setHandymanProfile] = useState<HandymanProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHandymanProfile = async () => {
    try {
      setLoading(true);
      setError(null);

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
          setHandymanProfile(null);
          return { data: null, error: null };
        }
        throw handymanError;
      }

      setHandymanProfile(handymanData as HandymanProfile);
      return { data: handymanData as HandymanProfile, error: null };
    } catch (err: any) {
      console.error('Error fetching handyman profile:', err);
      setError(err.message);
      Alert.alert('Error', 'Failed to load handyman profile');
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const updateAvailability = async (isAvailable: boolean) => {
    try {
      setUpdating(true);

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

      setHandymanProfile(data as HandymanProfile);
      return { data: data as HandymanProfile, error: null };
    } catch (err: any) {
      console.error('Error updating availability:', err);
      Alert.alert('Error', 'Failed to update availability');
      return { data: null, error: err };
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchHandymanProfile();
  }, []);

  return {
    handymanProfile,
    loading,
    updating,
    error,
    refetch: fetchHandymanProfile,
    updateAvailability,
  };
};
