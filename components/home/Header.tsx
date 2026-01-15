import {
  Avatar,
  AvatarBadge,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "expo-router";
import { LogOut } from "lucide-react-native";
import React from "react";
import { Alert, Pressable, Text, View } from "react-native";

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
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogoutPress = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log Out",
          style: "destructive",
          onPress: onLogout,
        },
      ]
    );
  };

  const onLogout = async () => {
    const result = await logout();

    if (result.error === null) {
      router.replace("/(auth)/login");
    }
  };
  return (
    <View className="flex flex-row justify-between items-center">
      <View className="flex flex-row gap-2">
        <Avatar size="sm">
          <AvatarFallbackText>{firstName}</AvatarFallbackText>
          {avatarUrl && (
            <AvatarImage
              source={{
                uri: avatarUrl,
              }}
            />
          )}
          {isAvailable && <AvatarBadge />}
        </Avatar>
        <View>
          <Text className="font-dmsans-bold text-2xl">
            Welcome back, {firstName}
          </Text>
          <Text className="font-dmsans text-gray-500">
            Let&apos;s get to work!
          </Text>
        </View>
      </View>
      <Pressable onPress={handleLogoutPress}>
        <LogOut size={24} color="#000" />
      </Pressable>
    </View>
  );
}
