import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetScrollView,
} from "@/components/ui/actionsheet";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Calendar, Clock, DollarSign, MapPin, Star, User } from "lucide-react-native";
import { Image, TouchableOpacity, View } from "react-native";

interface JobDetailsBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  job: {
    id: string;
    title: string;
    category: string;
    description: string;
    payment: number;
    distance: string;
    timeAgo: string;
    urgent: boolean;
    location: string;
    fullDescription?: string;
    preferredDate?: string;
    estimatedDuration?: string;
    customer?: {
      name: string;
      rating: number;
      completedJobs: number;
      photo?: string;
    };
    photos?: string[];
    requirements?: string[];
  } | null;
  onAccept?: () => void;
  onDecline?: () => void;
}

export default function JobDetailsBottomSheet({
  isOpen,
  onClose,
  job,
  onAccept,
  onDecline,
}: JobDetailsBottomSheetProps) {
  return (
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent  className="max-h-[90%]">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>

        <ActionsheetScrollView className="w-full px-6">
      
          <View className="mb-6">
            {job?.urgent && (
              <View className="bg-red-50 px-3 py-1.5 rounded-full self-start mb-3">
                <Text className="text-red-600 font-semibold text-xs">Urgent Request</Text>
              </View>
            )}

            <Heading size="xl" className="text-black mb-2">
              {job?.title}
            </Heading>

            <View className="flex-row items-center gap-4">
              <View className="flex-row items-center gap-1">
                <MapPin size={16} color="#6B7280" />
                <Text className="text-gray-600 text-sm">{job?.location}</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Clock size={16} color="#6B7280" />
                <Text className="text-gray-600 text-sm">{job?.timeAgo}</Text>
              </View>
            </View>
          </View>

     
          {job?.customer && (
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

          
          <View className="mb-6">
            <Text className="text-gray-500 text-xs font-semibold mb-3">JOB DESCRIPTION</Text>
            <Text className="text-gray-700 text-base leading-6">
              {job?.fullDescription || job?.description}
            </Text>
          </View>

       
          {job?.photos && job.photos.length > 0 && (
            <View className="mb-6">
              <Text className="text-gray-500 text-xs font-semibold mb-3">PHOTOS</Text>
              <View className="flex-row gap-3">
                {job.photos.map((photo, index) => (
                  <Image
                    key={index}
                    source={{ uri: photo }}
                    className="w-24 h-24 rounded-xl"
                  />
                ))}
              </View>
            </View>
          )}

     
          <View className="mb-6">
            <Text className="text-gray-500 text-xs font-semibold mb-3">JOB DETAILS</Text>
            <View className="flex-row flex-wrap gap-3">
              {job?.preferredDate && (
                <View className="flex-1 min-w-[45%] bg-gray-50 rounded-xl p-3">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Calendar size={16} color="#6B7280" />
                    <Text className="text-gray-500 text-xs">Preferred Date</Text>
                  </View>
                  <Text className="text-black font-semibold">{job.preferredDate}</Text>
                </View>
              )}

              {job?.estimatedDuration && (
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
                <Text className="text-black font-semibold">{job?.distance} away</Text>
              </View>

              <View className="flex-1 min-w-[45%] bg-gray-50 rounded-xl p-3">
                <View className="flex-row items-center gap-2 mb-1">
                  <DollarSign size={16} color="#10B981" />
                  <Text className="text-gray-500 text-xs">Payment</Text>
                </View>
                <Text className="text-black font-semibold">${job?.payment}</Text>
              </View>
            </View>
          </View>

        
          {job?.requirements && job.requirements.length > 0 && (
            <View className="mb-6">
              <Text className="text-gray-500 text-xs font-semibold mb-3">REQUIREMENTS</Text>
              <View className="gap-2">
                {job.requirements.map((req, index) => (
                  <View key={index} className="flex-row items-center gap-2">
                    <View className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    <Text className="text-gray-700 flex-1">{req}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View className="flex-row gap-3 pb-8 pt-4">
            <TouchableOpacity
              onPress={() => {
                onDecline?.();
                onClose();
              }}
              className="flex-1 bg-gray-100 py-4 rounded-full items-center"
            >
              <Text className="text-black font-bold">Decline</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onAccept?.();
                onClose();
              }}
              className="flex-1 bg-black py-4 rounded-full items-center"
            >
              <Text className="text-white font-bold">Accept Job</Text>
            </TouchableOpacity>
          </View>
        </ActionsheetScrollView>
      </ActionsheetContent>
    </Actionsheet>
  );
}
