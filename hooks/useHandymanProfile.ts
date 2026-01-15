import { supabase } from "@/lib/supabase";
import { HandymanProfile } from "@/types/profile";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

const fetchHandymanProfile = async (): Promise<HandymanProfile | null> => {
  // Check for active session first
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return null; // No session, return null instead of throwing
  }

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) return null;

  // Fetch handyman profile data
  const { data: handymanData, error: handymanError } = await supabase
    .from("handyman_profiles")
    .select("*")
    .eq("profile_id", user.id)
    .single();

  if (handymanError) {
    // If no handyman profile exists, that's okay - return null
    if (handymanError.code === "PGRST116") {
      return null;
    }
    throw handymanError;
  }

  return handymanData as HandymanProfile;
};

const updateHandymanAvailability = async (
  isAvailable: boolean,
): Promise<HandymanProfile> => {
  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("No user found");

  // Update availability
  const { data, error: updateError } = await supabase
    .from("handyman_profiles")
    .update({ is_available: isAvailable })
    .eq("profile_id", user.id)
    .select()
    .single();

  if (updateError) throw updateError;

  return data as HandymanProfile;
};

export type HandymanProfileUpdate = Partial<{
  bio: string | null;
  years_experience: number | null;
  hourly_rate: number | null;
  is_available: boolean;
  is_verified: boolean;
  rating: number | null;
  total_jobs: number | null;
  location_lat: number | null;
  location_lng: number | null;
  service_radius: number | null;
  certified: boolean;
  certificates: Record<string, any> | null;
}>;

export interface UpdateHandymanProfileResponse {
  success: boolean;
  data?: any;
  error?: string;
  details?: string;
}

/**
 * Generic mutation to update handyman profile fields
 * Automatically handles timestamps and error handling
 *
 * @param handymanId - The handyman profile ID (UUID)
 * @param updates - Object containing fields to update
 * @returns Promise with success status and error details if applicable
 *
 * @example
 * // Update availability
 * await updateHandymanProfile(handymanId, { is_available: true })
 *
 * // Update multiple fields
 * await updateHandymanProfile(handymanId, {
 *   hourly_rate: 50,
 *   bio: "Expert plumber with 10 years experience"
 * })
 *
 * // Update location
 * await updateHandymanProfile(handymanId, {
 *   location_lat: 40.7128,
 *   location_lng: -74.0060,
 *   service_radius: 15
 * })
 */
export async function updateHandymanProfile(
  handymanId: string,
  updates: HandymanProfileUpdate,
): Promise<UpdateHandymanProfileResponse> {
  try {
    // Validate handyman ID
    if (!handymanId || !handymanId.trim()) {
      return {
        success: false,
        error: "Invalid handyman ID",
        details: "Handyman ID is required",
      };
    }

    // Validate updates object
    if (!updates || Object.keys(updates).length === 0) {
      return {
        success: false,
        error: "No fields to update",
        details: "At least one field must be provided for update",
      };
    }

    // Filter out undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined),
    );

    if (Object.keys(cleanUpdates).length === 0) {
      return {
        success: false,
        error: "No valid fields to update",
        details: "All provided fields were undefined",
      };
    }

    // Perform the update
    const { data, error } = await supabase
      .from("handyman_profiles")
      .update(cleanUpdates)
      .eq("id", handymanId)
      .select()
      .single();

    // Handle Supabase errors
    if (error) {
      return {
        success: false,
        error: "Failed to update handyman profile",
        details: error.message,
      };
    }

    // Handle no data returned
    if (!data) {
      return {
        success: false,
        error: "Profile not found",
        details: `No handyman profile found with ID: ${handymanId}`,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";

    return {
      success: false,
      error: "An unexpected error occurred",
      details: errorMessage,
    };
  }
}

export const useHandymanProfile = () => {
  const queryClient = useQueryClient();

  const {
    data: handymanProfile,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ["handyman-profile"],
    queryFn: fetchHandymanProfile,
    retry: 1,
    
  });

  const updateAvailabilityMutation = useMutation({
    mutationFn: updateHandymanAvailability,
    onSuccess: (data:any) => {
      // Update the cache with the new data
      queryClient.setQueryData(["handyman-profile"], data);
    },
    onError: (err: any) => {
      console.error("Error updating availability:", err);
      Alert.alert("Error", "Failed to update availability");
    },
  });

  const updateAvailability = async (isAvailable: boolean) => {
    try {
      const data = await updateAvailabilityMutation.mutateAsync(isAvailable);
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  };

  return {
    handymanProfile: handymanProfile ?? null,
    loading,
    updating: updateAvailabilityMutation.isPending,
    error: queryError?.message ?? null,
    refetch,
    updateAvailability,
  };
};
