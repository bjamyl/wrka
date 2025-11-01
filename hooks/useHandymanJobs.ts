import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ServiceRequestWithDetails } from '@/types/service';
import { useHandymanProfile } from './useHandymanProfile';

type JobStatus = 'accepted' | 'in_progress' | 'completed' | 'cancelled';

const fetchHandymanJobs = async (
  handymanId: string,
  status?: JobStatus
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
    .eq('handyman_id', handymanId)
    .order('created_at', { ascending: false });

  // Filter by status if specified
  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Transform the data
  const jobsWithDetails: ServiceRequestWithDetails[] = (data || []).map(
    (job: any) => ({
      ...job,
      customer: job.customer
        ? {
            id: job.customer.id,
            full_name: job.customer.full_name,
            avatar_url: job.customer.avatar_url,
            phone_number: job.customer.phone_number,
          }
        : undefined,
      category: job.category || undefined,
    })
  );

  return jobsWithDetails;
};

// Mark job as in progress
const startJob = async (jobId: string, finalFee?: number) => {
  const updateData: any = {
    status: 'in_progress',
    started_at: new Date().toISOString(),
  };

  if (finalFee !== undefined) {
    updateData.final_cost = finalFee;
  }

  const { data, error } = await supabase
    .from('service_requests')
    .update(updateData)
    .eq('id', jobId)
    .eq('status', 'accepted') // Only start if accepted
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Job cannot be started');

  return data;
};

// Mark job as completed
const completeJob = async (jobId: string, finalCost?: number) => {
  const updateData: any = {
    status: 'completed',
    completed_at: new Date().toISOString(),
  };

  if (finalCost !== undefined) {
    updateData.final_cost = finalCost;
  }

  const { data, error } = await supabase
    .from('service_requests')
    .update(updateData)
    .eq('id', jobId)
    .eq('status', 'in_progress') // Only complete if in progress
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Job cannot be completed');

  return data;
};

export const useHandymanJobs = (status?: JobStatus) => {
  const queryClient = useQueryClient();
  const { handymanProfile } = useHandymanProfile();

  const {
    data: jobs,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['handyman-jobs', handymanProfile?.id, status],
    queryFn: () => {
      if (!handymanProfile?.id) {
        throw new Error('Handyman profile not found');
      }
      return fetchHandymanJobs(handymanProfile.id, status);
    },
    enabled: !!handymanProfile?.id,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Auto-refetch every minute
  });

  // Start job mutation
  const startJobMutation = useMutation({
    mutationFn: ({ jobId, finalFee }: { jobId: string; finalFee?: number }) =>
      startJob(jobId, finalFee),
    onSuccess: () => {
      // Invalidate queries to refresh the lists
      queryClient.invalidateQueries({ queryKey: ['handyman-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['service-request'] });
    },
  });

  // Complete job mutation
  const completeJobMutation = useMutation({
    mutationFn: ({ jobId, finalCost }: { jobId: string; finalCost?: number }) =>
      completeJob(jobId, finalCost),
    onSuccess: () => {
      // Invalidate queries to refresh the lists
      queryClient.invalidateQueries({ queryKey: ['handyman-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['service-request'] });
    },
  });

  return {
    jobs: jobs ?? [],
    loading,
    error: queryError?.message ?? null,
    refetch,
    startJob: (jobId: string, finalFee?: number) =>
      startJobMutation.mutate({ jobId, finalFee }),
    startJobAsync: (jobId: string, finalFee?: number) =>
      startJobMutation.mutateAsync({ jobId, finalFee }),
    isStarting: startJobMutation.isPending,
    startError: startJobMutation.error?.message,
    completeJob: (jobId: string, finalCost?: number) =>
      completeJobMutation.mutate({ jobId, finalCost }),
    completeJobAsync: (jobId: string, finalCost?: number) =>
      completeJobMutation.mutateAsync({ jobId, finalCost }),
    isCompleting: completeJobMutation.isPending,
    completeError: completeJobMutation.error?.message,
  };
};

// Hook to get job counts for all statuses
export const useHandymanJobCounts = () => {
  const { handymanProfile } = useHandymanProfile();

  const { data: acceptedJobs } = useQuery({
    queryKey: ['handyman-jobs', handymanProfile?.id, 'accepted'],
    queryFn: () => {
      if (!handymanProfile?.id) return [];
      return fetchHandymanJobs(handymanProfile.id, 'accepted');
    },
    enabled: !!handymanProfile?.id,
    staleTime: 1000 * 30,
  });

  const { data: activeJobs } = useQuery({
    queryKey: ['handyman-jobs', handymanProfile?.id, 'in_progress'],
    queryFn: () => {
      if (!handymanProfile?.id) return [];
      return fetchHandymanJobs(handymanProfile.id, 'in_progress');
    },
    enabled: !!handymanProfile?.id,
    staleTime: 1000 * 30,
  });

  const { data: completedJobs } = useQuery({
    queryKey: ['handyman-jobs', handymanProfile?.id, 'completed'],
    queryFn: () => {
      if (!handymanProfile?.id) return [];
      return fetchHandymanJobs(handymanProfile.id, 'completed');
    },
    enabled: !!handymanProfile?.id,
    staleTime: 1000 * 30,
  });

  return {
    acceptedCount: acceptedJobs?.length ?? 0,
    activeCount: activeJobs?.length ?? 0,
    completedCount: completedJobs?.length ?? 0,
  };
};
