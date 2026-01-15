import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { useCountry } from "@/contexts/CountryContext";
import { useHandymanProfile } from "@/hooks/useHandymanProfile";
import { Certificate } from "@/types/profile";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Award,
  Briefcase,
  CheckCircle,
  Clock,
  Download,
  FileText,
  MapPin,
  Navigation,
  Shield,
  Star,
  XCircle,
} from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Linking,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HandymanProfile() {
  const { handymanProfile, loading, updating, refetch, updateAvailability } =
    useHandymanProfile();
  const router = useRouter();
  const { config } = useCountry();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleOpenCertificate = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        alert("Cannot open this file");
      }
    } catch (error) {
      console.error("Error opening certificate:", error);
      alert("Failed to open certificate");
    }
  };

  const handleOpenLocation = async () => {
    if (handymanProfile?.location_lat && handymanProfile?.location_lng) {
      const url = `https://www.google.com/maps/search/?api=1&query=${handymanProfile.location_lat},${handymanProfile.location_lng}`;
      try {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          alert("Cannot open maps");
        }
      } catch (error) {
        console.error("Error opening location:", error);
        alert("Failed to open location");
      }
    }
  };

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

  if (!handymanProfile) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="px-6 py-4 bg-white mb-4">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-4 p-1 -ml-1"
            >
              <ArrowLeft size={24} color="#000" />
            </TouchableOpacity>
            <View>
              <Heading size="xl" className="text-black font-dmsans-bold">
                Professional Profile
              </Heading>
            </View>
          </View>
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
            <Shield size={40} color="#9CA3AF" />
          </View>
          <Text className="text-black font-dmsans-bold text-lg mb-2">
            No Handyman Profile
          </Text>
          <Text className="text-gray-500 text-center font-dmsans mb-6">
            You haven't set up your handyman profile yet. Create one to start
            accepting jobs.
          </Text>
          <Button
            size="lg"
            className="bg-black rounded-full px-8"
            onPress={() => alert("Create handyman profile coming soon!")}
          >
            <ButtonText className="text-white font-dmsans-bold">
              Create Profile
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
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <TouchableOpacity
                onPress={() => router.back()}
                className="mr-4 p-1 -ml-1"
              >
                <ArrowLeft size={24} color="#000" />
              </TouchableOpacity>
              <View>
                <Heading size="xl" className="text-black font-dmsans-bold">
                  Professional Profile
                </Heading>
                <Text className="text-gray-500 font-dmsans text-sm">
                  Manage your work profile
                </Text>
              </View>
            </View>
            <TouchableOpacity className="px-4 py-2 bg-gray-100 rounded-full">
              <Text className="text-black font-dmsans-medium text-sm">
                Edit
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-6">
          {/* Availability Toggle */}
          <View className="bg-white rounded-2xl p-4 mb-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-4">
                <Text className="text-black font-dmsans-medium text-base mb-1">
                  Available for Work
                </Text>
                <Text className="text-gray-500 font-dmsans text-sm">
                  {handymanProfile.is_available
                    ? "You're accepting new jobs"
                    : "You're not accepting jobs"}
                </Text>
              </View>
              <Switch
                value={handymanProfile.is_available}
                onValueChange={updateAvailability}
                disabled={updating}
              />
            </View>
          </View>

          {/* Status Badges */}
          <View className="flex-row gap-3 mb-4">
            <View
              className={`flex-1 rounded-2xl p-4 ${
                handymanProfile.is_verified ? "bg-green-50" : "bg-gray-100"
              }`}
            >
              <View className="flex-row items-center">
                {handymanProfile.is_verified ? (
                  <CheckCircle size={18} color="#10B981" />
                ) : (
                  <XCircle size={18} color="#9CA3AF" />
                )}
                <Text
                  className={`ml-2 font-dmsans-medium text-sm ${
                    handymanProfile.is_verified
                      ? "text-green-700"
                      : "text-gray-600"
                  }`}
                >
                  {handymanProfile.is_verified ? "Verified" : "Unverified"}
                </Text>
              </View>
            </View>

            <View
              className={`flex-1 rounded-2xl p-4 ${
                handymanProfile.certified ? "bg-blue-50" : "bg-gray-100"
              }`}
            >
              <View className="flex-row items-center">
                <Award
                  size={18}
                  color={handymanProfile.certified ? "#3B82F6" : "#9CA3AF"}
                />
                <Text
                  className={`ml-2 font-dmsans-medium text-sm ${
                    handymanProfile.certified
                      ? "text-blue-700"
                      : "text-gray-600"
                  }`}
                >
                  {handymanProfile.certified ? "Certified" : "No Certs"}
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Stats */}
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1 bg-white rounded-2xl p-4">
              <View className="w-10 h-10 rounded-full bg-amber-50 items-center justify-center mb-2">
                <Star size={18} color="#F59E0B" fill="#F59E0B" />
              </View>
              <Text className="text-gray-500 font-dmsans text-xs mb-1">
                Rating
              </Text>
              <Text className="text-black font-dmsans-bold text-lg">
                {handymanProfile.rating?.toFixed(1) || "0.0"}
              </Text>
            </View>

            <View className="flex-1 bg-white rounded-2xl p-4">
              <View className="w-10 h-10 rounded-full bg-green-50 items-center justify-center mb-2">
                <Text className="text-green-600 font-dmsans-bold text-sm">
                  {config.currency.code}
                </Text>
              </View>
              <Text className="text-gray-500 font-dmsans text-xs mb-1">
                Hourly Rate
              </Text>
              <Text className="text-black font-dmsans-bold text-lg">
                {handymanProfile.hourly_rate || 0}
              </Text>
            </View>

            <View className="flex-1 bg-white rounded-2xl p-4">
              <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mb-2">
                <Briefcase size={18} color="#3B82F6" />
              </View>
              <Text className="text-gray-500 font-dmsans text-xs mb-1">
                Jobs
              </Text>
              <Text className="text-black font-dmsans-bold text-lg">
                {handymanProfile.total_jobs || 0}
              </Text>
            </View>
          </View>

          {/* Bio Section */}
          {handymanProfile.bio && (
            <View className="bg-white rounded-2xl p-4 mb-4">
              <Text className="text-black font-dmsans-medium text-base mb-2">
                About
              </Text>
              <Text className="text-gray-600 font-dmsans text-sm leading-5">
                {handymanProfile.bio}
              </Text>
            </View>
          )}

          {/* Professional Details */}
          <View className="bg-white rounded-2xl px-4 mb-4">
            {/* Experience */}
            <View className="flex-row items-center py-4">
              <View className="w-11 h-11 rounded-full bg-purple-50 items-center justify-center mr-4">
                <Clock size={20} color="#8B5CF6" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 font-dmsans text-xs mb-0.5">
                  Experience
                </Text>
                <Text className="text-black font-dmsans-medium text-base">
                  {handymanProfile.years_experience}{" "}
                  {handymanProfile.years_experience === 1 ? "year" : "years"}
                </Text>
              </View>
            </View>

            <View className="h-px bg-gray-100" />

            {/* Service Radius */}
            <View className="flex-row items-center py-4">
              <View className="w-11 h-11 rounded-full bg-orange-50 items-center justify-center mr-4">
                <MapPin size={20} color="#F97316" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 font-dmsans text-xs mb-0.5">
                  Service Radius
                </Text>
                <Text className="text-black font-dmsans-medium text-base">
                  {handymanProfile.service_radius} km
                </Text>
              </View>
            </View>

            {/* Location */}
            {handymanProfile.location_lat && handymanProfile.location_lng && (
              <>
                <View className="h-px bg-gray-100" />
                <TouchableOpacity
                  onPress={handleOpenLocation}
                  activeOpacity={0.6}
                  className="flex-row items-center py-4"
                >
                  <View className="w-11 h-11 rounded-full bg-blue-50 items-center justify-center mr-4">
                    <Navigation size={20} color="#3B82F6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-500 font-dmsans text-xs mb-0.5">
                      Current Location
                    </Text>
                    <Text className="text-blue-600 font-dmsans-medium text-base">
                      View on map
                    </Text>
                  </View>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Certificates */}
          {handymanProfile.certificates &&
            handymanProfile.certificates.length > 0 && (
              <View className="bg-white rounded-2xl p-4 mb-4">
                <View className="flex-row items-center mb-4">
                  <Award size={20} color="#000" />
                  <Text className="text-black font-dmsans-medium text-base ml-2">
                    Certificates
                  </Text>
                  <View className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full">
                    <Text className="text-gray-600 font-dmsans-medium text-xs">
                      {handymanProfile.certificates.length}
                    </Text>
                  </View>
                </View>

                <View className="gap-2">
                  {handymanProfile.certificates.map(
                    (cert: Certificate, index: number) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleOpenCertificate(cert.url)}
                        className="flex-row items-center p-3 bg-gray-50 rounded-xl"
                        activeOpacity={0.6}
                      >
                        <View className="w-10 h-10 rounded-lg bg-blue-100 items-center justify-center mr-3">
                          <FileText size={18} color="#3B82F6" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-black font-dmsans-medium text-sm mb-0.5">
                            {cert.name}
                          </Text>
                          <Text className="text-gray-400 font-dmsans text-xs">
                            {formatFileSize(cert.size)} • {cert.file_type}
                          </Text>
                        </View>
                        <Download size={18} color="#9CA3AF" />
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </View>
            )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
