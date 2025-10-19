import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Calendar, ChevronLeft, Clock, DollarSign, MapPin, Star, User, Wrench, AlertCircle } from "lucide-react-native";
import * as LucideIcons from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Image, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { ServiceRequestWithDetails } from "@/types/service";
import { Skeleton } from "@/components/ui/Skeleton";

// Dynamically get icon component from Lucide by name
const getIconComponent = (iconName: string) => {
  const Icon = (LucideIcons as any)[iconName];
  return Icon || Wrench; // Fallback to Wrench if icon not found
};

const fetchServiceRequestDetails = async (requestId: string): Promise<ServiceRequestWithDetails> => {
  const { data, error } = await supabase
    .from('service_requests')
    .select(
      `
      *,
      customer:profiles!customer_id(
        id,
        full_name,
        avatar_url,
        phone_number
      ),
      category:service_categories!category_id(
        id,
        name,
        icon_name,
        color
      )
    `
    )
    .eq('id', requestId)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Service request not found');

  return {
    ...data,
    customer: data.customer ? {
      id: data.customer.id,
      full_name: data.customer.full_name,
      avatar_url: data.customer.avatar_url,
      phone_number: data.customer.phone_number,
    } : undefined,
    category: data.category || undefined,
  };
};

export default function JobDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const requestId = params.requestId as string;

  const { data: request, isLoading, error } = useQuery({
    queryKey: ['service-request', requestId],
    queryFn: () => fetchServiceRequestDetails(requestId),
    enabled: !!requestId,
  });

  const handleAcceptJob = () => {
    console.log("Accepting job:", requestId);
    // TODO: Implement accept job logic
    router.back();
  };

  const handleDeclineJob = () => {
    console.log("Declining job:", requestId);
    router.back();
  };

  // Format time ago
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // Format full date and time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);

    // Format: "Mon, Jan 15, 2025 at 2:30 PM"
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };

    return date.toLocaleString('en-US', options);
  };

  if (isLoading) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-white">
        <View className="px-6 py-4 flex-row items-center border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ChevronLeft size={24} color="#000" />
          </TouchableOpacity>
          <Heading size="lg" className="text-black">Job Details</Heading>
        </View>
        <View className="flex-1 px-6 pt-6">
          <Skeleton width="40%" height={24} style={{ marginBottom: 16 }} />
          <Skeleton width="100%" height={32} style={{ marginBottom: 8 }} />
          <Skeleton width="80%" height={32} style={{ marginBottom: 24 }} />
          <Skeleton width="100%" height={120} style={{ marginBottom: 16 }} />
          <Skeleton width="100%" height={80} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !request) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="px-6 py-4 flex-row items-center border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ChevronLeft size={24} color="#000" />
          </TouchableOpacity>
          <Heading size="lg" className="text-black">Job Details</Heading>
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Job not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isUrgent = request.priority === 'urgent';
  const priorityConfig = {
    urgent: { bg: 'bg-red-50', text: 'text-red-600', label: 'Urgent' },
    normal: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Normal' },
    low: { bg: 'bg-gray-50', text: 'text-gray-600', label: 'Low Priority' },
  };
  const priority = priorityConfig[request.priority];

  const statusConfig = {
    pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Pending' },
    accepted: { bg: 'bg-green-50', text: 'text-green-700', label: 'Accepted' },
    rejected: { bg: 'bg-red-50', text: 'text-red-700', label: 'Rejected' },
    completed: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Completed' },
    cancelled: { bg: 'bg-gray-50', text: 'text-gray-700', label: 'Cancelled' },
  };
  const statusBadge = statusConfig[request.status];

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
          {/* Estimated Cost - Prominent at Top */}
          {request.estimated_cost && (
            <View className="bg-green-50 rounded-2xl p-6 mb-6 border-2 border-green-200">
              <Text className="text-green-700 text-xs font-dmsans-bold mb-2">ESTIMATED COST</Text>
              <View className="flex-row items-baseline gap-1">
                <Text className="text-green-900 font-dmsans-bold text-4xl">₵{request.estimated_cost}</Text>
                <Text className="text-green-600 text-sm font-dmsans">GHS</Text>
              </View>
            </View>
          )}

          {/* Category & Priority Badges */}
          <View className="flex-row items-center gap-2 mb-4">
            {request.category && (
              <View
                className="px-3 py-2 rounded-full flex-row items-center gap-2"
                style={{ backgroundColor: `${request.category.color}15` }}
              >
                {React.createElement(getIconComponent(request.category.icon_name), {
                  size: 16,
                  color: request.category.color,
                })}
                <Text
                  className="font-dmsans-bold text-xs"
                  style={{ color: request.category.color }}
                >
                  {request.category.name}
                </Text>
              </View>
            )}

            <View className={`px-3 py-2 rounded-full ${priority.bg}`}>
              <Text className={`${priority.text} font-dmsans-bold text-xs`}>{priority.label}</Text>
            </View>

            <View className={`px-3 py-2 rounded-full ${statusBadge.bg}`}>
              <Text className={`${statusBadge.text} font-dmsans-bold text-xs`}>{statusBadge.label}</Text>
            </View>
          </View>

          {/* Job Title */}
          <Heading size="2xl" className="text-black mb-2 font-dmsans-bold">
            {request.title}
          </Heading>

          {/* Location & Posted Time */}
          <View className="mb-6">
            <View className="flex-row items-center gap-1 mb-2">
              <MapPin size={16} color="#6B7280" />
              <Text className="text-gray-600 text-sm font-dmsans flex-1">{request.location_address}</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Clock size={16} color="#6B7280" />
              <Text className="text-gray-600 text-sm font-dmsans">Posted {getTimeAgo(request.created_at)}</Text>
            </View>
          </View>

          {/* Scheduled Time - Full Width, Not Squished */}
          {request.scheduled_time && (
            <View className="bg-blue-50 rounded-2xl p-4 mb-6 border border-blue-200">
              <View className="flex-row items-center gap-2 mb-2">
                <Calendar size={18} color="#3B82F6" />
                <Text className="text-blue-700 text-xs font-dmsans-bold">SCHEDULED FOR</Text>
              </View>
              <Text className="text-blue-900 font-dmsans-bold text-lg">
                {formatDateTime(request.scheduled_time)}
              </Text>
            </View>
          )}

          {/* Customer Info */}
          {request.customer && (
            <View className="bg-gray-50 rounded-2xl p-4 mb-6">
              <Text className="text-gray-500 text-xs font-dmsans-bold mb-3">CUSTOMER INFORMATION</Text>
              <View className="flex-row items-center gap-3">
                <View className="w-12 h-12 rounded-full bg-gray-300 items-center justify-center">
                  {request.customer.avatar_url ? (
                    <Image
                      source={{ uri: request.customer.avatar_url }}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <User size={24} color="#6B7280" />
                  )}
                </View>
                <View className="flex-1">
                  <Heading size="sm" className="text-black mb-1 font-dmsans-bold">
                    {request.customer.full_name}
                  </Heading>
                  {request.customer.phone_number && (
                    <Text className="text-gray-600 text-sm font-dmsans">
                      {request.customer.phone_number}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Job Description */}
          <View className="mb-6">
            <Text className="text-gray-500 text-xs font-dmsans-bold mb-3">JOB DESCRIPTION</Text>
            <Text className="text-gray-700 text-base leading-6 font-dmsans">
              {request.description}
            </Text>
          </View>

          {/* Additional Details - Only show if there's content */}
          {(request.service_type || request.distance_km !== undefined || request.location_lat || request.location_lng) && (
            <View className="mb-6">
              <Text className="text-gray-500 text-xs font-dmsans-bold mb-3">ADDITIONAL DETAILS</Text>
              <View className="gap-3">
                {request.service_type && (
                  <View className="bg-gray-50 rounded-xl p-4">
                    <Text className="text-gray-500 text-xs font-dmsans mb-1">Service Type</Text>
                    <Text className="text-black font-dmsans-bold text-base">{request.service_type}</Text>
                  </View>
                )}

                {request.distance_km !== undefined && (
                  <View className="bg-gray-50 rounded-xl p-4">
                    <View className="flex-row items-center gap-2 mb-1">
                      <MapPin size={16} color="#6B7280" />
                      <Text className="text-gray-500 text-xs font-dmsans">Distance from You</Text>
                    </View>
                    <Text className="text-black font-dmsans-bold text-base">{request.distance_km} km away</Text>
                  </View>
                )}

                {(request.location_lat && request.location_lng) && (
                  <View className="bg-gray-50 rounded-xl p-4">
                    <View className="flex-row items-center gap-2 mb-1">
                      <MapPin size={16} color="#6B7280" />
                      <Text className="text-gray-500 text-xs font-dmsans">Location Coordinates</Text>
                    </View>
                    <Text className="text-black font-dmsans-bold text-sm">
                      {request.location_lat.toFixed(6)}, {request.location_lng.toFixed(6)}
                    </Text>
                  </View>
                )}
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
