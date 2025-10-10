import LoginForm from "@/components/auth/LoginForm";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Login() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pt-5 pb-10"
      >
        {/* Logo */}
        <View className="mb-8">
          <Text className="text-4xl font-bold text-black">wrka.</Text>
        </View>

        {/* Header */}
        <VStack space="sm" className="mb-8">
          <Heading size="3xl" className="text-3xl font-dmsans-bold text-black">
            Welcome back
          </Heading>
          <Text className="text-base text-gray-600 dm-sans">
            Start finding jobs and growing your business
          </Text>
        </VStack>
        <LoginForm />
      </ScrollView>
    </SafeAreaView>
  );
}
