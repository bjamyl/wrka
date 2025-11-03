import { Text, View } from "react-native";

type StatusProps = {
  isAvailable: boolean;
};

export default function Status({ isAvailable }: StatusProps) {
  return (
    <View className="my-4">
      <Text className="text-2xl font-dmsans-bold">
        {isAvailable ? "Available for work" : "Not accepting jobs"}
      </Text>
      <Text className="text-gray-500 font-dmsans">
        {isAvailable
          ? "You will appear on customer search results"
          : "You will not appear in search results"}
      </Text>
    </View>
  );
}
