import type { Conversation } from "@/types/messages";
import { MessageCircle, Search } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, FlatList, ListRenderItem, Pressable, RefreshControl, Text, TextInput, View } from "react-native";

import { ConversationItem } from "@/components/messages/ConversationItem";
import { Divider } from "@/components/ui/divider";
import { useConversations } from "@/hooks/messages/useConversations";
import { useRouter } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

const Messages = () => {
  const { data: conversations, isLoading, error, refetch } = useConversations();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const filteredConversations: Conversation[] = (conversations || []).filter(
    (conv: Conversation): boolean =>
      conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSelectConversation = (conversation: Conversation): void => {
    console.log("Navigating to conversation:", conversation.id);
    console.log("Navigation path:", `/conversation/${conversation.id}`);
    try {
      router.push({
        pathname: '/conversation/[id]',
        params: {id: conversation.id}
      });
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  const renderConversationItem: ListRenderItem<Conversation> = ({ item }) => (
    <ConversationItem
      conversation={item}
      isSelected={false}
      onPress={handleSelectConversation}
    />
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center py-10">
      <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
        <MessageCircle size={32} color="#9CA3AF" />
      </View>
      <Text className="text-gray-600 font-dmsans text-center">
        {searchQuery ? "No conversations found" : "No conversations yet"}
      </Text>
      {!searchQuery && (
        <Text className="text-gray-500 font-dmsans text-sm text-center mt-2 px-8">
          Start conversations with clients when you accept jobs
        </Text>
      )}
    </View>
  );

  const renderLoadingState = () => (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color="#000" />
      <Text className="text-gray-600 font-dmsans text-center mt-4">
        Loading conversations...
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View className="flex-1 justify-center items-center py-10 px-6">
      <View className="w-20 h-20 rounded-full bg-red-100 items-center justify-center mb-4">
        <MessageCircle size={32} color="#EF4444" />
      </View>
      <Text className="text-gray-900 font-dmsans-bold text-lg text-center mb-2">
        We couldn&apos;t get your conversations
      </Text>
      <Text className="text-gray-600 font-dmsans text-center mb-6">
        {error?.message || "Please try again later"}
      </Text>
      <Pressable
        onPress={handleRefresh}
        className="bg-black px-6 py-3 rounded-full"
        disabled={isRefreshing}
      >
        {isRefreshing ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text className="text-white font-dmsans-bold">Try Again</Text>
        )}
      </Pressable>
    </View>
  );

  if (isLoading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView edges={["top"]} className="flex-1 bg-white">
          {renderLoadingState()}
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  if (error) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView edges={["top"]} className="flex-1 bg-white">
          {renderErrorState()}
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView edges={["top"]} className="flex-1 bg-white">
       
        <View className="px-6 py-4 bg-white">
          <Text className="font-dmsans-bold text-3xl mb-4">Messages</Text>

        
          <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
            <Search size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
            <TextInput
              className="flex-1 text-base text-black font-dmsans"
              placeholder="Search conversations..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

         <Divider className="my-0.5" />

        <FlatList
          className="px-6 py-4"
          data={filteredConversations}
          renderItem={renderConversationItem}
          keyExtractor={(item: Conversation): string => item.id}
          scrollEnabled
          ListEmptyComponent={renderEmptyState}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#000"
              colors={["#000"]}
            />
          }
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default Messages;
