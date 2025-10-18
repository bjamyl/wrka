import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View } from "react-native";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

export default function Messages() {
  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="px-6 py-4">
          <Heading size="2xl" className="text-black mb-2">
            Messages
          </Heading>
          <Text size="md" className="text-gray-600">
            Chat with clients and manage conversations
          </Text>

          {/* Placeholder for messages list */}
          <View className="mt-6">
            <Text size="sm" className="text-gray-500 text-center mt-20">
              Your messages will appear here
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
