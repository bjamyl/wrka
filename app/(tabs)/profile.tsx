import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, ButtonText } from "@/components/ui/button";
import {
  ScrollView,
  View,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { useProfile } from "@/hooks/useProfile";
import { useRouter } from "expo-router";
import {
  User,
  Briefcase,
  Settings,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  CheckCircle,
  XCircle,
} from "lucide-react-native";

export default function Profile() {
  const { profile, loading, refetch } = useProfile();
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const MenuSection = ({
    icon: Icon,
    title,
    description,
    onPress,
    showBadge = false,
  }: {
    icon: any;
    title: string;
    description: string;
    onPress: () => void;
    showBadge?: boolean;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl border border-gray-200 p-4 mb-3"
      activeOpacity={0.7}
    >
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
        {showBadge && (
          <View className="px-2 py-1 rounded-full bg-blue-100 mr-2">
            <Text size="xs" className="text-blue-700 font-dmsans-medium">
              New
            </Text>
          </View>
        )}
        <ChevronRight size={20} color="#9CA3AF" />
      </HStack>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#000" />
          <Text size="sm" className="text-gray-600 mt-4 font-dmsans">
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center px-6">
          <Text size="md" className="text-gray-600 text-center font-dmsans">
            Failed to load profile
          </Text>
          <Button
            size="md"
            className="bg-black rounded-full mt-4"
            onPress={() => refetch()}
          >
            <ButtonText className="text-white font-dmsans-medium">
              Retry
            </ButtonText>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="px-6 py-6 bg-white">
          <Heading size="2xl" className="text-black font-dmsans-bold">
            Profile
          </Heading>
        </View>

        <View className="px-6 mt-6">
          {/* Profile Header Card */}
          <View className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <VStack space="md" className="items-center">
              {/* Avatar */}
              <View className="w-24 h-24 rounded-full bg-black items-center justify-center">
                <Text size="2xl" className="text-white font-dmsans-bold">
                  {getInitials(profile.full_name)}
                </Text>
              </View>

              {/* Name */}
              <VStack space="xs" className="items-center">
                <Heading
                  size="xl"
                  className="text-gray-900 font-dmsans-bold text-center"
                >
                  {profile.full_name}
                </Heading>
                <View className="px-3 py-1 rounded-full bg-gray-100">
                  <Text
                    size="xs"
                    className="text-gray-700 font-dmsans-medium capitalize"
                  >
                    {profile.role}
                  </Text>
                </View>
              </VStack>

              {/* Verification Status */}
              <HStack space="xs" className="items-center">
                {profile.email_verified ? (
                  <>
                    <CheckCircle size={16} color="#10B981" />
                    <Text
                      size="sm"
                      className="text-green-600 font-dmsans-medium"
                    >
                      Verified Account
                    </Text>
                  </>
                ) : (
                  <>
                    <XCircle size={16} color="#EF4444" />
                    <Text size="sm" className="text-red-600 font-dmsans-medium">
                      Unverified Account
                    </Text>
                  </>
                )}
              </HStack>
            </VStack>
          </View>

          {/* Menu Sections */}
          <VStack space="md">
            <MenuSection
              icon={User}
              title="Personal Information"
              description="Manage your profile details"
              onPress={() => router.push("/edit-profile")}
            />

            {profile.role === "handyman" && (
              <MenuSection
                icon={Briefcase}
                title="Handyman Profile"
                description="Manage your professional profile"
                onPress={() => router.push("/handyman-profile")}
              />
            )}

            <MenuSection
              icon={Settings}
              title="Preferences"
              description="Customize your app experience"
              onPress={() => router.push("/preferences")}
            />

            <MenuSection
              icon={HelpCircle}
              title="Help & Support"
              description="Get help and contact support"
              onPress={() => {
                // TODO: Navigate to help & support page
                alert("Help & Support coming soon!");
              }}
            />

            <MenuSection
              icon={ShieldCheck}
              title="Security"
              description="Manage your account security"
              onPress={() => router.push("/security")}
            />
          </VStack>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
