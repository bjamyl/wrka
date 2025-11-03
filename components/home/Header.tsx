import {
  Avatar,
  AvatarBadge,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import React from "react";
import { Text, View } from "react-native";
import {  Bell } from "lucide-react-native";

type HeaderProps = {
  firstName: string;
  avatarUrl?: string;
  isAvailable: boolean;
};

export default function Header({
  firstName,
  avatarUrl,
  isAvailable,
}: HeaderProps) {
  return (
    <View className="flex flex-row justify-between">
      <View className="flex flex-row gap-2">
        <Avatar size="sm">
          <AvatarFallbackText>{firstName}</AvatarFallbackText>
          <AvatarImage
            source={{
              uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
            }}
          />
          {isAvailable && <AvatarBadge />}
        </Avatar>
        <View>
          <Text className="font-dmsans-bold text-2xl">Welcome back, Jamil</Text>
          <Text className="font-dmsans text-gray-500">
            Let&apos;s get to work!
          </Text>
        </View>
      </View>
      <View className="relative">
        <Bell/>
        <View className="bg-red-500 w-2 h-2 rounded-full absolute right-[2px]"></View>
      </View>
    </View>
  );
}
