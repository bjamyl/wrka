import React, { useState } from "react";
import { View, Alert, TouchableOpacity, Text } from "react-native";
import { Button, ButtonText, ButtonSpinner } from "@/components/ui/button";
import { OtpInput } from "react-native-otp-entry";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/hooks/useAuth";

const OTPForm = () => {
  const [otp, setOtp] = useState("");
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { verifyOtp, resendOtp, loading } = useAuth();

  const handleVerify = async () => {
    if (otp.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit code");
      return;
    }

    const { data, error } = await verifyOtp(email, otp, "email");

    if (error) {
      return;
    }

    if (data?.session) {
      Alert.alert("Success", "Email verified successfully!");
      router.replace("/onboarding");
    }
  };

  const handleResend = async () => {
    await resendOtp(email);
  };

  return (
    <View className="w-full mt-8">
      {/* OTP Input */}
      <OtpInput
        numberOfDigits={6}
        onTextChange={(text) => setOtp(text)}
        onFilled={(text) => setOtp(text)}
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
            borderColor: "#D1D5DB",
          },
          focusedPinCodeContainerStyle: {
            borderColor: "#000000",
          },
          filledPinCodeContainerStyle: {
            borderColor: "#000000",
          },
          pinCodeTextStyle: {
            fontSize: 24,
            fontFamily: "Onest-Bold",
          },
        }}
      />

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