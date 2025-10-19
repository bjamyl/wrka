import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
import {
  Clock,
  DollarSign,
  MapPin,
  Star,
  TrendingUp,
  Wrench,
} from "lucide-react-native";
import * as LucideIcons from "lucide-react-native";
import React, { useState } from "react";
import { ScrollView, Switch, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useServiceCategories } from "@/hooks/useServiceCategories";
import { CategorySkeleton } from "@/components/ui/Skeleton";

// Dummy data
const HANDYMAN_STATS = {
  todayEarnings: 245.5,
  activeJobs: 2,
  rating: 4.8,
  completedJobs: 127,
};

const NEARBY_JOBS = [
  {
    id: "1",
    title: "Fix Leaking Kitchen Sink",
    category: "plumbing",
    description:
      "Kitchen sink has been leaking for 2 days. Need urgent repair.",
    fullDescription:
      "My kitchen sink has been leaking under the cabinet for about 2 days now. The leak seems to be coming from the pipe connections. There's water damage on the cabinet floor and I'm worried it will get worse. I need someone who can come and fix this as soon as possible.",
    payment: 85,
    distance: "1.2 km",
    timeAgo: "5 min ago",
    urgent: true,
    location: "Downtown Plaza",
    preferredDate: "Today, ASAP",
    estimatedDuration: "1-2 hours",
    customer: {
      name: "Sarah Johnson",
      rating: 4.9,
      completedJobs: 23,
    },
    requirements: [
      "Basic plumbing tools",
      "Pipe sealant/tape",
      "Replacement parts if needed",
    ],
    photos: [],
  },
  {
    id: "2",
    title: "Install Ceiling Fan",
    category: "electrical",
    description: "Need to install a new ceiling fan in living room.",
    fullDescription:
      "I just bought a new ceiling fan for my living room and need help installing it. The fan is already unboxed and ready. There's an existing light fixture that needs to be removed first. The ceiling has a standard electrical box installed.",
    payment: 120,
    distance: "2.8 km",
    timeAgo: "15 min ago",
    urgent: false,
    location: "Westside Apartments",
    preferredDate: "Tomorrow, 2-5 PM",
    estimatedDuration: "2-3 hours",
    customer: {
      name: "Michael Chen",
      rating: 4.7,
      completedJobs: 15,
    },
    requirements: ["Electrical tools", "Ladder", "Wire connectors"],
    photos: [],
  },
  {
    id: "3",
    title: "Paint Bedroom Walls",
    category: "painting",
    description: "Two bedroom walls need fresh coat of paint.",
    fullDescription:
      "Looking for someone to paint two walls in my bedroom. The walls are currently white and I want them painted in a light gray color. I have the paint ready. Walls are about 10x8 feet each. Some minor wall prep might be needed.",
    payment: 200,
    distance: "3.5 km",
    timeAgo: "1 hour ago",
    urgent: false,
    location: "Northgate Residences",
    preferredDate: "This Weekend",
    estimatedDuration: "4-5 hours",
    customer: {
      name: "Emily Rodriguez",
      rating: 4.8,
      completedJobs: 31,
    },
    requirements: [
      "Painting supplies (brushes, rollers, tape)",
      "Drop cloths",
      "Ladder",
    ],
    photos: [],
  },
  {
    id: "4",
    title: "Repair Wooden Cabinet",
    category: "carpentry",
    description: "Kitchen cabinet door is broken and needs repair.",
    fullDescription:
      "One of my kitchen cabinet doors came off its hinges. The hinge screws pulled out of the wood and left holes. The door itself is fine, but I need the hinge area repaired properly so the door can be reattached securely.",
    payment: 95,
    distance: "1.8 km",
    timeAgo: "2 hours ago",
    urgent: false,
    location: "Maple Street",
    preferredDate: "Any day this week",
    estimatedDuration: "1-2 hours",
    customer: {
      name: "David Kim",
      rating: 5.0,
      completedJobs: 8,
    },
    requirements: ["Wood filler or dowels", "Drill", "New hinges (if needed)"],
    photos: [],
  },
];

// Dynamically get icon component from Lucide by name
const getIconComponent = (iconName: string) => {
  const Icon = (LucideIcons as any)[iconName];
  return Icon || Wrench; // Fallback to Wrench if icon not found
};

