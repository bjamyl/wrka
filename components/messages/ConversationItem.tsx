import { type Conversation } from "@/types/messages";
import { FC } from "react";
import { Pressable } from "react-native";
import { Box } from "../ui/box";
import { Text } from "../ui/text";
import { HStack } from "../ui/hstack";
import { Avatar, AvatarFallbackText } from "../ui/avatar";
import { StatusIndicator } from "./StatusIndicator";
import { VStack } from "../ui/vstack";

// Conversation Item Component
interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onPress: (conversation: Conversation) => void;
}

export const ConversationItem: FC<ConversationItemProps> = ({
  conversation,
  isSelected,
  onPress,
}) => (
  <Pressable
    onPress={() => {
      console.log("Conversation pressed:", conversation.id);
      onPress(conversation);
    }}
    style={{
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: isSelected ? "#EFF6FF" : "#FFFFFF",
      borderBottomWidth: 1,
      borderBottomColor: "#E5E7EB",
    }}
  >
    <HStack space="md" alignItems="flex-start">
      <Box position="relative">
        <Avatar bgColor="$blue500" size="md">
          <AvatarFallbackText>{conversation.initials}</AvatarFallbackText>
        </Avatar>
        <StatusIndicator status={conversation.status} />
      </Box>

      <VStack flex={1} space="xs">
        <HStack justifyContent="space-between" alignItems="center">
          <Text size="sm" bold numberOfLines={1} sx={{ flex: 1 }}>
            {conversation.name}
          </Text>
          {conversation.isPinned && (
            <Text size="xs" sx={{ ml: "$2" }}>
              📌
            </Text>
          )}
        </HStack>

        <Text size="xs" sx={{ color: "$coolGray700" }}>
          {conversation.jobTitle}
        </Text>

        <Text
          size="sm"
          numberOfLines={1}
          sx={{
            color: conversation.unread ? "$textDark900" : "$coolGray700",
            fontWeight: conversation.unread ? "$bold" : "$normal",
          }}
        >
          {conversation.lastMessage}
        </Text>
      </VStack>

      <VStack alignItems="flex-end" space="xs">
        <Text size="xs" sx={{ color: "$coolGray700" }}>
          {conversation.timestamp}
        </Text>
        {conversation.unread && (
          <Box
            sx={{
              w: "$2.5",
              h: "$2.5",
              rounded: "$full",
              bg: "$blue500",
            }}
          />
        )}
      </VStack>
    </HStack>
  </Pressable>
);
