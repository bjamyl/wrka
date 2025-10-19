import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/components/ui/actionsheet";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "expo-router";
import { ArrowLeft, Eye, EyeOff, Key, Lock, LogOut, Shield, Smartphone } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Security() {
  const { logout, changePassword, loading } = useAuth();
  const router = useRouter();

  const [showPasswordSheet, setShowPasswordSheet] = useState(false);
  console.log('show password sheet', showPasswordSheet)
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChangePassword = async () => {
    // Validation
    if (!newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    const { error } = await changePassword(newPassword);
    setIsSubmitting(false);

    if (!error) {
      Alert.alert(
        "Success",
        "Your password has been changed successfully",
        [
          {
            text: "OK",
            onPress: () => {
              setShowPasswordSheet(false);
              setNewPassword("");
              setConfirmPassword("");
            },
          },
        ]
      );
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            const { error } = await logout();
            if (!error) {
              router.replace("/(auth)/login");
            }
          },
        },
      ]
    );
  };

  const SecurityOption = ({
    icon: Icon,
    title,
    description,
    onPress,
    variant = "default",
  }: {
    icon: any;
    title: string;
    description: string;
    onPress: () => void;
    variant?: "default" | "danger";
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`bg-white rounded-2xl border p-4 mb-3  ${
        variant === "danger" ? "border-red-200" : "border-gray-200"
      }`}
    >
      <HStack space="md" className="items-center">
        <View
          className={`w-12 h-12 rounded-full items-center justify-center ${
            variant === "danger" ? "bg-red-50" : "bg-gray-100"
          }`}
        >
          <Icon size={24} color={variant === "danger" ? "#DC2626" : "#000"} />
        </View>
        <VStack space="xs" className="flex-1">
          <Text
            size="md"
            className={`font-dmsans-bold ${
              variant === "danger" ? "text-red-600" : "text-gray-900"
            }`}
          >
            {title}
          </Text>
          <Text size="sm" className="text-gray-600 font-dmsans">
            {description}
          </Text>
        </VStack>
      </HStack>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <View className="px-6 py-4 border-b border-gray-200">
          <View className="flex-row items-center mb-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-4 p-2 -ml-2"
            >
              <ArrowLeft size={24} color="#000" />
            </TouchableOpacity>
            <Heading size="xl" className="text-black font-dmsans-bold">
              Security
            </Heading>
          </View>
          <Text size="sm" className="text-gray-600 font-dmsans">
            Manage your account security settings
          </Text>
        </View>

        <View className="px-6 py-6">
          <VStack space="lg">
            {/* Security Options Section */}
            <VStack space="md">
              <Text size="md" className="text-gray-900 font-dmsans-bold mb-2">
                Account Security
              </Text>

              <SecurityOption
                icon={Lock}
                title="Change Password"
                description="Update your account password"
                onPress={() => setShowPasswordSheet(true)}
              />

              <SecurityOption
                icon={Key}
                title="Two-Factor Authentication"
                description="Add an extra layer of security"
                onPress={() => {
                  // TODO: Navigate to 2FA setup
                  alert("Two-factor authentication coming soon!");
                }}
              />

              <SecurityOption
                icon={Smartphone}
                title="Trusted Devices"
                description="Manage devices that can access your account"
                onPress={() => {
                  // TODO: Navigate to trusted devices
                  alert("Trusted devices coming soon!");
                }}
              />

              <SecurityOption
                icon={Shield}
                title="Privacy Settings"
                description="Control who can see your information"
                onPress={() => {
                  // TODO: Navigate to privacy settings
                  alert("Privacy settings coming soon!");
                }}
              />
            </VStack>

            {/* Danger Zone */}
            <VStack space="md" className="mt-6">
              <Text size="md" className="text-red-600 font-dmsans-bold mb-2">
                Danger Zone
              </Text>

              <Button
                size="lg"
                className="bg-red-600 rounded-full h-14"
                onPress={handleLogout}
              >
                <HStack space="sm" className="items-center">
                  <LogOut size={20} color="#FFF" />
                  <ButtonText className="text-base font-semibold text-white font-dmsans-bold">
                    Logout
                  </ButtonText>
                </HStack>
              </Button>

              <Text size="xs" className="text-gray-500 text-center font-dmsans mt-2">
                You will be logged out of your account
              </Text>
            </VStack>
          </VStack>
        </View>
      </ScrollView>

     
      <Actionsheet isOpen={showPasswordSheet} onClose={() => setShowPasswordSheet(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="pb-8">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          <View className="w-full px-4 mt-4">
            <Heading size="lg" className="text-gray-900 font-dmsans-bold mb-2">
              Change Password
            </Heading>
            <Text size="sm" className="text-gray-600 font-dmsans mb-6">
              Create a new password for your account
            </Text>

            <VStack space="lg">
              {/* New Password Field */}
              <VStack space="xs">
                <Text size="sm" className="text-gray-700 font-dmsans-medium mb-1">
                  New Password
                </Text>
                <Input variant="outline" size="lg" className="border-gray-300 rounded-xl">
                  <InputField
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    className="font-dmsans"
                  />
                  <InputSlot className="pr-3" onPress={() => setShowNewPassword(!showNewPassword)}>
                    {showNewPassword ? (
                      <EyeOff size={20} color="#6B7280" />
                    ) : (
                      <Eye size={20} color="#6B7280" />
                    )}
                  </InputSlot>
                </Input>
              </VStack>

              {/* Confirm Password Field */}
              <VStack space="xs">
                <Text size="sm" className="text-gray-700 font-dmsans-medium mb-1">
                  Confirm Password
                </Text>
                <Input variant="outline" size="lg" className="border-gray-300 rounded-xl">
                  <InputField
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    className="font-dmsans"
                  />
                  <InputSlot className="pr-3" onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? (
                      <EyeOff size={20} color="#6B7280" />
                    ) : (
                      <Eye size={20} color="#6B7280" />
                    )}
                  </InputSlot>
                </Input>
              </VStack>

              {/* Password Requirements */}
              <View className="bg-gray-50 rounded-lg p-3">
                <Text size="xs" className="text-gray-600 font-dmsans">
                  Password must be at least 6 characters long
                </Text>
              </View>

              {/* Action Buttons */}
              <HStack space="sm" className="mt-2">
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 rounded-full border-gray-300"
                  onPress={() => {
                    setShowPasswordSheet(false);
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  disabled={isSubmitting}
                >
                  <ButtonText className="text-gray-700 font-dmsans-bold">
                    Cancel
                  </ButtonText>
                </Button>
                <Button
                  size="lg"
                  className="flex-1 bg-black rounded-full"
                  onPress={handleChangePassword}
                  disabled={isSubmitting || !newPassword || !confirmPassword}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <ButtonText className="text-white font-dmsans-bold">
                      Update Password
                    </ButtonText>
                  )}
                </Button>
              </HStack>
            </VStack>
          </View>
        </ActionsheetContent>
      </Actionsheet>
    </SafeAreaView>
  );
}
