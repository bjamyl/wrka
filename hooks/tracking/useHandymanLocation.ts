import { supabase } from "@/lib/supabase";
import { HandymanLocationBroadcast } from "@/types/service";
import { useEffect, useState } from "react";

/**
 * Hook for customers to receive real-time location updates from handyman
 * Uses Supabase Broadcast (ephemeral - no database storage)
 *
 * @param bookingId - The booking to track
 * @param isTracking - Whether to actively listen (true when status is 'on_the_way')
 */
export function useHandymanLocation(
  bookingId: string | null,
  isTracking: boolean
) {
  const [location, setLocation] = useState<HandymanLocationBroadcast | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isTracking || !bookingId) {
      setLocation(null);
      setIsConnected(false);
      return;
    }

    const channel = supabase
      .channel(`location:${bookingId}`)
      .on("broadcast", { event: "location" }, (payload) => {
        setLocation(payload.payload as HandymanLocationBroadcast);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true);
          console.log(`Listening for location updates: ${bookingId}`);
        } else {
          setIsConnected(false);
        }
      });

    return () => {
      supabase.removeChannel(channel);
      setLocation(null);
      setIsConnected(false);
    };
  }, [bookingId, isTracking]);

  return { location, isConnected };
}
