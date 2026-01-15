import { Tabs } from "@/components/Tabs";
import { JobCardSkeleton } from "@/components/ui/Skeleton";
import { useHandymanJobCounts, useHandymanJobs } from "@/hooks/useHandymanJobs";
import { formatScheduledTime, getTimeAgo } from "@/lib/transformers";
import { useRouter } from "expo-router";
import * as LucideIcons from "lucide-react-native";
import {
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Inbox,
  MapPin,
  Phone,
  PlayCircle,
  Wrench,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Dynamically get icon component from Lucide by name
const getIconComponent = (iconName: string) => {
  const Icon = (LucideIcons as any)[iconName];
  return Icon || Wrench;
};

export default function Jobs() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "accepted" | "active" | "completed"
  >("accepted");
  const { acceptedCount, activeCount, completedCount } = useHandymanJobCounts();

  // Use tab status directly - the hook now handles the mapping internally
  const { jobs, loading, refetch } = useHandymanJobs(activeTab);

  console.log('jobs ', jobs)

  const tabs = [
    { id: "accepted" as const, label: "Accepted", count: acceptedCount },
    { id: "active" as const, label: "Active", count: activeCount },
    { id: "completed" as const, label: "Completed", count: completedCount },
  ];

  const handleJobPress = (jobId: string) => {
    router.push({
      pathname: "/job-details",
      params: { requestId: jobId },
    });
  };

  // Render empty state based on active tab
  const renderEmptyState = () => {
    const emptyStates = {
      accepted: {
        title: "No Accepted Jobs",
        description:
          "Jobs you accept will appear here. Browse available jobs on the home screen to get started.",
        icon: CheckCircle,
      },
      active: {
        title: "No Active Jobs",
        description:
          "You don't have any jobs in progress. Start working on an accepted job to see it here.",
        icon: PlayCircle,
      },
      completed: {
        title: "No Completed Jobs Yet",
        description:
          "Jobs you complete will be listed here. Keep up the great work!",
        icon: Inbox,
      },
    };

    const state = emptyStates[activeTab];
    const Icon = state.icon;

    return (
      <View className="bg-white rounded-2xl px-8 py-12 justify-center items-center">
        <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
          <Icon size={32} color="#9CA3AF" />
        </View>

        <Text className="mb-2 text-2xl font-dmsans-bold text-center">
          {state.title}
        </Text>

        <Text className="text-gray-500 font-dmsans text-center px-4">
          {state.description}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} />
        }
      >
        <View className="px-6 py-4 bg-white mb-4">
          <Text className="font-dmsans-bold text-3xl mb-2">My Jobs</Text>
          <Text className="text-gray-600 font-dmsans">
            Track your accepted, active and completed requests
          </Text>
        </View>

        <View className="px-6">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as typeof activeTab)}
            variant="pills"
          />

          {loading ? (
            <View className="gap-3">
              <JobCardSkeleton />
              <JobCardSkeleton />
              <JobCardSkeleton />
            </View>
          ) : jobs.length === 0 ? (
            renderEmptyState()
          ) : (
            <View className="gap-3">
              {jobs.map((job) => {
                const categoryIcon = job.category
                  ? getIconComponent(job.category.icon_name)
                  : Wrench;
                const categoryColor = job.category?.color || "#6B7280";
                const isUrgent = job.priority === "urgent";

                return (
                  <TouchableOpacity
                    key={job.id}
                    onPress={() => handleJobPress(job.id)}
                    className="bg-white rounded-2xl p-4 border border-gray-100"
                  >
                    {/* Header */}
                    <View className="flex-row items-start justify-between mb-3">
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2 mb-2">
                          <View
                            className="w-10 h-10 rounded-full items-center justify-center"
                            style={{ backgroundColor: `${categoryColor}15` }}
                          >
                            {React.createElement(categoryIcon, {
                              size: 20,
                              color: categoryColor,
                            })}
                          </View>
                          <View className="flex-1">
                            <Text  className="text-black text-xl font-dmsans">
                              {job.title}
                            </Text>
                            <Text className="text-gray-500 mt-0.5 font-dmsans">
                              {job.location_address}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View className="flex-row items-center gap-2">
                        {/* Status badge for active jobs */}
                        {activeTab === "active" && (
                          <View
                            className={`px-2 py-1 rounded-full ${
                              job.status === "on_the_way"
                                ? "bg-blue-50"
                                : job.status === "arrived"
                                  ? "bg-purple-50"
                                  : "bg-green-50"
                            }`}
                          >
                            <Text
                              className={`font-semibold text-xs ${
                                job.status === "on_the_way"
                                  ? "text-blue-600"
                                  : job.status === "arrived"
                                    ? "text-purple-600"
                                    : "text-green-600"
                              }`}
                            >
                              {job.status === "on_the_way"
                                ? "On The Way"
                                : job.status === "arrived"
                                  ? "Arrived"
                                  : "In Progress"}
                            </Text>
                          </View>
                        )}
                        {/* Payment status badge for completed jobs */}
                        {activeTab === "completed" && job.payment_status && (
                          <View
                            className={`px-2 py-1 rounded-full flex-row items-center gap-1 ${
                              job.payment_status === "paid"
                                ? "bg-green-50"
                                : job.payment_status === "pending"
                                  ? "bg-amber-50"
                                  : job.payment_status === "processing"
                                    ? "bg-blue-50"
                                    : job.payment_status === "failed"
                                      ? "bg-red-50"
                                      : "bg-gray-50"
                            }`}
                          >
                            <CreditCard
                              size={12}
                              color={
                                job.payment_status === "paid"
                                  ? "#16A34A"
                                  : job.payment_status === "pending"
                                    ? "#D97706"
                                    : job.payment_status === "processing"
                                      ? "#2563EB"
                                      : job.payment_status === "failed"
                                        ? "#DC2626"
                                        : "#6B7280"
                              }
                            />
                            <Text
                              className={`font-semibold text-xs ${
                                job.payment_status === "paid"
                                  ? "text-green-600"
                                  : job.payment_status === "pending"
                                    ? "text-amber-600"
                                    : job.payment_status === "processing"
                                      ? "text-blue-600"
                                      : job.payment_status === "failed"
                                        ? "text-red-600"
                                        : "text-gray-600"
                              }`}
                            >
                              {job.payment_status === "paid"
                                ? "Paid"
                                : job.payment_status === "pending"
                                  ? "Awaiting Payment"
                                  : job.payment_status === "processing"
                                    ? "Processing"
                                    : job.payment_status === "failed"
                                      ? "Payment Failed"
                                      : "Unpaid"}
                            </Text>
                          </View>
                        )}
                        {isUrgent && (
                          <View className="bg-red-50 px-2 py-1 rounded-full">
                            <Text className="text-red-600 font-semibold text-xs">
                              Urgent
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Customer Info */}
                    {job.customer && (
                      <View className="bg-gray-100 rounded-2xl px-6 py-2 mb-3">
                        <View className="flex-row items-center justify-between">
                          <View className="flex-1">
                            <Text className="text-black text-lg font-dmsans-bold ">
                              {job.customer.full_name}
                            </Text>
                            {job.customer.phone_number && (
                              <Text className="text-gray-500 text-xs font-dmsans mb-1">
                                {job.customer.phone_number}
                              </Text>
                            )}
                          </View>
                          {job.customer.phone_number && (
                            <TouchableOpacity className="bg-black p-4 rounded-full flex-row items-center gap-2">
                              <Phone size={14} color="#FFFFFF" />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    )}

                    {/* Scheduled Time */}

                    {/* Meta Info */}
                    <View className="flex-row items-center gap-4 mb-3">
                      {job.distance_km !== undefined && (
                        <View className="flex-row items-center gap-1">
                          <MapPin size={16} color="#6B7280" />
                          <Text className="text-gray-600">
                            {job.distance_km} km
                          </Text>
                        </View>
                      )}
                      <View className="flex gap-2">
                        <View className="flex-row items-center gap-1">
                          <Clock size={16} color="#6B7280" />
                          <Text className="text-gray-600">
                            {activeTab === "accepted" &&
                              `Accepted ${getTimeAgo(
                                job.accepted_at || job.created_at
                              )}`}
                            {activeTab === "active" && (
                              job.status === "on_the_way"
                                ? `Departed ${getTimeAgo(job.departed_at || job.accepted_at || job.created_at)}`
                                : job.status === "arrived"
                                  ? `Arrived ${getTimeAgo(job.accepted_at || job.created_at)}`
                                  : `Started ${getTimeAgo(job.started_at || job.accepted_at || job.created_at)}`
                            )}
                            {activeTab === "completed" &&
                              `Completed ${getTimeAgo(
                                job.completed_at || job.created_at
                              )}`}
                          </Text>
                        </View>
                        {job.scheduled_time && (
                          <View className="flex-row items-center gap-1">
                            <Calendar size={16} color="#6B7280" />
                            <Text className="text-gray-600">
                              Scheduled:
                            </Text>
                            <Text className="text-gray-600">
                              {formatScheduledTime(job.scheduled_time)}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Action Button */}
                    <TouchableOpacity
                      onPress={() => handleJobPress(job.id)}
                      className="bg-black py-4 mt-5 rounded-full items-center"
                    >
                      <Text className="text-white font-semibold">
                        View Details
                      </Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
