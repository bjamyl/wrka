import { Tabs } from "@/components/Tabs";
import { Text } from "@/components/ui/text";
import { useCountry } from "@/contexts/CountryContext";
import { EarningsPeriod, EarningsStats as EarningsStatsType } from "@/types/earnings";
import { Briefcase, TrendingUp, Wallet } from "lucide-react-native";
import React from "react";
import { View } from "react-native";

interface EarningsStatsProps {
  stats: EarningsStatsType;
  period: EarningsPeriod;
  onPeriodChange: (period: EarningsPeriod) => void;
  loading?: boolean;
}

const periodTabs = [
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "all", label: "All Time" },
];

export const EarningsStats: React.FC<EarningsStatsProps> = ({
  stats,
  period,
  onPeriodChange,
  loading,
}) => {
  const { formatAmount } = useCountry();

  const statCards = [
    {
      label: "Earned",
      value: loading ? "---" : formatAmount(stats.earned),
      icon: Wallet,
      color: "#10B981",
      bgColor: "#ECFDF5",
    },
    {
      label: "Jobs Done",
      value: loading ? "---" : stats.jobsCompleted.toString(),
      icon: Briefcase,
      color: "#3B82F6",
      bgColor: "#EFF6FF",
    },
    {
      label: "Avg/Job",
      value: loading ? "---" : formatAmount(stats.averagePerJob),
      icon: TrendingUp,
      color: "#8B5CF6",
      bgColor: "#F5F3FF",
    },
  ];

  return (
    <View className="mb-6">
      <Tabs
        tabs={periodTabs}
        activeTab={period}
        onTabChange={(id) => onPeriodChange(id as EarningsPeriod)}
        variant="pills"
      />

      <View className="flex-row gap-3">
        {statCards.map((stat) => (
          <View
            key={stat.label}
            className="flex-1 bg-white rounded-2xl p-4 border border-gray-100"
          >
            <View
              className="w-10 h-10 rounded-full items-center justify-center mb-3"
              style={{ backgroundColor: stat.bgColor }}
            >
              <stat.icon size={20} color={stat.color} />
            </View>
            <Text className="text-gray-500 font-dmsans text-xs mb-1">
              {stat.label}
            </Text>
            <Text className="text-black font-dmsans-bold text-lg">
              {stat.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
