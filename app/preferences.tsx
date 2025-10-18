import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View, TouchableOpacity } from "react-native";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Moon,
  Bell,
  Globe,
  Vibrate,
  Eye,
  Smartphone,
} from "lucide-react-native";

export default function Preferences() {
  const router = useRouter();

  // Preference states
  const [notifications, setNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [autoPlayVideos, setAutoPlayVideos] = useState(true);
  const [toggleDarkMode, setToggleDarkMode] = useState(false);

  const handleDarkModeToggle = (value: boolean) => {
    setToggleDarkMode(value);
  };

  const PreferenceItem = ({
    icon: Icon,
    title,
    description,
    value,
    onValueChange,
  }: {
    icon: any;
    title: string;
    description: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }) => (
    <View className="bg-white rounded-2xl border border-gray-200 p-4 mb-3">
      <HStack space="md" className="items-center">
        <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center">
          <Icon size={24} color="#000" />
        </View>
        <VStack space="xs" className="flex-1">
          <Text size="md" className="text-gray-900 font-dmsans-bold">
            {title}
          </Text>
          <Text size="sm" className="text-gray-600 font-dmsans">
            {description}
          </Text>
        </VStack>
        <Switch value={value} onValueChange={onValueChange} />
      </HStack>
    </View>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text size="md" className="text-gray-900 font-dmsans-bold mb-3 mt-6">
      {title}
    </Text>
  );

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <View className="px-6 py-4 border-b border-gray-200 bg-white">
          <View className="flex-row items-center mb-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-4 p-2 -ml-2"
            >
              <ArrowLeft size={24} color="#000" />
            </TouchableOpacity>
            <Heading size="xl" className="text-black font-dmsans-bold">
              Preferences
            </Heading>
          </View>
          <Text size="sm" className="text-gray-600 font-dmsans">
            Customize your app experience
          </Text>
        </View>

        <View className="px-6">
          {/* Appearance Section */}
          <SectionHeader title="Appearance" />

          <PreferenceItem
            icon={Moon}
            title="Dark Mode"
            description="Switch to dark theme for better visibility at night"
            value={toggleDarkMode}
            onValueChange={handleDarkModeToggle}
          />

          <PreferenceItem
            icon={Eye}
            title="Reduced Motion"
            description="Minimize animations for a calmer experience"
            value={reducedMotion}
            onValueChange={setReducedMotion}
          />

          {/* Notifications Section */}
          <SectionHeader title="Notifications" />

          <PreferenceItem
            icon={Bell}
            title="All Notifications"
            description="Enable or disable all notifications"
            value={notifications}
            onValueChange={setNotifications}
          />

          {notifications && (
            <>
              <PreferenceItem
                icon={Smartphone}
                title="Push Notifications"
                description="Receive notifications on your device"
                value={pushNotifications}
                onValueChange={setPushNotifications}
              />

              <PreferenceItem
                icon={Globe}
                title="Email Notifications"
                description="Receive updates via email"
                value={emailNotifications}
                onValueChange={setEmailNotifications}
              />
            </>
          )}

          {/* Interaction Section */}
          <SectionHeader title="Interaction" />

          <PreferenceItem
            icon={Vibrate}
            title="Haptic Feedback"
            description="Feel subtle vibrations when interacting"
            value={hapticFeedback}
            onValueChange={setHapticFeedback}
          />

          <PreferenceItem
            icon={Smartphone}
            title="Auto-play Videos"
            description="Automatically play videos in feed"
            value={autoPlayVideos}
            onValueChange={setAutoPlayVideos}
          />

          {/* Language Section */}
          <SectionHeader title="Language & Region" />

          <TouchableOpacity className="bg-white rounded-2xl border border-gray-200 p-4 mb-3">
            <HStack space="md" className="items-center">
              <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center">
                <Globe size={24} color="#000" />
              </View>
              <VStack space="xs" className="flex-1">
                <Text size="md" className="text-gray-900 font-dmsans-bold">
                  Language
                </Text>
                <Text size="sm" className="text-gray-600 font-dmsans">
                  English (US)
                </Text>
              </VStack>
              <Text size="sm" className="text-gray-400 font-dmsans-medium">
                Change
              </Text>
            </HStack>
          </TouchableOpacity>

          {/* About Section */}
          <SectionHeader title="About" />

          <View className="bg-white rounded-2xl border border-gray-200 p-4 mb-3">
            <VStack space="md">
              <HStack className="justify-between">
                <Text size="sm" className="text-gray-600 font-dmsans">
                  App Version
                </Text>
                <Text size="sm" className="text-gray-900 font-dmsans-medium">
                  1.0.0
                </Text>
              </HStack>
              <HStack className="justify-between">
                <Text size="sm" className="text-gray-600 font-dmsans">
                  Build Number
                </Text>
                <Text size="sm" className="text-gray-900 font-dmsans-medium">
                  100
                </Text>
              </HStack>
            </VStack>
          </View>

          <TouchableOpacity className="bg-white rounded-2xl border border-gray-200 p-4 mb-3">
            <Text size="sm" className="text-center text-gray-600 font-dmsans">
              Terms of Service
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-white rounded-2xl border border-gray-200 p-4 mb-3">
            <Text size="sm" className="text-center text-gray-600 font-dmsans">
              Privacy Policy
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
