import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View } from "react-native";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

export default function Jobs() {
  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="px-6 py-4">
          <Heading size="2xl" className="text-black mb-2">
            My Jobs
          </Heading>
          <Text size="md" className="text-gray-600">
            Track your active and completed bookings
          </Text>

          {/* Placeholder for jobs list */}
          <View className="mt-6">
            <Text size="sm" className="text-gray-500 text-center mt-20">
              Your jobs will appear here
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
