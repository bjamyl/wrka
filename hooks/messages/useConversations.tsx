import { supabase } from "@/lib/supabase";
import type { Conversation, ConversationWithDetails } from "@/types/messages";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { useHandymanProfile } from "../useHandymanProfile";

// Helper function to get initials from name
const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Helper function to format timestamp
const formatTimestamp = (date: string): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const useConversations = () => {
  const { handymanProfile } = useHandymanProfile();

  return useQuery({
    queryKey: ["conversations", handymanProfile?.profile_id],
    queryFn: async () => {
      if (!handymanProfile?.profile_id) {
        throw new Error("No handyman profile found");
      }

      const { data, error } = await supabase
        .from("conversations")
        .select(
          `
          *,
          client:profiles!conversations_client_id_fkey (
            id,
            full_name,
            phone_number
          ),
              job:service_requests!conversations_job_id_fkey (
                id,
                title,
                category:service_categories (
                name,
                icon_name,
                color
               )
        )
        `
        )
        .eq("handyman_id", handymanProfile.profile_id)
        .order("last_message_at", { ascending: false, nullsFirst: false });

        console.log('conversations data')

      if (error) {
        console.error("Error fetching conversations:", error);
        throw error;
      }

      // For each conversation, get the last message
      const conversationsWithMessages = await Promise.all(
        (data || []).map(async (conv: any) => {
          const { data: messages } = await supabase
            .from("messages")
            .select("content, created_at, sender_id")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1);

          return {
            ...conv,
            lastMessage: messages?.[0] || null,
          } as ConversationWithDetails & { lastMessage: any };
        })
      );

      // Transform to UI format
      const transformedConversations: Conversation[] =
        conversationsWithMessages.map((conv) => ({
          id: conv.id,
          name: conv.client?.full_name || "Unknown Client",
          initials: getInitials(conv.client?.full_name || "UK"),
          lastMessage: conv.lastMessage?.content || "No messages yet",
          timestamp: conv.lastMessage
            ? formatTimestamp(conv.lastMessage.created_at)
            : formatTimestamp(conv.created_at),
          unread: false, // TODO: Implement unread logic based on read_at
          isPinned: false, // TODO: Implement pinned conversations if needed
          status: "offline" as const, // TODO: Implement online status if needed
          jobTitle: conv.job?.title || "Unknown Job",
          jobId: conv.job_id,
          clientId: conv.client_id,
        }));

      return transformedConversations;
    },
    enabled: !!handymanProfile?.profile_id,
  });
};
