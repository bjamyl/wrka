import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { getTimeAgo } from "@/lib/utils";
import { Clock, MapPin } from "lucide-react-native";
import { View } from "react-native";

interface LocationInfoProps {
  title: string;
  locationAddress: string;
  createdAt: string;
}

export function LocationInfo({ title, locationAddress, createdAt }: LocationInfoProps) {
  return (
    <>
      <Heading size="2xl" className="text-black mb-2 font-dmsans-bold">
        {title}
      </Heading>
      <View className="mb-6">
        <View className="flex-row items-center gap-1 mb-2">
          <MapPin size={16} color="#6B7280" />
          <Text className="text-gray-600 text-sm font-dmsans flex-1">
            {locationAddress}
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Clock size={16} color="#6B7280" />
          <Text className="text-gray-600 text-sm font-dmsans">
            Requested {getTimeAgo(createdAt)}
          </Text>
        </View>
      </View>
    </>
  );
}
