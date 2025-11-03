import JobInProgressCard from "@/components/jobs/JobInProgressCard";
import StartJobSheet from "@/components/jobs/StartJobSheet";
import { Heading } from "@/components/ui/heading";
import { Skeleton } from "@/components/ui/Skeleton";
import { Text } from "@/components/ui/text";
import { useServiceRequests } from "@/hooks/useServiceRequests";
import { useStartJobStore } from "@/lib/state/jobs";
import { supabase } from "@/lib/supabase";
import { formatDateTime, getTimeAgo } from "@/lib/utils";
import { ServiceRequestWithDetails } from "@/types/service";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as LucideIcons from "lucide-react-native";
import {
  Calendar,
  ChevronLeft,
  Clock,
  MapPin,
  User,
  Wrench,
} from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Alert, Image, ScrollView, TouchableOpacity, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

// Dynamically get icon component from Lucide by name
const getIconComponent = (iconName: string) => {
  const Icon = (LucideIcons as any)[iconName];
  return Icon || Wrench; // Fallback to Wrench if icon not found
};

const fetchServiceRequestDetails = async (
  requestId: string
): Promise<ServiceRequestWithDetails> => {
  const { data, error } = await supabase
    .from("service_requests")
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
    .eq("id", requestId)
    .single();

  if (error) throw error;
  if (!data) throw new Error("Service request not found");

  return {
    ...data,
    customer: data.customer
      ? {
          id: data.customer.id,
          full_name: data.customer.full_name,
          avatar_url: data.customer.avatar_url,
          phone_number: data.customer.phone_number,
        }
      : undefined,
    category: data.category || undefined,
  };
};

