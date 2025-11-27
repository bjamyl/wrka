import React from "react";
import { Text, View } from "react-native";

type DashboardCardProps = {
  icon: React.ReactElement;
  title: string;
  statsValue: number;
};

export default function DashboardCard({
  icon,
  title,
  statsValue,
}: DashboardCardProps) {
  return (
    <View className="border border-gray-200 rounded-xl p-3">
      <View className="flex flex-row items-center">
        <View>{icon}</View>

        <Text className="font-dmsans-semibold ml-2">{title}</Text>
      </View>
      <View className="mt-3">
        <View>
          <Text className="font-dmsans-bold text-base text-gray-700">
            {statsValue}
          </Text>
        </View>
      </View>
    </View>
  );
}
