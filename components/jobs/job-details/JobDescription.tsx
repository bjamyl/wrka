import { Text } from "@/components/ui/text";
import { View } from "react-native";

interface JobDescriptionProps {
  description: string;
}

export function JobDescription({ description }: JobDescriptionProps) {
  return (
    <View className="mb-6">
      <Text className="text-gray-500 text-xs font-dmsans-bold mb-3">JOB DESCRIPTION</Text>
      <Text className="text-gray-700 text-base leading-6 font-dmsans">{description}</Text>
    </View>
  );
}
