import { Text } from "@/components/ui/text";
import { formatDateTime } from "@/lib/utils";
import { Calendar } from "lucide-react-native";
import { View } from "react-native";

interface ScheduledTimeCardProps {
  scheduledTime: string;
}

export function ScheduledTimeCard({ scheduledTime }: ScheduledTimeCardProps) {
  return (
    <View className="bg-blue-50 rounded-2xl p-4 mb-6 border border-blue-200">
      <View className="flex-row items-center gap-2 mb-2">
        <Calendar size={18} color="#3B82F6" />
        <Text className="text-blue-700 text-xs font-dmsans-bold">SCHEDULED FOR</Text>
      </View>
      <Text className="text-blue-900 font-dmsans-bold text-lg">
        {formatDateTime(scheduledTime)}
      </Text>
    </View>
  );
}
