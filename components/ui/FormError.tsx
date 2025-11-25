import { Text } from "@/components/ui/text";
import { AlertCircle } from "lucide-react-native";
import { View } from "react-native";

interface FormErrorProps {
  message?: string | null;
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return (
    <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 flex-row items-center">
      <AlertCircle size={20} color="#DC2626" />
      <Text className="text-red-700 text-sm ml-2 flex-1 font-medium font-dmsans">
        {message}
      </Text>
    </View>
  );
}
