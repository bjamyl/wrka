import React from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';

export interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'default' | 'pills';
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  variant = 'default',
}) => {
  if (variant === 'pills') {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
        className="mb-6"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onTabChange(tab.id)}
              className={`px-4 py-2.5 rounded-full ${
                isActive ? 'bg-black' : 'bg-gray-100'
              }`}
            >
              <Text
                className={`font-dmsans-medium text-sm ${
                  isActive ? 'text-white' : 'text-gray-600'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && ` (${tab.count})`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  }

  // Default variant - underline style
  return (
    <View className="border-b border-gray-200 px-6 mb-6">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 24 }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onTabChange(tab.id)}
              className="pb-3"
              style={{
                borderBottomWidth: 2,
                borderBottomColor: isActive ? '#000' : 'transparent',
              }}
            >
              <Text
                className={`font-dmsans-medium text-sm ${
                  isActive ? 'text-black' : 'text-gray-500'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <Text
                    className={`ml-1 ${
                      isActive ? 'text-black' : 'text-gray-400'
                    }`}
                  >
                    ({tab.count})
                  </Text>
                )}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};