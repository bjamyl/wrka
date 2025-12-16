import { supabase } from "@/lib/supabase";
import type { Message } from "@/types/messages";
import { useQuery } from "@tanstack/react-query";
import { format, isToday, isYesterday } from "date-fns";
import { useHandymanProfile } from "../useHandymanProfile";

// Helper function to format message timestamp
const formatMessageTime = (date: string): string => {
  const messageDate = new Date(date);

  if (isToday(messageDate)) {
    return format(messageDate, "HH:mm");
  } else if (isYesterday(messageDate)) {
    return `Yesterday ${format(messageDate, "HH:mm")}`;
  } else {
    return format(messageDate, "MMM d, HH:mm");
  }
};

export const useMessages = (conversationId: string) => {
  const { handymanProfile } = useHandymanProfile();

  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey (
            id,
            full_name
          )
        `)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        throw error;
      }

      // Transform to UI format
      const transformedMessages: Message[] = (data || []).map((msg: any) => ({
        id: msg.id,
        sender: msg.sender?.full_name || "Unknown",
        content: msg.content,
        timestamp: formatMessageTime(msg.created_at),
        isUser: msg.sender_id === handymanProfile?.profile_id,
        senderId: msg.sender_id,
        createdAt: msg.created_at,
      }));

      return transformedMessages;
    },
    enabled: !!conversationId && !!handymanProfile?.profile_id,
    refetchInterval: 5000, // Poll for new messages every 5 seconds
  });
};
