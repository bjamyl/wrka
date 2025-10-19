import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';

// Mutation functions
const signUpFn = async ({ email, password }: { email: string; password: string }) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
};

const signInFn = async ({ email, password }: { email: string; password: string }) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

const verifyOtpFn = async ({
  email,
  token,
  type = 'email'
}: {
  email: string;
  token: string;
  type?: 'email' | 'signup'
}) => {
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type });
  if (error) throw error;
  return data;
};

const resendOtpFn = async (email: string) => {
  const { error } = await supabase.auth.resend({ type: 'signup', email });
  if (error) throw error;
};

const logoutFn = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

const changePasswordFn = async (newPassword: string) => {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return data;
};

export const useAuth = () => {
  const queryClient = useQueryClient();

  const signUpMutation = useMutation({
    mutationFn: signUpFn,
    onError: (error: any) => {
      Alert.alert('Sign Up Error', error.message);
      console.log('Sign Up Error:', error);
    },
  });

  const signInMutation = useMutation({
    mutationFn: signInFn,
    onSuccess: () => {
      // Invalidate profile and handyman profile queries on successful sign in
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['handyman-profile'] });
    },
    onError: (error: any) => {
      Alert.alert('Sign In Error', error.message);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: verifyOtpFn,
    onSuccess: () => {
      // Invalidate profile queries on successful verification
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['handyman-profile'] });
    },
    onError: (error: any) => {
      Alert.alert('Verification Error', error.message);
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: resendOtpFn,
    onSuccess: () => {
      Alert.alert('Success', 'Verification code resent to your email');
    },
    onError: (error: any) => {
      Alert.alert('Resend Error', error.message);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutFn,
    onSuccess: () => {
      // Clear all queries on logout
      queryClient.clear();
    },
    onError: (error: any) => {
      Alert.alert('Logout Error', error.message);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: changePasswordFn,
    onError: (error: any) => {
      Alert.alert('Password Change Error', error.message);
    },
  });

  // Wrapper functions to maintain backward compatibility
  const signUp = async (email: string, password: string) => {
    try {
      const data = await signUpMutation.mutateAsync({ email, password });
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const data = await signInMutation.mutateAsync({ email, password });
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  const verifyOtp = async (email: string, token: string, type: 'email' | 'signup' = 'email') => {
    try {
      const data = await verifyOtpMutation.mutateAsync({ email, token, type });
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  const resendOtp = async (email: string) => {
    try {
      await resendOtpMutation.mutateAsync(email);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const changePassword = async (newPassword: string) => {
    try {
      const data = await changePasswordMutation.mutateAsync(newPassword);
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  // Return loading state based on any active mutation
  const loading =
    signUpMutation.isPending ||
    signInMutation.isPending ||
    verifyOtpMutation.isPending ||
    resendOtpMutation.isPending ||
    logoutMutation.isPending ||
    changePasswordMutation.isPending;

  return {
    signUp,
    signIn,
    verifyOtp,
    resendOtp,
    logout,
    changePassword,
    loading,
  };
};