import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { OtpInput } from "react-native-otp-entry";
import { FormError } from "../ui/FormError";


const OTPForm = () => {
  const [otp, setOtp] = useState("");
  // 1. Add error state
  const [error, setError] = useState(""); 
  
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { verifyOtp, resendOtp, loading } = useAuth();

  const handleVerify = async () => {
    setError(""); // Clear previous errors

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    const { data, error: apiError } = await verifyOtp(email, otp, "email");

    if (apiError) {
      setError(apiError.message);
      return;
    }

    if (data?.session) {
      // Success case - usually we don't need a UI component for success here as we redirect
      Alert.alert("Success", "Email verified successfully!");
      router.replace("/onboarding");
    }
  };

  const handleResend = async () => {
    setError("");
    const { error: resendError } = await resendOtp(email);
    
    if (resendError) {
      setError(resendError.message);
    }
  };

  // Helper to clear error when typing
  const handleTextChange = (text: string) => {
    setOtp(text);
    if (error) setError("");
  };

  return (
    <View className="w-full mt-8">
      {/* OTP Input */}
      <OtpInput
        numberOfDigits={6}
        onTextChange={handleTextChange}
        onFilled={(text) => handleTextChange(text)}
        autoFocus={true}
        focusColor="#000000"
        type="numeric"
        blurOnFilled={true}
        theme={{
          containerStyle: {
            marginBottom: 24,
          },
          pinCodeContainerStyle: {
            width: 48,
            height: 56,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: error ? "#DC2626" : "#D1D5DB", // Highlight red on error
          },
          focusedPinCodeContainerStyle: {
            borderColor: error ? "#DC2626" : "#000000",
          },
          filledPinCodeContainerStyle: {
            borderColor: error ? "#DC2626" : "#000000",
          },
          pinCodeTextStyle: {
            fontSize: 24,
            fontFamily: "Onest-Bold",
          },
        }}
      />

      {/* 2. Add FormError Component */}
     {error && <FormError message={error} />}

      {/* Verify Button */}
      <Button
        className="w-full rounded-full h-14 bg-black mb-4"
        onPress={handleVerify}
        isDisabled={loading || otp.length !== 6}
      >
        {loading ? (
          <ButtonSpinner color="white" />
        ) : (
          <ButtonText className="text-lg text-white font-onest-bold">
            Verify Email
          </ButtonText>
        )}
      </Button>

      {/* Resend Code */}
      <TouchableOpacity
        onPress={handleResend}
        disabled={loading}
        className="items-center py-3"
      >
        <Text className="text-gray-600 font-onest-medium">
          {loading ? "Sending..." : "Didn't receive the code? "}
          <Text className="text-black font-onest-bold">Resend</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default OTPForm;
