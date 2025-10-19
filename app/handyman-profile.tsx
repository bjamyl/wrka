import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useHandymanProfile } from "@/hooks/useHandymanProfile";
import { Certificate } from "@/types/profile";
import { useRouter } from "expo-router";
import { ArrowLeft, Award, CheckCircle, Clock, DollarSign, Download, FileText, MapPin, Shield, Star, XCircle } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Linking, RefreshControl, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HandymanProfile() {
  const { handymanProfile, loading, updating, refetch, updateAvailability } = useHandymanProfile();
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, []);

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

  const InfoCard = ({
    icon: Icon,
    label,
    value,
    valueColor = "text-gray-900"
  }: {
    icon: any;
    label: string;
    value: string | number;
    valueColor?: string;
  }) => (
    <View className="flex-1 bg-white rounded-2xl border border-gray-200 p-4">
      <VStack space="sm">
        <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
          <Icon size={20} color="#6B7280" />
        </View>
        <VStack space="xs">
          <Text size="xs" className="text-gray-500 font-dmsans">
            {label}
          </Text>
          <Text size="lg" className={`${valueColor} font-dmsans-bold`}>
            {value}
          </Text>
        </VStack>
      </VStack>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#000" />
          <Text size="sm" className="text-gray-600 mt-4 font-dmsans">
            Loading handyman profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!handymanProfile) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-gray-50">
        <View className="px-6 py-4 border-b border-gray-200 bg-white">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-4 p-2 -ml-2"
            >
              <ArrowLeft size={24} color="#000" />
            </TouchableOpacity>
            <Heading size="xl" className="text-black font-dmsans-bold">
              Handyman Profile
            </Heading>
          </View>
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <Shield size={64} color="#9CA3AF" />
          <Text size="lg" className="text-gray-900 font-dmsans-bold mt-4 text-center">
            No Handyman Profile
          </Text>
          <Text size="sm" className="text-gray-600 text-center mt-2 font-dmsans">
            You haven&apos;t set up your handyman profile yet. Create one to start accepting jobs.
          </Text>
          <Button
            size="lg"
            className="bg-black rounded-full mt-6"
            onPress={() => {
              // TODO: Navigate to create handyman profile
              alert("Create handyman profile coming soon!");
            }}
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
        <View className="px-6 py-4 border-b border-gray-200 bg-white">
          <View className="flex-row items-center justify-between mb-2">
            <HStack space="md" className="items-center flex-1">
              <TouchableOpacity
                onPress={() => router.back()}
                className="p-2 -ml-2"
              >
                <ArrowLeft size={24} color="#000" />
              </TouchableOpacity>
              <Heading size="xl" className="text-black font-dmsans-bold">
                Handyman Profile
              </Heading>
            </HStack>
            <TouchableOpacity className="p-2">
              <Text size="sm" className="text-black font-dmsans-medium">
                Edit
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-6 mt-6">
          {/* Availability Toggle */}
          <View className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
            <HStack space="md" className="items-center justify-between">
              <VStack space="xs" className="flex-1">
                <Text size="md" className="text-gray-900 font-dmsans-bold">
                  Availability Status
                </Text>
                <Text size="sm" className="text-gray-600 font-dmsans">
                  {handymanProfile.is_available
                    ? "You are currently accepting new jobs"
                    : "You are not accepting new jobs"}
                </Text>
              </VStack>
              <Switch
                value={handymanProfile.is_available}
                onValueChange={updateAvailability}
                disabled={updating}
              />
            </HStack>
          </View>

          {/* Verification Status Badges */}
          <HStack space="md" className="mb-4">
            <View className={`flex-1 ${handymanProfile.is_verified ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'} border rounded-2xl p-4`}>
              <HStack space="sm" className="items-center">
                {handymanProfile.is_verified ? (
                  <CheckCircle size={18} color="#10B981" />
                ) : (
                  <XCircle size={18} color="#9CA3AF" />
                )}
                <VStack space="xs" className="flex-1">
                  <Text size="sm" className={`${handymanProfile.is_verified ? 'text-green-700' : 'text-gray-700'} font-dmsans-bold`}>
                    {handymanProfile.is_verified ? 'Verified' : 'Not Verified'}
                  </Text>
                  <Text size="xs" className={`${handymanProfile.is_verified ? 'text-green-600' : 'text-gray-500'} font-dmsans`}>
                    {handymanProfile.is_verified ? 'Admin verified' : 'Pending verification'}
                  </Text>
                </VStack>
              </HStack>
            </View>

            <View className={`flex-1 ${handymanProfile.certified ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'} border rounded-2xl p-4`}>
              <HStack space="sm" className="items-center">
                {handymanProfile.certified ? (
                  <Award size={18} color="#3B82F6" />
                ) : (
                  <Award size={18} color="#9CA3AF" />
                )}
                <VStack space="xs" className="flex-1">
                  <Text size="sm" className={`${handymanProfile.certified ? 'text-blue-700' : 'text-gray-700'} font-dmsans-bold`}>
                    {handymanProfile.certified ? 'Certified' : 'Not Certified'}
                  </Text>
                  <Text size="xs" className={`${handymanProfile.certified ? 'text-blue-600' : 'text-gray-500'} font-dmsans`}>
                    {handymanProfile.certified ? 'Has certificates' : 'No certificates'}
                  </Text>
                </VStack>
              </HStack>
            </View>
          </HStack>

          {/* Quick Stats */}
          <HStack space="md" className="mb-6">
            <InfoCard
              icon={Star}
              label="Rating"
              value={handymanProfile.rating.toFixed(1)}
              valueColor="text-yellow-600"
            />
            <InfoCard
              icon={DollarSign}
              label="Hourly Rate"
              value={`$${handymanProfile.hourly_rate}`}
              valueColor="text-green-600"
            />
          </HStack>

          {/* Bio Section */}
          {handymanProfile.bio && (
            <View className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
              <Text size="md" className="text-gray-900 font-dmsans-bold mb-3">
                About
              </Text>
              <Text size="sm" className="text-gray-700 font-dmsans leading-6">
                {handymanProfile.bio}
              </Text>
            </View>
          )}

          {/* Professional Info */}
          <View className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
            <Text size="md" className="text-gray-900 font-dmsans-bold mb-4">
              Professional Information
            </Text>

            <VStack space="md">
              <HStack space="md" className="items-center">
                <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
                  <Clock size={20} color="#6B7280" />
                </View>
                <VStack space="xs" className="flex-1">
                  <Text size="xs" className="text-gray-500 font-dmsans">
                    Experience
                  </Text>
                  <Text size="sm" className="text-gray-900 font-dmsans-medium">
                    {handymanProfile.years_experience} {handymanProfile.years_experience === 1 ? 'year' : 'years'}
                  </Text>
                </VStack>
              </HStack>

              <HStack space="md" className="items-center">
                <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
                  <MapPin size={20} color="#6B7280" />
                </View>
                <VStack space="xs" className="flex-1">
                  <Text size="xs" className="text-gray-500 font-dmsans">
                    Service Radius
                  </Text>
                  <Text size="sm" className="text-gray-900 font-dmsans-medium">
                    {handymanProfile.service_radius} km
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </View>

          {/* Certificates */}
          {handymanProfile.certificates && handymanProfile.certificates.length > 0 && (
            <View className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
              <HStack space="sm" className="items-center mb-3">
                <Award size={20} color="#000" />
                <Text size="md" className="text-gray-900 font-dmsans-bold">
                  Certificates ({handymanProfile.certificates.length})
                </Text>
              </HStack>

              <VStack space="sm">
                {handymanProfile.certificates.map((cert: Certificate, index: number) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleOpenCertificate(cert.url)}
                    className="p-3 border border-gray-200 rounded-xl bg-gray-50"
                    activeOpacity={0.7}
                  >
                    <HStack space="md" className="items-center">
                      <View className="w-10 h-10 rounded-lg bg-blue-100 items-center justify-center">
                        <FileText size={20} color="#3B82F6" />
                      </View>
                      <VStack space="xs" className="flex-1">
                        <Text size="sm" className="text-gray-900 font-dmsans-medium">
                          {cert.name}
                        </Text>
                        <HStack space="sm">
                          <Text size="xs" className="text-gray-500 font-dmsans">
                            {formatFileSize(cert.size)}
                          </Text>
                          <Text size="xs" className="text-gray-400 font-dmsans">
                            •
                          </Text>
                          <Text size="xs" className="text-gray-500 font-dmsans">
                            {cert.file_type}
                          </Text>
                        </HStack>
                      </VStack>
                      <Download size={18} color="#6B7280" />
                    </HStack>
                  </TouchableOpacity>
                ))}
              </VStack>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
