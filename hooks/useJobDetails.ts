import { supabase } from "@/lib/supabase";
import { ServiceRequestStatus, ServiceRequestWithDetails } from "@/types/service";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { useServiceRequests } from "./useServiceRequests";

const fetchServiceRequestDetails = async (
  requestId: string
): Promise<ServiceRequestWithDetails> => {
  const { data, error } = await supabase
    .from("service_requests")
    .select(
      `
      *,
      customer:profiles!customer_id(
        id,
        full_name,
        avatar_url,
        phone_number
      ),
      category:service_categories!category_id(
        id,
        name,
        icon_name,
        color
      )
    `
    )
    .eq("id", requestId)
    .single();

  if (error) throw error;
  if (!data) throw new Error("Service request not found");

  return {
    ...data,
    customer: data.customer
      ? {
          id: data.customer.id,
          full_name: data.customer.full_name,
          avatar_url: data.customer.avatar_url,
          phone_number: data.customer.phone_number,
        }
      : undefined,
    category: data.category || undefined,
  };
};

export function useJobDetails(requestId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    acceptRequestAsync,
    isAccepting,
    acceptError,
    declineRequestAsync,
    isDeclining,
    declineError,
  } = useServiceRequests();

  const {
    data: request,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["service-request", requestId],
    queryFn: () => fetchServiceRequestDetails(requestId),
    enabled: !!requestId,
  });

  const handleAcceptJob = async () => {
    try {
      await acceptRequestAsync(requestId);
      Alert.alert("Success", "Job accepted successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (err) {
      Alert.alert(
        "Error",
        acceptError || "Failed to accept job. It may have been taken by another handyman.",
        [{ text: "OK" }]
      );
    }
  };

  const handleDeclineJob = async () => {
    Alert.alert("Decline Job", "Are you sure you want to decline this job?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Decline",
        style: "destructive",
        onPress: async () => {
          try {
            await declineRequestAsync(requestId);
            router.back();
          } catch (err) {
            Alert.alert(
              "Error",
              declineError || "Failed to decline job. Please try again.",
              [{ text: "OK" }]
            );
          }
        },
      },
    ]);
  };

  const handleCancelJob = async () => {
    Alert.alert(
      "Cancel Job",
      "Are you sure you want to cancel this job? This action cannot be undone.",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("service_requests")
                .update({ status: "cancelled" })
                .eq("id", requestId)
                .eq("status", "accepted");

              if (error) throw error;

              Alert.alert("Job Cancelled", "The job has been cancelled successfully.", [
                {
                  text: "OK",
                  onPress: () => router.back(),
                },
              ]);
            } catch (err) {
              Alert.alert("Error", "Failed to cancel job. Please try again.", [{ text: "OK" }]);
            }
          },
        },
      ]
    );
  };

  const handleJobFinished = () => {
    refetch();
    router.back();
  };

  const handleTrackingStatusChange = (newStatus: ServiceRequestStatus) => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ["handyman-jobs"] });
  };

  const isProcessing = isAccepting || isDeclining;

  return {
    request,
    isLoading,
    error,
    refetch,
    isProcessing,
    isAccepting,
    isDeclining,
    handleAcceptJob,
    handleDeclineJob,
    handleCancelJob,
    handleJobFinished,
    handleTrackingStatusChange,
  };
}
