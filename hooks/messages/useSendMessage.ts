import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useHandymanProfile } from "../useHandymanProfile";

interface SendMessageParams {
  conversationId: string;
  content: string;
}

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const {handymanProfile} = useHandymanProfile();

  console.log('handyman profile', handymanProfile)

  return useMutation({
    mutationFn: async ({ conversationId, content }: SendMessageParams) => {
      if (!handymanProfile?.profile_id) {
        throw new Error("No handyman profile found");
      }

      // Insert the message
      const { data: message, error: messageError } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: handymanProfile.profile_id,
          content: content.trim(),
        })
        .select()
        .single();

      if (messageError) {
        console.error("Error sending message:", messageError);
        throw messageError;
      }

      // Update conversation's last_message_at
      const { error: conversationError } = await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", conversationId);

      if (conversationError) {
        console.error("Error updating conversation:", conversationError);
        // Don't throw here, message was sent successfully
      }

      return message;
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch messages for this conversation
      queryClient.invalidateQueries({
        queryKey: ["messages", variables.conversationId],
      });

      // Invalidate conversations list to update last message
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
    onError(error) {
      
        console.log('sending message failed', error)
    },
  });
};
