import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { fetchProfile } from "./useProfile";

const signUpFn = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  console.log("error", error);
  console.log("sign up success data", data);
  if (error) throw error;

  if (data.user && data.user.identities && data.user.identities.length === 0) {
    throw new Error("This email is already registered.");
  }
  return data;
};

const signInFn = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;

  try {
    const profile = await fetchProfile();
   
    return { user: data.user, profile };
  } catch (profileError: any) {
    // If profile doesn't exist, return null to indicate incomplete onboarding
    if (profileError.code === "PGRST116") {
      console.log("Profile not found - user needs onboarding");
      return { user: data.user, profile: null };
    }
    // For other errors, rethrow
    throw profileError;
  }
};

const verifyOtpFn = async ({
  email,
  token,
  type = "email",
}: {
  email: string;
  token: string;
  type?: "email" | "signup";
}) => {
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type });
  console.log("error ocurred in otp", error);
  if (error) throw error;
  return data;
};

const resendOtpFn = async (email: string) => {
  const { error } = await supabase.auth.resend({ type: "signup", email });
  if (error) throw error;
};

const logoutFn = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

const changePasswordFn = async (newPassword: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw error;
  return data;
};

export const useAuth = () => {
  const queryClient = useQueryClient();

  const signUpMutation = useMutation({
    mutationFn: signUpFn,
    onError: (error: any) => {
      console.log("Sign Up Error:", error);
    },
  });

  const signInMutation = useMutation({
    mutationFn: signInFn,

    onSuccess: (data) => {
      console.log("sign in data", data);
      // Invalidate profile and handyman profile queries on successful sign in
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["handyman-profile"] });
    },
    onError: (error: any) => {
      console.log("sign in error", error);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: verifyOtpFn,
    onSuccess: () => {
      // Invalidate profile queries on successful verification
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["handyman-profile"] });
    },
    onError: (error: any) => {
      console.log("token verification error");
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: resendOtpFn,
    onSuccess: () => {
      Alert.alert("Success", "Verification code resent to your email");
    },
    onError: (error: any) => {
      Alert.alert("Resend Error", error.message);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutFn,
    onSuccess: () => {
      queryClient.clear();
    },
    onError: (error: any) => {
      Alert.alert("Logout Error", error.message);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: changePasswordFn,
    onError: (error: any) => {
      Alert.alert("Password Change Error", error.message);
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

  const verifyOtp = async (
    email: string,
    token: string,
    type: "email" | "signup" = "email",
  ) => {
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
