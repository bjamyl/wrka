import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Calendar, ChevronLeft, Clock, DollarSign, MapPin, Star, User } from "lucide-react-native";
import { Image, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function JobDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse the job data from params
  const job = params.job ? JSON.parse(params.job as string) : null;

  const handleAcceptJob = () => {
    console.log("Accepting job:", job?.id);
    // TODO: Implement accept job logic
    router.back();
  };

  const handleDeclineJob = () => {
    console.log("Declining job:", job?.id);
    router.back();
  };

  if (!job) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Job not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Heading size="lg" className="text-black">Job Details</Heading>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="px-6 pt-6">
          {/* Urgent Badge */}
          {job.urgent && (
            <View className="bg-red-50 px-3 py-1.5 rounded-full self-start mb-3">
              <Text className="text-red-600 font-semibold text-xs">Urgent Request</Text>
            </View>
          )}

          {/* Job Title & Location */}
          <Heading size="2xl" className="text-black mb-3">
            {job.title}
          </Heading>

          <View className="flex-row items-center gap-4 mb-6">
            <View className="flex-row items-center gap-1">
              <MapPin size={16} color="#6B7280" />
              <Text className="text-gray-600 text-sm">{job.location}</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Clock size={16} color="#6B7280" />
              <Text className="text-gray-600 text-sm">{job.timeAgo}</Text>
            </View>
          </View>

          {/* Customer Info */}
          {job.customer && (
            <View className="bg-gray-50 rounded-2xl p-4 mb-6">
              <Text className="text-gray-500 text-xs font-semibold mb-3">CUSTOMER</Text>
              <View className="flex-row items-center gap-3">
                <View className="w-12 h-12 rounded-full bg-gray-300 items-center justify-center">
                  {job.customer.photo ? (
                    <Image
                      source={{ uri: job.customer.photo }}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <User size={24} color="#6B7280" />
                  )}
                </View>
                <View className="flex-1">
                  <Heading size="sm" className="text-black mb-1">
                    {job.customer.name}
                  </Heading>
                  <View className="flex-row items-center gap-3">
                    <View className="flex-row items-center gap-1">
                      <Star size={14} color="#F59E0B" fill="#F59E0B" />
                      <Text className="text-gray-600 text-sm">{job.customer.rating}</Text>
                    </View>
                    <Text className="text-gray-500 text-sm">
                      {job.customer.completedJobs} jobs completed
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Job Description */}
          <View className="mb-6">
            <Text className="text-gray-500 text-xs font-semibold mb-3">JOB DESCRIPTION</Text>
            <Text className="text-gray-700 text-base leading-6">
              {job.fullDescription || job.description}
            </Text>
          </View>

          {/* Photos */}
          {job.photos && job.photos.length > 0 && (
            <View className="mb-6">
              <Text className="text-gray-500 text-xs font-semibold mb-3">PHOTOS</Text>
              <View className="flex-row gap-3">
                {job.photos.map((photo: string, index: number) => (
                  <Image
                    key={index}
                    source={{ uri: photo }}
                    className="w-24 h-24 rounded-xl"
                  />
                ))}
              </View>
            </View>
          )}

          {/* Job Details */}
          <View className="mb-6">
            <Text className="text-gray-500 text-xs font-semibold mb-3">JOB DETAILS</Text>
            <View className="flex-row flex-wrap gap-3">
              {job.preferredDate && (
                <View className="flex-1 min-w-[45%] bg-gray-50 rounded-xl p-3">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Calendar size={16} color="#6B7280" />
                    <Text className="text-gray-500 text-xs">Preferred Date</Text>
                  </View>
                  <Text className="text-black font-semibold">{job.preferredDate}</Text>
                </View>
              )}

              {job.estimatedDuration && (
                <View className="flex-1 min-w-[45%] bg-gray-50 rounded-xl p-3">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Clock size={16} color="#6B7280" />
                    <Text className="text-gray-500 text-xs">Duration</Text>
                  </View>
                  <Text className="text-black font-semibold">{job.estimatedDuration}</Text>
                </View>
              )}

              <View className="flex-1 min-w-[45%] bg-gray-50 rounded-xl p-3">
                <View className="flex-row items-center gap-2 mb-1">
                  <MapPin size={16} color="#6B7280" />
                  <Text className="text-gray-500 text-xs">Distance</Text>
                </View>
                <Text className="text-black font-semibold">{job.distance} away</Text>
              </View>

              <View className="flex-1 min-w-[45%] bg-gray-50 rounded-xl p-3">
                <View className="flex-row items-center gap-2 mb-1">
                  <DollarSign size={16} color="#10B981" />
                  <Text className="text-gray-500 text-xs">Payment</Text>
                </View>
                <Text className="text-black font-semibold">${job.payment}</Text>
              </View>
            </View>
          </View>

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <View className="mb-6">
              <Text className="text-gray-500 text-xs font-semibold mb-3">REQUIREMENTS</Text>
              <View className="gap-2">
                {job.requirements.map((req: string, index: number) => (
                  <View key={index} className="flex-row items-center gap-2">
                    <View className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    <Text className="text-gray-700 flex-1">{req}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Fixed Bottom Action Buttons */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4">
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={handleDeclineJob}
            className="flex-1 bg-gray-100 py-4 rounded-full items-center"
          >
            <Text className="text-black font-bold">Decline</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleAcceptJob}
            className="flex-1 bg-black py-4 rounded-full items-center"
          >
            <Text className="text-white font-bold">Accept Job</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
