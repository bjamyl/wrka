import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Image } from "expo-image";
import { User } from "lucide-react-native";
import { View } from "react-native";

interface CustomerInfoCardProps {
  customer: {
    full_name: string;
    avatar_url?: string;
    phone_number?: string;
  };
}

export function CustomerInfoCard({ customer }: CustomerInfoCardProps) {
  return (
    <View className="bg-gray-50 rounded-2xl p-4 mb-6">
      <Text className="text-gray-500 text-xs font-dmsans-bold mb-3">
        CUSTOMER INFORMATION
      </Text>
      <View className="flex-row items-center gap-3">
        <View className="w-12 h-12 rounded-full bg-gray-300 items-center justify-center">
          {customer.avatar_url ? (
            <Image
              source={{ uri: customer.avatar_url }}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <User size={24} color="#6B7280" />
          )}
        </View>
        <View className="flex-1">
          <Heading size="sm" className="text-black mb-1 font-dmsans-bold">
            {customer.full_name}
          </Heading>
          {customer.phone_number && (
            <Text className="text-gray-600 text-sm font-dmsans">
              {customer.phone_number}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
