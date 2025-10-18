import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View, TouchableOpacity, Alert } from "react-native";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "expo-router";
import { ArrowLeft, LogOut, Lock, Key, Shield, Smartphone } from "lucide-react-native";

export default function Security() {
  const { logout } = useAuth();
  const router = useRouter();

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
      className={`bg-white rounded-2xl border p-4 mb-3 active:bg-gray-50 ${
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
                onPress={() => {
                  // TODO: Navigate to change password page
                  alert("Change password coming soon!");
                }}
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
    </SafeAreaView>
  );
}
