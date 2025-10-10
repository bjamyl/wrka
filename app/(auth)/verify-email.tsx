import OTPForm from "@/components/auth/OTPForm";
import { Heading } from "@/components/ui/heading";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { VStack } from "@/components/ui/vstack";

export default function VerifyEmail() {
  const { email } = useLocalSearchParams<{ email: string }>();
  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pt-5 pb-10"
      >
        <View className="mb-8">
          <Text className="text-4xl font-bold text-black">wrka.</Text>
        </View>
        <VStack>
          <Heading size="3xl" className="text-3xl font-dmsans-bold text-black">
            Verify your email
          </Heading>
          <Text className="text-gray-600 font-dmsans text-base mb-2">
            We&apos;ve sent an email to{" "}
            <Text className="font-onest-bold text-black">{email}</Text> with a
            verification code
          </Text>
          <OTPForm />
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