export default function JobDetails() {
  const {setShowStartJob, isStarting} = useStartJobStore()
  const router = useRouter();
  const params = useLocalSearchParams();
  const requestId = params.requestId as string;

  const {
    acceptRequestAsync,
    isAccepting,
    acceptError,
    declineRequestAsync,
    isDeclining,
    declineError,
  } = useServiceRequests();

  const {
    data: request,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["service-request", requestId],
    queryFn: () => fetchServiceRequestDetails(requestId),
    enabled: !!requestId,
  });

  const handleAcceptJob = async () => {
    try {
      await acceptRequestAsync(requestId);
      Alert.alert(
        "Success",
        "Job accepted successfully!",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (err) {
      Alert.alert(
        "Error",
        acceptError || "Failed to accept job. It may have been taken by another handyman.",
        [{ text: "OK" }]
      );
    }
  };

  const handleDeclineJob = async () => {
    Alert.alert(
      "Decline Job",
      "Are you sure you want to decline this job?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Decline",
          style: "destructive",
          onPress: async () => {
            try {
              await declineRequestAsync(requestId);
              router.back();
            } catch (err) {
              Alert.alert(
                "Error",
                declineError || "Failed to decline job. Please try again.",
                [{ text: "OK" }]
              );
            }
          },
        },
      ]
    );
  };

  const handleCancelJob = async () => {
    Alert.alert(
      "Cancel Job",
      "Are you sure you want to cancel this job? This action cannot be undone.",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              // Cancel job by setting status to cancelled
              const { error } = await supabase
                .from("service_requests")
                .update({ status: "cancelled" })
                .eq("id", requestId)
                .eq("status", "accepted");

              if (error) throw error;

              Alert.alert(
                "Job Cancelled",
                "The job has been cancelled successfully.",
                [
                  {
                    text: "OK",
                    onPress: () => router.back(),
                  },
                ]
              );
            } catch (err) {
              Alert.alert(
                "Error",
                "Failed to cancel job. Please try again.",
                [{ text: "OK" }]
              );
            }
          },
        },
      ]
    );
  };

  const handleJobFinished = () => {
    refetch();
    router.back();
  };

  if (isLoading) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-white">
        <View className="px-6 py-4 flex-row items-center border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ChevronLeft size={24} color="#000" />
          </TouchableOpacity>
          <Heading size="lg" className="text-black">
            Job Details
          </Heading>
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
          <Heading size="lg" className="text-black">
            Job Details
          </Heading>
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Job not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const priorityConfig = {
    urgent: { bg: "bg-red-50", text: "text-red-600", label: "Urgent" },
    normal: { bg: "bg-blue-50", text: "text-blue-600", label: "Normal" },
    low: { bg: "bg-gray-50", text: "text-gray-600", label: "Low Priority" },
  };
  const priority = priorityConfig[request.priority];

  const statusConfig = {
    pending: { bg: "bg-yellow-50", text: "text-yellow-700", label: "Pending" },
    accepted: { bg: "bg-green-50", text: "text-green-700", label: "Accepted" },
    in_progress: { bg: "bg-blue-50", text: "text-blue-700", label: "In Progress" },
    rejected: { bg: "bg-red-50", text: "text-red-700", label: "Rejected" },
    completed: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      label: "Completed",
    },
    cancelled: { bg: "bg-gray-50", text: "text-gray-700", label: "Cancelled" },
  };
  const statusBadge = statusConfig[request.status];

  const hasValidCoordinates = request.location_lat && request.location_lng;
  const isProcessing = isAccepting || isDeclining;
  const showActionButtons = request.status === 'pending' || request.status === 'accepted';
  const isInProgress = request.status === 'in_progress';

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Heading size="xl" className="text-black font-dmsans-bold">
          Job Details
        </Heading>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: showActionButtons ? 120 : 20 }}
      >
        {isInProgress && request.started_at && (
          <View className="pt-6">
            <JobInProgressCard
              requestId={request.id}
              startedAt={request.started_at}
              onJobFinished={handleJobFinished}
            />
          </View>
        )}

        <View className="px-6 pt-6">
          {/* Category & Priority Badges */}
          <View className="flex-row items-center gap-2 mb-4">
            {request.category && (
              <View
                className="px-3 py-2 rounded-full flex-row items-center gap-2"
                style={{ backgroundColor: `${request.category.color}15` }}
              >
                {React.createElement(
                  getIconComponent(request.category.icon_name),
                  {
                    size: 16,
                    color: request.category.color,
                  }
                )}
                <Text
                  className="font-dmsans-bold text-xs"
                  style={{ color: request.category.color }}
                >
                  {request.category.name}
                </Text>
              </View>
            )}

            <View className={`px-3 py-2 rounded-full ${priority.bg}`}>
              <Text className={`${priority.text} font-dmsans-bold text-xs`}>
                {priority.label}
              </Text>
            </View>

            <View className={`px-3 py-2 rounded-full ${statusBadge.bg}`}>
              <Text className={`${statusBadge.text} font-dmsans-bold text-xs`}>
                {statusBadge.label}
              </Text>
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
              <Text className="text-gray-600 text-sm font-dmsans flex-1">
                {request.location_address}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Clock size={16} color="#6B7280" />
              <Text className="text-gray-600 text-sm font-dmsans">
                Requested {getTimeAgo(request.created_at)}
              </Text>
            </View>
          </View>

          {/* Scheduled Time - Full Width, Not Squished */}
          {request.scheduled_time && (
            <View className="bg-blue-50 rounded-2xl p-4 mb-6 border border-blue-200">
              <View className="flex-row items-center gap-2 mb-2">
                <Calendar size={18} color="#3B82F6" />
                <Text className="text-blue-700 text-xs font-dmsans-bold">
                  SCHEDULED FOR
                </Text>
              </View>
              <Text className="text-blue-900 font-dmsans-bold text-lg">
                {formatDateTime(request.scheduled_time)}
              </Text>
            </View>
          )}

          {/* Customer Info */}
          {request.customer && (
            <View className="bg-gray-50 rounded-2xl p-4 mb-6">
              <Text className="text-gray-500 text-xs font-dmsans-bold mb-3">
                CUSTOMER INFORMATION
              </Text>
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
                  <Heading
                    size="sm"
                    className="text-black mb-1 font-dmsans-bold"
                  >
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
            <Text className="text-gray-500 text-xs font-dmsans-bold mb-3">
              JOB DESCRIPTION
            </Text>
            <Text className="text-gray-700 text-base leading-6 font-dmsans">
              {request.description}
            </Text>
          </View>

          {/* Map Section - Added after Job Description */}
          {hasValidCoordinates && (
            <View className="mb-6">
              <Text className="text-gray-500 text-xs font-dmsans-bold mb-3">
                LOCATION MAP
              </Text>
              <View
                className="rounded-2xl overflow-hidden border border-gray-200"
                style={{ height: 200 }}
              >
                <MapView
                  style={{ flex: 1 }}
                  initialRegion={{
                    latitude: request.location_lat,
                    longitude: request.location_lng,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  scrollEnabled={true}
                  zoomEnabled={true}
                >
                  <Marker
                    coordinate={{
                      latitude: request.location_lat,
                      longitude: request.location_lng,
                    }}
                    title={request.title}
                    description={request.location_address}
                  />
                </MapView>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Fixed Bottom Action Buttons */}
      {showActionButtons && (
        <View className="absolute bottom-1 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4">
          {request.status === 'pending' && (
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleDeclineJob}
                disabled={isProcessing}
                className={`flex-1 ${isProcessing ? 'bg-gray-50' : 'bg-gray-100'} py-4 rounded-full items-center justify-center`}
              >
                {isDeclining ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text className="text-black font-bold">Decline</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAcceptJob}
                disabled={isProcessing}
                className={`flex-1 ${isProcessing ? 'bg-gray-800' : 'bg-black'} py-4 rounded-full items-center justify-center`}
              >
                {isAccepting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text className="text-white font-bold">Accept Job</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {request.status === 'accepted' && (
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleCancelJob}
                disabled={isProcessing}
                className={`flex-1 ${isProcessing ? 'bg-gray-50' : 'bg-gray-100'} py-4 rounded-full items-center justify-center`}
              >
                <Text className="text-black font-bold">Cancel Job</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowStartJob(true)}
                disabled={isProcessing}
                className={`flex-1 ${isProcessing ? 'bg-gray-800' : 'bg-black'} py-4 rounded-full items-center justify-center`}
              >
                {isStarting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text className="text-white font-bold">Start Job</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      <StartJobSheet requestId={request.id}/>
    </SafeAreaView>
  );
}