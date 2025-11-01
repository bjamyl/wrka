import { Tabs } from "@/components/Tabs";
import { Heading } from "@/components/ui/heading";
import { JobCardSkeleton } from "@/components/ui/Skeleton";
import { Text } from "@/components/ui/text";
import { useHandymanJobCounts, useHandymanJobs } from "@/hooks/useHandymanJobs";
import { formatScheduledTime, getTimeAgo } from "@/lib/transformers";
import { useRouter } from "expo-router";
import * as LucideIcons from "lucide-react-native";
import {
  Calendar,
  CheckCircle,
  Clock,
  Inbox,
  MapPin,
  Phone,
  PlayCircle,
  Wrench,
} from "lucide-react-native";
import React, { useState } from "react";
import { RefreshControl, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


// Dynamically get icon component from Lucide by name
const getIconComponent = (iconName: string) => {
  const Icon = (LucideIcons as any)[iconName];
  return Icon || Wrench;
};

export default function Jobs() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'accepted' | 'active' | 'completed'>('accepted');
  const { acceptedCount, activeCount, completedCount } = useHandymanJobCounts();

  
  const statusMap = {
    accepted: 'accepted' as const,
    active: 'in_progress' as const,
    completed: 'completed' as const,
  };

  const { jobs, loading, refetch } = useHandymanJobs(statusMap[activeTab]);

  const tabs = [
    { id: 'accepted' as const, label: 'Accepted', count: acceptedCount },
    { id: 'active' as const, label: 'Active', count: activeCount },
    { id: 'completed' as const, label: 'Completed', count: completedCount },
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
        description: "Jobs you accept will appear here. Browse available jobs on the home screen to get started.",
        icon: CheckCircle,
      },
      active: {
        title: "No Active Jobs",
        description: "You don't have any jobs in progress. Start working on an accepted job to see it here.",
        icon: PlayCircle,
      },
      completed: {
        title: "No Completed Jobs Yet",
        description: "Jobs you complete will be listed here. Keep up the great work!",
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

        <Heading size="lg" className="text-black mb-2 text-center">
          {state.title}
        </Heading>

        <Text className="text-gray-500 text-center px-4">
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
          <Heading size="2xl" className="text-black mb-2">
            My Jobs
          </Heading>
          <Text size="md" className="text-gray-600">
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
                            <Heading size="sm" className="text-black">
                              {job.title}
                            </Heading>
                            <Text size="xs" className="text-gray-500 mt-0.5">
                              {job.location_address}
                            </Text>
                          </View>
                        </View>
                      </View>
                      {isUrgent && (
                        <View className="bg-red-50 px-2 py-1 rounded-full">
                          <Text size="xs" className="text-red-600 font-semibold">
                            Urgent
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Description */}
                    <Text size="sm" className="text-gray-600 mb-3">
                      {job.description}
                    </Text>

                    {/* Customer Info */}
                    {job.customer && (
                      <View className="bg-gray-50 rounded-xl p-3 mb-3">
                        <View className="flex-row items-center justify-between">
                          <View className="flex-1">
                            <Text size="xs" className="text-gray-500 mb-1">
                              Customer
                            </Text>
                            <Text size="sm" className="text-black font-semibold">
                              {job.customer.full_name}
                            </Text>
                          </View>
                          {job.customer.phone_number && (
                            <TouchableOpacity className="bg-black px-4 py-2 rounded-full flex-row items-center gap-2">
                              <Phone size={14} color="#FFFFFF" />
                              <Text size="xs" className="text-white font-semibold">
                                Call
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    )}

                    {/* Scheduled Time */}
                    {job.scheduled_time && (
                      <View className="bg-blue-50 px-4 py-3 rounded-xl mb-3 border border-blue-200">
                        <View className="flex-row items-center gap-2">
                          <Calendar size={16} color="#3B82F6" />
                          <Text className="text-blue-600 text-xs">
                            Scheduled:
                          </Text>
                          <Text className="text-blue-900 font-semibold text-sm">
                            {formatScheduledTime(job.scheduled_time)}
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* Meta Info */}
                    <View className="flex-row items-center gap-4 mb-3">
                      {job.distance_km !== undefined && (
                        <View className="flex-row items-center gap-1">
                          <MapPin size={16} color="#6B7280" />
                          <Text size="sm" className="text-gray-600">
                            {job.distance_km} km
                          </Text>
                        </View>
                      )}
                      <View className="flex-row items-center gap-1">
                        <Clock size={16} color="#6B7280" />
                        <Text size="sm" className="text-gray-600">
                          {activeTab === 'accepted' && `Accepted ${getTimeAgo(job.accepted_at || job.created_at)}`}
                          {activeTab === 'active' && `Started ${getTimeAgo(job.started_at || job.accepted_at || job.created_at)}`}
                          {activeTab === 'completed' && `Completed ${getTimeAgo(job.completed_at || job.created_at)}`}
                        </Text>
                      </View>
                    </View>

                    {/* Action Button */}
                    <TouchableOpacity
                      onPress={() => handleJobPress(job.id)}
                      className="bg-black py-3 rounded-full items-center"
                    >
                      <Text size="sm" className="text-white font-semibold">
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
