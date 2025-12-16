import { useConversation } from "@/hooks/messages/useConversation";
import { useMessages } from "@/hooks/messages/useMessages";
import { useSendMessage } from "@/hooks/messages/useSendMessage";
import type { Message } from "@/types/messages";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Send } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  ListRenderItem,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ConversationDetail = () => {
  
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: conversation } = useConversation(id);
  const { data: messages, isLoading, error } = useMessages(id);


  const { mutate: sendMessage, isPending: isSending } = useSendMessage();
  const [messageText, setMessageText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Scroll to bottom when keyboard shows
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  const handleSend = () => {
    if (messageText.trim() && !isSending) {
      sendMessage(
        {
          conversationId: id,
          content: messageText,
        },
        {
          onSuccess: () => {
            setMessageText("");
            Keyboard.dismiss();
          },
          onError: (error) => {
            
            console.error("Failed to send message:", error);
            // TODO: Show error toast
          },
        }
      );
    }
  };

  const renderMessage: ListRenderItem<Message> = ({ item }) => (
    <View
      className={`mb-3 ${item.isUser ? "items-end" : "items-start"}`}
    >
      <View
        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
          item.isUser
            ? "bg-black rounded-tr-sm"
            : "bg-gray-100 rounded-tl-sm"
        }`}
      >
        <Text
          className={`text-base font-dmsans ${
            item.isUser ? "text-white" : "text-black"
          }`}
        >
          {item.content}
        </Text>
        <Text
          className={`text-xs mt-1 font-dmsans ${
            item.isUser ? "text-gray-300" : "text-gray-500"
          }`}
        >
          {item.timestamp}
        </Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-6">
      <Text className="text-gray-600 font-dmsans text-center">
        No messages yet
      </Text>
      <Text className="text-gray-500 font-dmsans text-sm text-center mt-2">
        Start the conversation by sending a message
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color="#000" />
      <Text className="text-gray-600 font-dmsans text-center mt-4">
        Loading messages...
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View className="flex-1 justify-center items-center px-6">
      <Text className="text-gray-900 font-dmsans-bold text-lg text-center mb-2">
        Unable to load messages
      </Text>
      <Text className="text-gray-600 font-dmsans text-center">
        {error?.message || "Please try again later"}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header - stays fixed outside KeyboardAvoidingView */}
      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={24} color="#000" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-lg font-dmsans-bold text-black">
              {conversation?.client?.full_name || "Client"}
            </Text>
            <Text className="text-sm font-dmsans text-gray-600">
              {conversation?.job?.title || "Job"}
            </Text>
          </View>
        </View>
      </View>

      {/* Messages + Input wrapped in KeyboardAvoidingView */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 56 : 0}
      >
        {/* Messages */}
        <View className="flex-1">
          {isLoading ? (
            renderLoadingState()
          ) : error ? (
            renderErrorState()
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingTop: 16,
                paddingBottom: 8,
                flexGrow: 1,
              }}
              ListEmptyComponent={renderEmptyState}
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
              keyboardDismissMode="interactive"
              keyboardShouldPersistTaps="handled"
            />
          )}
        </View>

        {/* Input */}
        <View
          className="px-4 py-3 bg-white border-t border-gray-200"
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
        >
          <View className="flex-row items-center">
            <TextInput
              className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-base font-dmsans text-black mr-2"
              placeholder="Type a message..."
              placeholderTextColor="#9CA3AF"
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={500}
              editable={!isSending}
            />
            <Pressable
              onPress={handleSend}
              disabled={!messageText.trim() || isSending}
              className={`w-12 h-12 rounded-full items-center justify-center ${
                messageText.trim() && !isSending
                  ? "bg-black"
                  : "bg-gray-300"
              }`}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Send
                  size={20}
                  color="#fff"
                  fill={messageText.trim() ? "#fff" : "transparent"}
                />
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ConversationDetail;
