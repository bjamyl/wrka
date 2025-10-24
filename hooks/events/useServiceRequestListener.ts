import { supabase } from "@/lib/supabase";
import { ServiceRequest } from "@/types/service";
import { useEffect, useState, useCallback } from "react";

export function useServiceRequestListener(handymanId: string | null) {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!handymanId) {
      setRequests([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from("service_requests")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setRequests(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [handymanId]);

  useEffect(() => {
    if (!handymanId) {
      setRequests([]);
      setLoading(false);
      return;
    }

    // Reset loading state when handymanId becomes available
    setLoading(true);

    // Fetch initial data
    fetchRequests();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel("service-requests")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to INSERT, UPDATE, DELETE
          schema: "public",
          table: "service_requests",
          filter: `status=eq.pending`, // Only pending requests
        },
        (payload) => {
          console.log("Real-time update:", payload);

          if (payload.eventType === "INSERT") {
            // New request came in
            setRequests((prev) => [payload.new as ServiceRequest, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            // Request was accepted/rejected by another handyman
            setRequests((prev) =>
              prev.filter((req) => req.id !== payload.new.id),
            );
          } else if (payload.eventType === "DELETE") {
            // Request was cancelled
            setRequests((prev) =>
              prev.filter((req) => req.id !== payload.old.id),
            );
          }
        },
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });

    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, [handymanId, fetchRequests]);

  return { requests, loading, error, refetch: fetchRequests };
}
