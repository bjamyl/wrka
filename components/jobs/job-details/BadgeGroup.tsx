import { Text } from "@/components/ui/text";
import { ServiceCategory, ServiceRequestStatus } from "@/types/service";
import * as LucideIcons from "lucide-react-native";
import { Wrench } from "lucide-react-native";
import React from "react";
import { View } from "react-native";
import { PriorityLevel, PRIORITY_CONFIG, STATUS_CONFIG } from "./config";

interface BadgeGroupProps {
  category?: ServiceCategory;
  priority: PriorityLevel;
  status: ServiceRequestStatus;
}

const getIconComponent = (iconName: string) => {
  const Icon = (LucideIcons as any)[iconName];
  return Icon || Wrench;
};

function CategoryBadge({ category }: { category: ServiceCategory }) {
  const IconComponent = getIconComponent(category.icon_name);

  return (
    <View
      className="px-3 py-2 rounded-full flex-row items-center gap-2"
      style={{ backgroundColor: `${category.color}15` }}
    >
      <IconComponent size={16} color={category.color} />
      <Text className="font-dmsans-bold text-xs" style={{ color: category.color }}>
        {category.name}
      </Text>
    </View>
  );
}

function PriorityBadge({ priority }: { priority: PriorityLevel }) {
  const config = PRIORITY_CONFIG[priority];

  return (
    <View className={`px-3 py-2 rounded-full ${config.bg}`}>
      <Text className={`${config.text} font-dmsans-bold text-xs`}>{config.label}</Text>
    </View>
  );
}

function StatusBadge({ status }: { status: ServiceRequestStatus }) {
  const config = STATUS_CONFIG[status];

  return (
    <View className={`px-3 py-2 rounded-full ${config.bg}`}>
      <Text className={`${config.text} font-dmsans-bold text-xs`}>{config.label}</Text>
    </View>
  );
}

export function BadgeGroup({ category, priority, status }: BadgeGroupProps) {
  return (
    <View className="flex-row items-center gap-2 mb-4">
      {category && <CategoryBadge category={category} />}
      <PriorityBadge priority={priority} />
      <StatusBadge status={status} />
    </View>
  );
}
