import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ServiceRequestWithDetails } from '@/types/service';
import { useHandymanProfile } from './useHandymanProfile';

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

const fetchServiceRequests = async (
  categoryId?: string,
  handymanLat?: number,
  handymanLng?: number
): Promise<ServiceRequestWithDetails[]> => {
  let query = supabase
    .from('service_requests')
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
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  // Filter by category if specified
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Transform and calculate distances
  const requestsWithDetails: ServiceRequestWithDetails[] = (data || []).map(
    (request: any) => {
      const transformed: ServiceRequestWithDetails = {
        ...request,
        customer: request.customer
          ? {
              id: request.customer.id,
              full_name: request.customer.full_name,
              avatar_url: request.customer.avatar_url,
              phone_number: request.customer.phone_number,
            }
          : undefined,
        category: request.category || undefined,
      };

      // Calculate distance if handyman location is available
      if (handymanLat && handymanLng && request.location_lat && request.location_lng) {
        transformed.distance_km = calculateDistance(
          handymanLat,
          handymanLng,
          request.location_lat,
          request.location_lng
        );
      }

      return transformed;
    }
  );

  // Sort by distance if available, otherwise by created_at
  return requestsWithDetails.sort((a, b) => {
    if (a.distance_km !== undefined && b.distance_km !== undefined) {
      return a.distance_km - b.distance_km;
    }
    return 0; // Keep database order (already sorted by created_at DESC)
  });
};

export const useServiceRequests = (categoryId?: string) => {
  const { handymanProfile } = useHandymanProfile();

  const {
    data: requests,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['service-requests', categoryId],
    queryFn: () =>
      fetchServiceRequests(
        categoryId,
        handymanProfile?.location_lat,
        handymanProfile?.location_lng
      ),
    enabled: true, // Always enabled, even without handyman location
    staleTime: 1000 * 30, // 30 seconds - requests change frequently
    refetchInterval: 1000 * 60, // Auto-refetch every minute
  });

  return {
    requests: requests ?? [],
    loading,
    error: queryError?.message ?? null,
    refetch,
  };
};
