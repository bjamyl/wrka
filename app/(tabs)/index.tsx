import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
import {
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Star,
  TrendingUp,
  Wrench,
  Inbox,
  RefreshCw,
  Filter,
} from "lucide-react-native";
import * as LucideIcons from "lucide-react-native";
import React, { useState } from "react";
import { ScrollView, Switch, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useServiceCategories } from "@/hooks/useServiceCategories";
import {
  CategorySkeleton,
  Skeleton,
  JobCardSkeleton,
} from "@/components/ui/Skeleton";
import { useProfile } from "@/hooks/useProfile";
import { useServiceRequests } from "@/hooks/useServiceRequests";

// Dummy stats - TODO: Fetch real stats from API
const HANDYMAN_STATS = {
  todayEarnings: 245.5,
  activeJobs: 2,
  rating: 4.8,
  completedJobs: 127,
};

// Dynamically get icon component from Lucide by name
const getIconComponent = (iconName: string) => {
  const Icon = (LucideIcons as any)[iconName];
  return Icon || Wrench; // Fallback to Wrench if icon not found
};

export default function Home() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useProfile();
  const { categories, loading: categoriesLoading } = useServiceCategories();
  const [isAvailable, setIsAvailable] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined,
  );

  // Fetch service requests based on selected category
  const { requests, loading: requestsLoading } =
    useServiceRequests(selectedCategory);

  // Extract first name from full name
  const firstName = profile?.full_name?.split(" ")[0] || "there";

  const handleJobPress = (requestId: string) => {
    router.push({
      pathname: "/job-details",
      params: { requestId },
    });
  };

  const handleAcceptJob = (requestId: string) => {
    console.log("Accepting job:", requestId);
    // TODO: Implement accept job logic
  };

  const handleRefresh = () => {
    // TODO: Implement pull to refresh
    console.log("Refreshing...");
  };

  // Format time ago
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  // Format scheduled time for cards
  const formatScheduledTime = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };
    return date.toLocaleString("en-US", options);
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header Section */}
        <View className="px-6 py-4 bg-white">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              {profileLoading ? (
                <View>
                  <Skeleton
                    width={200}
                    height={28}
                    style={{ marginBottom: 6 }}
                  />
                  <Skeleton width={150} height={16} />
                </View>
              ) : (
                <View>
                  <Heading size="xl" className="text-black">
                    Welcome back, {firstName}
                  </Heading>
                  <Text size="sm" className="text-gray-500 mt-1">
                    Ready to work today?
                  </Text>
                </View>
              )}
            </View>
            <View className="flex-row items-center gap-2">
              <Text
                size="sm"
                className={
                  isAvailable ? "text-green-600 font-medium" : "text-gray-500"
                }
              >
                {isAvailable ? "Available" : "Offline"}
              </Text>
              <Switch
                value={isAvailable}
                onValueChange={setIsAvailable}
                trackColor={{ false: "#D1D5DB", true: "#10B981" }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Quick Stats */}
          <View className="flex-row gap-3">
            <View className="flex-1 bg-gray-50 rounded-2xl p-4">
              <View className="flex-row items-center gap-2 mb-1">
                <DollarSign size={16} color="#10B981" />
                <Text size="xs" className="text-gray-600">
                  Today
                </Text>
              </View>
              <Heading size="lg" className="text-black">
                ₵{HANDYMAN_STATS.todayEarnings}
              </Heading>
            </View>

            <View className="flex-1 bg-gray-50 rounded-2xl p-4">
              <View className="flex-row items-center gap-2 mb-1">
                <TrendingUp size={16} color="#3B82F6" />
                <Text size="xs" className="text-gray-600">
                  Active
                </Text>
              </View>
              <Heading size="lg" className="text-black">
                {HANDYMAN_STATS.activeJobs}
              </Heading>
            </View>

            <View className="flex-1 bg-gray-50 rounded-2xl p-4">
              <View className="flex-row items-center gap-2 mb-1">
                <Star size={16} color="#F59E0B" />
                <Text size="xs" className="text-gray-600">
                  Rating
                </Text>
              </View>
              <Heading size="lg" className="text-black">
                {HANDYMAN_STATS.rating}
              </Heading>
            </View>
          </View>
        </View>

        {/* Job Categories */}
        <View className="px-6 py-4">
          <Heading size="md" className="text-black mb-3">
            Categories
          </Heading>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="-mx-6 px-6"
          >
            {categoriesLoading ? (
              <CategorySkeleton />
            ) : (
              <View className="flex-row gap-3">
                {/* All category */}
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => setSelectedCategory(undefined)}
                  className={`px-6 py-2 rounded-full flex-row items-center gap-2 ${
                    !selectedCategory
                      ? "bg-black"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <Wrench
                    size={18}
                    color={!selectedCategory ? "#FFFFFF" : "#6B7280"}
                  />
                  <Text
                    size="sm"
                    className={`font-medium ${!selectedCategory ? "text-white" : "text-gray-700"}`}
                  >
                    All
                  </Text>
                </TouchableOpacity>

                {categories.map((category) => {
                  const Icon = getIconComponent(category.icon_name);
                  const isSelected = selectedCategory === category.id;
                  return (
                    <TouchableOpacity
                      key={category.id}
                      activeOpacity={1}
                      onPress={() => setSelectedCategory(category.id)}
                      className={`px-6 py-2 rounded-full flex-row items-center gap-2 ${
                        isSelected
                          ? "bg-black"
                          : "bg-white border border-gray-200"
                      }`}
                    >
                      <Icon
                        size={18}
                        color={isSelected ? "#FFFFFF" : category.color}
                      />
                      <Text
                        size="sm"
                        className={`font-medium ${isSelected ? "text-white" : "text-gray-700"}`}
                      >
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </View>

        {/* Nearby Jobs */}
        <View className="px-6 pb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Heading size="md" className="text-black">
              Job Requests
            </Heading>
            <Text size="sm" className="text-blue-600 font-medium">
              {requests.length} available
            </Text>
          </View>

          {requestsLoading ? (
            <View className="gap-3">
              <JobCardSkeleton />
              <JobCardSkeleton />
              <JobCardSkeleton />
            </View>
          ) : requests.length === 0 ? (
            <View className="bg-white rounded-2xl px-8 py-4 justify-center items-center mt-3">
              {/* Icon */}
              <View className="w-20 h-20 rounded-full bg-gray-100 p-2 items-center justify-center mb-2">
                {selectedCategory ? (
                  <Filter size={14} color="#9CA3AF" />
                ) : (
                  <Inbox size={14} color="#9CA3AF" />
                )}
              </View>

              {/* Title */}
              <Heading
                size="lg"
                className="text-black mb-2 text-center font-dmsans-bold"
              >
                {selectedCategory
                  ? "No Jobs in This Category"
                  : "All Caught Up!"}
              </Heading>

              {/* Description */}
              <Text className="text-gray-500 font-dmsans text-center px-4 mb-4">
                {selectedCategory
                  ? "There are currently no pending jobs for this category. Try browsing other categories or check back soon."
                  : "Great news! There are no pending jobs right now. New opportunities will appear here when customers need your skills."}
              </Text>

              {/* Actions */}
              <View className="flex-row gap-3">
                {selectedCategory ? (
                  <>
                    <TouchableOpacity
                      onPress={() => setSelectedCategory(undefined)}
                      className="bg-black px-6 py-3 rounded-full flex-row items-center gap-2"
                    >
                      <Text className="text-white font-dmsans-bold text-sm">
                        View All Jobs
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    onPress={handleRefresh}
                    className="bg-gray-100 px-6 py-3 rounded-full flex-row items-center gap-2"
                  >
                    <RefreshCw size={16} color="#000" />
                    <Text className="text-black font-dmsans-bold text-sm">
                      Refresh
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Tips Section */}
              {!selectedCategory && (
                <View className="mt-8 pt-6 border-t border-gray-100 w-full">
                  <Text className="text-gray-600 font-dmsans-bold text-xs mb-3 text-center">
                    💡 TIPS TO GET MORE JOBS
                  </Text>
                  <View className="gap-2">
                    <View className="flex-row items-start gap-2">
                      <Text className="text-gray-500 font-dmsans text-sm">
                        •
                      </Text>
                      <Text className="text-gray-600 font-dmsans text-sm flex-1">
                        Make sure your availability is turned ON
                      </Text>
                    </View>
                    <View className="flex-row items-start gap-2">
                      <Text className="text-gray-500 font-dmsans text-sm">
                        •
                      </Text>
                      <Text className="text-gray-600 font-dmsans text-sm flex-1">
                        Complete your profile to build trust
                      </Text>
                    </View>
                    <View className="flex-row items-start gap-2">
                      <Text className="text-gray-500 font-dmsans text-sm">
                        •
                      </Text>
                      <Text className="text-gray-600 font-dmsans text-sm flex-1">
                        Check back regularly for new opportunities
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View className="gap-3">
              {requests.map((request) => {
                const categoryIcon = request.category
                  ? getIconComponent(request.category.icon_name)
                  : Wrench;
                const categoryColor = request.category?.color || "#6B7280";
                const isUrgent = request.priority === "urgent";

                return (
                  <TouchableOpacity
                    key={request.id}
                    onPress={() => handleJobPress(request.id)}
                    className="bg-white rounded-2xl p-4 border border-gray-100"
                  >
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
                              {request.title}
                            </Heading>
                            <Text size="xs" className="text-gray-500 mt-0.5">
                              {request.location_address}
                            </Text>
                          </View>
                        </View>
                        <Text size="sm" className="text-gray-600 mb-3">
                          {request.description}
                        </Text>
                      </View>
                      {isUrgent && (
                        <View className="bg-red-50 px-2 py-1 rounded-full">
                          <Text
                            size="xs"
                            className="text-red-600 font-semibold"
                          >
                            Urgent
                          </Text>
                        </View>
                      )}
                    </View>

                    <View>
                      {/* Scheduled Time - Highlighted */}
                      {request.scheduled_time && (
                        <View className="bg-blue-50 px-4 py-3 rounded-xl mb-3 border border-blue-200">
                          <View className="flex-row items-center gap-2">
                            <Calendar size={16} color="#3B82F6" />

                            <Text className="text-blue-600 text-xs font-dmsans">
                              Scheduled:
                            </Text>
                            <Text className="text-blue-900 font-dmsans-bold text-sm">
                              {formatScheduledTime(request.scheduled_time)}
                            </Text>
                          </View>
                        </View>
                      )}

                      <View className="flex-row items-center gap-4 mb-3">
                        
                        {request.distance_km !== undefined && (
                          <View className="flex-row items-center gap-1">
                            <MapPin size={16} color="#6B7280" />
                            <Text size="sm" className="text-gray-600">
                              {request.distance_km} km
                            </Text>
                          </View>
                        )}
                        <View className="flex-row items-center gap-1">
                          <Clock size={16} color="#6B7280" />
                          <Text size="sm" className="text-gray-600">
                            Requested {getTimeAgo(request.created_at)}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row gap-2">
                        <TouchableOpacity
                          onPress={() => handleJobPress(request.id)}
                          className="flex-1 bg-gray-100 py-2.5 rounded-full items-center"
                        >
                          <Text size="sm" className="text-black font-semibold">
                            View Details
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleAcceptJob(request.id)}
                          className="flex-1 bg-black py-2.5 rounded-full items-center"
                        >
                          <Text size="sm" className="text-white font-semibold">
                            Accept
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
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
