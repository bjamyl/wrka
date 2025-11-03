import React from 'react';
import { ScrollView, TouchableOpacity, View,Text } from 'react-native';

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
        contentContainerStyle={{display:"flex", flexDirection:"row", justifyContent:"space-between", width:"100%" }}
        className="mb-6 flex flex-row"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <View
              key={tab.id}
             className={`px-6 py-3 rounded-full ${
                isActive ? 'bg-black' : 'bg-gray-100'
              }`}
            >
              <TouchableOpacity
              onPress={() => onTabChange(tab.id)}
          
            >
              <Text
                className={`font-dmsans-medium text-sm ${
                  isActive ? 'text-[#ffff]' : 'text-gray-600'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && ` (${tab.count})`}
              </Text>
            </TouchableOpacity>
            </View>
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
