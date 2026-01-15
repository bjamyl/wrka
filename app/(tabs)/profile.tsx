import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";
import { useProfile } from "@/hooks/useProfile";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  Briefcase,
  Camera,
  CheckCircle,
  ChevronRight,
  HelpCircle,
  Settings,
  ShieldCheck,
  Star,
  User,
  Wallet,
} from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  const { profile, loading, refetch } = useProfile();
  console.log('profile details', profile)
  const { pickAndUploadAvatar, isUploading } = useAvatarUpload();
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const MenuItem = ({
    icon: Icon,
    title,
    subtitle,
    onPress,
    iconBgColor = "#F3F4F6",
    iconColor = "#000",
  }: {
    icon: any;
    title: string;
    subtitle: string;
    onPress: () => void;
    iconBgColor?: string;
    iconColor?: string;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center py-4"
      activeOpacity={0.6}
    >
      <View
        className="w-11 h-11 rounded-full items-center justify-center mr-4"
        style={{ backgroundColor: iconBgColor }}
      >
        <Icon size={20} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-black font-dmsans-medium text-base">{title}</Text>
        <Text className="text-gray-500 font-dmsans text-sm">{subtitle}</Text>
      </View>
      <ChevronRight size={20} color="#D1D5DB" />
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#000" />
          <Text className="text-gray-500 mt-3 font-dmsans">
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
          <Text className="text-gray-600 text-center font-dmsans mb-4">
            Failed to load profile
          </Text>
          <Button
            size="md"
            className="bg-black rounded-full px-6"
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
        <View className="px-6 py-4 bg-white mb-4">
          <Heading size="2xl" className="text-black font-dmsans-bold mb-1">
            Profile
          </Heading>
          <Text className="text-gray-600 font-dmsans">
            Manage your account and settings
          </Text>
        </View>

        <View className="px-6">
          {/* Profile Card */}
          <View className="bg-white rounded-2xl p-5 mb-4">
            <View className="flex-row items-center">
              {/* Avatar - Tappable to upload */}
              <TouchableOpacity
                onPress={pickAndUploadAvatar}
                disabled={isUploading}
                className="mr-4"
                activeOpacity={0.7}
              >
                <View className="relative">
                  {profile.avatar_url ? (
                    <Image
                      source={{ uri: profile.avatar_url }}
                      style={{ width: 64, height: 64, borderRadius: 32 }}
                      contentFit="cover"
                      transition={200}
                    />
                  ) : (
                    <View className="w-16 h-16 rounded-full bg-black items-center justify-center">
                      <Text className="text-white font-dmsans-bold text-xl">
                        {getInitials(profile.full_name)}
                      </Text>
                    </View>
                  )}
                  {/* Camera icon overlay */}
                  <View className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-gray-800 items-center justify-center border-2 border-white">
                    {isUploading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Camera size={12} color="#fff" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>

              {/* Info */}
              <View className="flex-1">
                <Text className="text-black font-dmsans-bold text-lg mb-1">
                  {profile.full_name}
                </Text>
                <View className="flex-row items-center">
                  {profile.email_verified ? (
                    <>
                      <CheckCircle size={14} color="#10B981" />
                      <Text className="text-green-600 font-dmsans-medium text-sm ml-1">
                        Verified
                      </Text>
                    </>
                  ) : (
                    <Text className="text-gray-500 font-dmsans text-sm">
                      {profile.email}
                    </Text>
                  )}
                </View>
              </View>

              {/* Role Badge */}
              <View className="px-3 py-1.5 rounded-full bg-gray-100">
                <Text className="text-gray-700 font-dmsans-medium text-xs capitalize">
                  {profile.role}
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Stats for Handyman */}
          {profile.role === "handyman" && (
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1 bg-white rounded-2xl p-4">
                <View className="w-10 h-10 rounded-full bg-amber-50 items-center justify-center mb-2">
                  <Star size={18} color="#F59E0B" fill="#F59E0B" />
                </View>
                <Text className="text-gray-500 font-dmsans text-xs mb-1">
                  Rating
                </Text>
                <Text className="text-black font-dmsans-bold text-lg">
                  4.8
                </Text>
              </View>
              <View className="flex-1 bg-white rounded-2xl p-4">
                <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mb-2">
                  <Briefcase size={18} color="#3B82F6" />
                </View>
                <Text className="text-gray-500 font-dmsans text-xs mb-1">
                  Jobs Done
                </Text>
                <Text className="text-black font-dmsans-bold text-lg">
                  24
                </Text>
              </View>
            </View>
          )}

          {/* Account Section */}
          <View className="bg-white rounded-2xl px-4 mb-4">
            <MenuItem
              icon={User}
              title="Personal Information"
              subtitle="Edit your profile details"
              onPress={() => router.push("/edit-profile")}
              iconBgColor="#F3F4F6"
            />

            {profile.role === "handyman" && (
              <>
                <View className="h-px bg-gray-100" />
                <MenuItem
                  icon={Briefcase}
                  title="Professional Profile"
                  subtitle="Skills, experience & rates"
                  onPress={() => router.push("/handyman-profile")}
                  iconBgColor="#EFF6FF"
                  iconColor="#3B82F6"
                />
                <View className="h-px bg-gray-100" />
                <MenuItem
                  icon={Wallet}
                  title="Payment Methods"
                  subtitle="Mobile Money accounts"
                  onPress={() => router.push("/payment-methods")}
                  iconBgColor="#ECFDF5"
                  iconColor="#10B981"
                />
              </>
            )}
          </View>

          {/* Settings Section */}
          <View className="bg-white rounded-2xl px-4 mb-4">
            <MenuItem
              icon={Settings}
              title="Preferences"
              subtitle="Notifications & app settings"
              onPress={() => router.push("/preferences")}
              iconBgColor="#F3F4F6"
            />
            <View className="h-px bg-gray-100" />
            <MenuItem
              icon={ShieldCheck}
              title="Security"
              subtitle="Password & authentication"
              onPress={() => router.push("/security")}
              iconBgColor="#FEF3C7"
              iconColor="#D97706"
            />
            <View className="h-px bg-gray-100" />
            <MenuItem
              icon={HelpCircle}
              title="Help & Support"
              subtitle="FAQs and contact us"
              onPress={() => alert("Help & Support coming soon!")}
              iconBgColor="#F5F3FF"
              iconColor="#8B5CF6"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
