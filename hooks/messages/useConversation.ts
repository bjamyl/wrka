import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

export const useConversation = (conversationId: string) => {
  return useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          *,
          client:profiles!conversations_client_id_fkey (
            id,
            full_name,
            phone_number
          ),
          job:service_requests!conversations_job_id_fkey (
            id,
            title,
            category:service_categories!service_requests_category_id_fkey (
              name,
              icon_name,
              color
            )
          )
        `)
        .eq("id", conversationId)
        .single();

      if (error) {
        console.error("Error fetching conversation:", error);
        throw error;
      }

      return data;
    },
    enabled: !!conversationId,
  });
};
