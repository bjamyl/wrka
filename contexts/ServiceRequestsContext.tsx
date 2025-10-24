import React, {
  createContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useHandymanProfile } from "@/hooks/useHandymanProfile";
import { useServiceRequestListener } from "@/hooks/events/useServiceRequestListener";
import { useNotification } from "./NotificationsContext";
import { ServiceRequest } from "@/types/service";
import { supabase } from "@/lib/supabase";

export const ServiceRequestContext = createContext<{
  incomingRequest: ServiceRequest | null;
  allRequests: ServiceRequest[];
  dismissRequest: () => void;
  acceptRequest: (requestId: string) => Promise<void>;
  rejectRequest: (requestId: string) => Promise<void>;
  isProcessing: boolean;
  loading: boolean;
  refetch: () => void;
}>({
  incomingRequest: null,
  allRequests: [],
  dismissRequest: () => {},
  acceptRequest: async () => {},
  rejectRequest: async () => {},
  isProcessing: false,
  loading: false,
  refetch: () => {},
});

export function ServiceRequestProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { handymanProfile } = useHandymanProfile();
  const handymanId = handymanProfile?.id || null;
  const { addNotification } = useNotification();

  // Use the dedicated service request listener hook
  const { requests, loading, refetch } = useServiceRequestListener(handymanId);

  console.log("service requests", requests);

  const [incomingRequest, setIncomingRequest] = useState<ServiceRequest | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const previousRequestsCount = useRef(0);
  const hasInitialized = useRef(false);

  // Detect new incoming requests and show notification
  useEffect(() => {
    console.log("useEffect is getting new requests...");
    if (loading) return;

    const currentCount = requests.length;

    console.log("current service requests", requests);
    console.log("current service requests length", currentCount);
    console.log("previous", previousRequestsCount.current);
    console.log("hasInitialized", hasInitialized.current);

    // On initial load, just set the count without triggering notifications
    if (!hasInitialized.current) {
      previousRequestsCount.current = currentCount;
      hasInitialized.current = true;
      console.log("Initial load - setting baseline count to", currentCount);
      return;
    }

    // If we have more requests than before, show the newest one
    if (currentCount > previousRequestsCount.current && currentCount > 0) {
      console.log("calling notification to show new request...");
      const newestRequest = requests[0]; // Requests are ordered by newest first
      setIncomingRequest(newestRequest);

      // Show unified notification with action buttons
      addNotification({
        type: newestRequest.priority === "urgent" ? "warning" : "info",
        category: "service_request",
        title: "🔔 New Job Request",
        message: newestRequest.title,
        duration: Infinity, // Don't auto-dismiss actionable notifications
        data: newestRequest, // Attach full request data
        actions: [
          {
            label: "View Details",
            action: () => {
              // Navigate to job details or show modal
              console.log("View request:", newestRequest.id);
            },
            style: "primary",
          },
          {
            label: "Dismiss",
            action: () => {
              setIncomingRequest(null);
            },
            style: "secondary",
          },
        ],
      });
    }

    previousRequestsCount.current = currentCount;
  }, [requests, loading, addNotification]);

  const dismissRequest = useCallback(() => {
    setIncomingRequest(null);
  }, []);

  const acceptRequest = useCallback(
    async (requestId: string) => {
      if (!handymanId) {
        console.error("No handyman profile found");
        return;
      }

      setIsProcessing(true);
      try {
        const { error } = await supabase
          .from("service_requests")
          .update({
            handyman_id: handymanId,
            status: "accepted",
            accepted_at: new Date().toISOString(),
          })
          .eq("id", requestId);

        if (error) throw error;

        setIncomingRequest(null);
        console.log("✅ Request accepted");

        // Refetch to update the list
        refetch();
      } catch (err) {
        console.error("❌ Error accepting request:", err);
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [handymanId, refetch],
  );

  const rejectRequest = useCallback(
    async (requestId: string) => {
      setIsProcessing(true);
      try {
        const { error } = await supabase
          .from("service_requests")
          .update({
            status: "rejected",
          })
          .eq("id", requestId);

        if (error) throw error;

        setIncomingRequest(null);
        console.log("❌ Request rejected");

        // Refetch to update the list
        refetch();
      } catch (err) {
        console.error("❌ Error rejecting request:", err);
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [refetch],
  );

  return (
    <ServiceRequestContext.Provider
      value={{
        incomingRequest,
        allRequests: requests,
        dismissRequest,
        acceptRequest,
        rejectRequest,
        isProcessing,
        loading,
        refetch,
      }}
    >
      {children}
    </ServiceRequestContext.Provider>
  );
}

export function useServiceRequest() {
  const context = React.useContext(ServiceRequestContext);
  if (!context) {
    throw new Error(
      "useServiceRequest must be used within ServiceRequestProvider",
    );
  }
  return context;
}
