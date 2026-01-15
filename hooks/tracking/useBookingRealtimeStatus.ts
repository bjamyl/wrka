import { supabase } from "@/lib/supabase";
import { ServiceRequestStatus } from "@/types/service";
import { useEffect, useCallback, useRef } from "react";

type StatusChangeCallback = (status: ServiceRequestStatus) => void;

/**
 * Hook to subscribe to real-time status changes for a specific booking
 * Uses Supabase Postgres Changes to listen for UPDATE events
 */
export function useBookingRealtimeStatus(
  bookingId: string | null,
  onStatusChange: StatusChangeCallback
) {
  const callbackRef = useRef(onStatusChange);

  // Keep callback ref updated without triggering re-subscription
  useEffect(() => {
    callbackRef.current = onStatusChange;
  }, [onStatusChange]);

  useEffect(() => {
    if (!bookingId) return;

    const channel = supabase
      .channel(`booking-status:${bookingId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "service_requests",
          filter: `id=eq.${bookingId}`,
        },
        (payload) => {
          const newStatus = payload.new.status as ServiceRequestStatus;
          callbackRef.current(newStatus);
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(`Subscribed to booking status: ${bookingId}`);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId]);
}
