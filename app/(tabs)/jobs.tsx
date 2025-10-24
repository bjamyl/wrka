import { useState} from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View } from "react-native";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Tabs } from "@/components/Tabs";

export default function Jobs() {
  const [activeTab, setActiveTab] = useState('accepted');
  const tabs = [
  { id: 'accepted', label: 'Accepted', count: 5 },
  { id: 'active', label: 'Active', count: 2 },
  { id: 'completed', label: 'Completed', count: 2 },
];
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
           <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} variant="pills"/>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
