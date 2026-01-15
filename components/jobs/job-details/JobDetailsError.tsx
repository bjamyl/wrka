import { Text } from "@/components/ui/text";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { JobDetailsHeader } from "./JobDetailsHeader";

interface JobDetailsErrorProps {
  message?: string;
}

export function JobDetailsError({ message = "Job not found" }: JobDetailsErrorProps) {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <JobDetailsHeader />
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-500">{message}</Text>
      </View>
    </SafeAreaView>
  );
}