export default function Home() {
  const router = useRouter();
  const { categories, loading: categoriesLoading } = useServiceCategories();
  const [isAvailable, setIsAvailable] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const getCategoryIcon = (categoryId: string) => {
    const category = categories?.find((c) => c.id === categoryId);
    console.log("found category ", category);
    return category ? getIconComponent(category.icon_name) : Wrench;
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.color || "#6B7280";
  };

  const filteredJobs =
    selectedCategory === "all"
      ? NEARBY_JOBS
      : NEARBY_JOBS.filter((job) => job.category === selectedCategory);

  const handleJobPress = (job: (typeof NEARBY_JOBS)[0]) => {
    router.push({
      pathname: "/job-details",
      params: { job: JSON.stringify(job) },
    });
  };

  const handleAcceptJob = (job: (typeof NEARBY_JOBS)[0]) => {
    console.log("Accepting job:", job.id);
    // TODO: Implement accept job logic
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
            <View>
              <Heading size="xl" className="text-black">
                Welcome back, John
              </Heading>
              <Text size="sm" className="text-gray-500 mt-1">
                Ready to work today?
              </Text>
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
                ${HANDYMAN_STATS.todayEarnings}
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
                  onPress={() => setSelectedCategory("all")}
                  className={`px-4 py-3 rounded-full flex-row items-center gap-2 ${
                    selectedCategory === "all"
                      ? "bg-black"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <Wrench
                    size={18}
                    color={selectedCategory === "all" ? "#FFFFFF" : "#6B7280"}
                  />
                  <Text
                    size="sm"
                    className={`font-medium ${selectedCategory === "all" ? "text-white" : "text-gray-700"}`}
                  >
                    All
                  </Text>
                </TouchableOpacity>

                {/* Dynamic categories from database */}
                {categories.map((category) => {
                  const Icon = getIconComponent(category.icon_name);
                  const isSelected = selectedCategory === category.id;
                  return (
                    <TouchableOpacity
                      key={category.id}
                      onPress={() => setSelectedCategory(category.id)}
                      className={`px-4 py-3 rounded-full flex-row items-center gap-2 ${
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
              Nearby Jobs
            </Heading>
            <Text size="sm" className="text-blue-600 font-medium">
              {filteredJobs.length} available
            </Text>
          </View>

          <View className="gap-3">
            {filteredJobs.map((job) => {
              const Icon = getCategoryIcon(job.category);
              const iconColor = getCategoryColor(job.category);

              return (
                <TouchableOpacity
                  key={job.id}
                  onPress={() => handleJobPress(job)}
                  className="bg-white rounded-2xl p-4 border border-gray-100"
                >
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-2">
                        <View
                          className="w-10 h-10 rounded-full items-center justify-center"
                          style={{ backgroundColor: `${iconColor}15` }}
                        >
                          <Icon size={20} color={iconColor} />
                        </View>
                        <View className="flex-1">
                          <Heading size="sm" className="text-black">
                            {job.title}
                          </Heading>
                          <Text size="xs" className="text-gray-500 mt-0.5">
                            {job.location}
                          </Text>
                        </View>
                      </View>
                      <Text size="sm" className="text-gray-600 mb-3">
                        {job.description}
                      </Text>
                    </View>
                    {job.urgent && (
                      <View className="bg-red-50 px-2 py-1 rounded-full">
                        <Text size="xs" className="text-red-600 font-semibold">
                          Urgent
                        </Text>
                      </View>
                    )}
                  </View>

                  <View>
                    <View className="flex-row items-center gap-4 mb-3">
                      <View className="flex-row items-center gap-1">
                        <DollarSign size={16} color="#10B981" />
                        <Text size="sm" className="text-black font-bold">
                          ${job.payment}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <MapPin size={16} color="#6B7280" />
                        <Text size="sm" className="text-gray-600">
                          {job.distance}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <Clock size={16} color="#6B7280" />
                        <Text size="sm" className="text-gray-600">
                          {job.timeAgo}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        onPress={() => handleJobPress(job)}
                        className="flex-1 bg-gray-100 py-2.5 rounded-full items-center"
                      >
                        <Text size="sm" className="text-black font-semibold">
                          View Details
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleAcceptJob(job)}
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
