import { CustomTabBar } from "@/components/navigation/CustomTabBar";
import { Tabs } from "expo-router";
import { useCallback } from "react";
import { Platform } from "react-native";

export default function TabLayout() {
  const renderTabBar = useCallback((props:any) => <CustomTabBar {...props} />, []);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: Platform.OS === "android",
        tabBarActiveTintColor: '#FFF'
      }}
      tabBar={renderTabBar}
    >

      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarLabel: "Home",
        
        }}
      
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: "Jobs",
          tabBarLabel: "Jobs",
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarLabel: "Messages",
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: "Earnings",
          tabBarLabel: "Earnings",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarLabel: "Profile",
        }}
      />

      
    </Tabs>
  );
}
