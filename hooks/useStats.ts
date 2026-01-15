import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { useHandymanProfile } from "./useHandymanProfile";

interface HandymanStats {
  activeJobs: number;
  completedJobs: number;
  rating: number | null;
}

const fetchHandymanStats = async (
  handymanId: string
): Promise<HandymanStats> => {
  // Fetch all stats in parallel
  const [activeJobsResult, completedJobsResult, ratingsResult] =
    await Promise.all([
      // Count active jobs (accepted or in_progress)
      supabase
        .from("service_requests")
        .select("id", { count: "exact", head: true })
        .eq("handyman_id", handymanId)
        .in("status", ["accepted", "in_progress"]),

      // Count completed jobs
      supabase
        .from("service_requests")
        .select("id", { count: "exact", head: true })
        .eq("handyman_id", handymanId)
        .eq("status", "completed"),

      // Get all ratings to calculate average
      supabase
        .from("reviews")
        .select("rating")
        .eq("handyman_id", handymanId),
    ]);

  // Handle errors
  if (activeJobsResult.error) throw activeJobsResult.error;
  if (completedJobsResult.error) throw completedJobsResult.error;
  if (ratingsResult.error) throw ratingsResult.error;

  // Calculate average rating
  let averageRating: number | null = null;
  if (ratingsResult.data && ratingsResult.data.length > 0) {
    const totalRating = ratingsResult.data.reduce(
      (sum, review) => sum + (review.rating || 0),
      0
    );
    averageRating =
      Math.round((totalRating / ratingsResult.data.length) * 10) / 10;
  }

  return {
    activeJobs: activeJobsResult.count ?? 0,
    completedJobs: completedJobsResult.count ?? 0,
    rating: averageRating,
  };
};

export const useStats = () => {
  const { handymanProfile } = useHandymanProfile();

  const {
    data: stats,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ["handyman-stats", handymanProfile?.id],
    queryFn: () => fetchHandymanStats(handymanProfile!.id),
    enabled: !!handymanProfile?.id,
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 5, // Refresh every 5 minutes
  });

  return {
    stats: stats ?? {
      activeJobs: 0,
      completedJobs: 0,
      rating: null,
    },
    loading,
    error: queryError?.message ?? null,
    refetch,
  };
};
