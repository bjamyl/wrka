import { supabase } from "@/lib/supabase";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";

type LocationBroadcastStatus = "idle" | "requesting_permission" | "broadcasting" | "error";

/**
 * Hook for handyman to broadcast their location while traveling to a job
 * Uses expo-location for GPS tracking and Supabase Broadcast for real-time updates
 *
 * @param bookingId - The booking being traveled to
 * @param isActive - Whether to actively broadcast (true when status is 'on_the_way')
 */
export function useLocationBroadcast(
  bookingId: string | null,
  isActive: boolean
) {
  const [status, setStatus] = useState<LocationBroadcastStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    if (!isActive || !bookingId) {
      // Cleanup if not active
      cleanup();
      setStatus("idle");
      return;
    }

    let isMounted = true;

    async function startBroadcasting() {
      try {
        setStatus("requesting_permission");
        setError(null);

        // Request foreground location permission
        const { status: permissionStatus } =
          await Location.requestForegroundPermissionsAsync();

        if (!isMounted) return;

        if (permissionStatus !== "granted") {
          setError("Location permission denied");
          setStatus("error");
          return;
        }

        // Create and subscribe to broadcast channel
        channelRef.current = supabase.channel(`location:${bookingId}`);
        await channelRef.current.subscribe();

        if (!isMounted) return;

        // Start watching position
        subscriptionRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 10, // Update every 10 meters
            timeInterval: 3000, // Or every 3 seconds
          },
          (location) => {
            if (!channelRef.current) return;

            // Broadcast location (no database storage)
            channelRef.current.send({
              type: "broadcast",
              event: "location",
              payload: {
                lat: location.coords.latitude,
                lng: location.coords.longitude,
                heading: location.coords.heading,
                timestamp: Date.now(),
              },
            });
          }
        );

        if (!isMounted) {
          cleanup();
          return;
        }

        setStatus("broadcasting");
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to start location tracking");
        setStatus("error");
      }
    }

    startBroadcasting();

    return () => {
      isMounted = false;
      cleanup();
    };
  }, [bookingId, isActive]);

  function cleanup() {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }

  return { status, error };
}
