import { supabase } from "@/lib/supabase";
import { ServiceRequestStatus } from "@/types/service";

type UpdateResult = {
  success: boolean;
  error?: string;
};

/**
 * Update booking status with automatic timestamp handling
 * Automatically sets the appropriate timestamp field based on the new status
 */
export async function updateBookingStatus(
  bookingId: string,
  status: ServiceRequestStatus
): Promise<UpdateResult> {
  try {
    const updates: Record<string, any> = { status };
    const now = new Date().toISOString();

    // Add timestamps for specific status transitions
    switch (status) {
      case "accepted":
        updates.accepted_at = now;
        break;
      case "on_the_way":
        updates.departed_at = now;
        break;
      case "in_progress":
        updates.started_at = now;
        break;
      case "completed":
        updates.completed_at = now;
        break;
    }

    const { error } = await supabase
      .from("service_requests")
      .update(updates)
      .eq("id", bookingId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }
}

/**
 * Validates if a status transition is allowed
 * Returns true if the transition is valid
 */
export function isValidStatusTransition(
  currentStatus: ServiceRequestStatus,
  newStatus: ServiceRequestStatus
): boolean {
  const validTransitions: Record<ServiceRequestStatus, ServiceRequestStatus[]> = {
    pending: ["accepted", "rejected", "cancelled"],
    accepted: ["on_the_way", "cancelled"],
    on_the_way: ["arrived", "cancelled"],
    arrived: ["in_progress", "cancelled"],
    in_progress: ["completed"],
    completed: [],
    rejected: [],
    cancelled: [],
  };

  return validTransitions[currentStatus]?.includes(newStatus) ?? false;
}
