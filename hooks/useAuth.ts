import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      Alert.alert('Sign Up Error', error.message);
      console.log('Sign Up Error:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      Alert.alert('Sign In Error', error.message);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (email: string, token: string, type: 'email' | 'signup' = 'email') => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      Alert.alert('Verification Error', error.message);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async (email: string,) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resend({
        type:"signup",
        email,
      });
      if (error) throw error;
      Alert.alert('Success', 'Verification code resent to your email');
      return { error: null };
    } catch (error: any) {
      Alert.alert('Resend Error', error.message);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      Alert.alert('Logout Error', error.message);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return {
    signUp,
    signIn,
    verifyOtp,
    resendOtp,
    logout,
    loading,
  };
};