import { supabase } from '@/lib/supabase';
import { ServiceRequestStatus, ServiceRequestWithDetails } from '@/types/service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useHandymanProfile } from './useHandymanProfile';

// Tab-based status groups for the jobs page
export type JobTabStatus = 'accepted' | 'active' | 'completed';

// Active tab includes all "in-transit" and "working" statuses
const ACTIVE_STATUSES: ServiceRequestStatus[] = ['on_the_way', 'arrived', 'in_progress'];

const fetchHandymanJobs = async (
  handymanId: string,
  userProfileId: string,
  tabStatus?: JobTabStatus
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
    .neq('customer_id', userProfileId) // Exclude jobs where handyman is also the customer
    .order('created_at', { ascending: false });

  // Filter by tab status if specified
  if (tabStatus === 'accepted') {
    query = query.eq('status', 'accepted');
  } else if (tabStatus === 'active') {
    query = query.in('status', ACTIVE_STATUSES);
  } else if (tabStatus === 'completed') {
    query = query.eq('status', 'completed');
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
 .in('status', ['accepted', 'arrived'])
    .select()
    .single();

  if (error) throw error;
  console.log('supabase error', error)
  if (!data) throw new Error('Job cannot be started');

  return data;
};

// Get platform fee percentage from settings
const getPlatformFeePercentage = async (): Promise<number> => {
  const { data } = await supabase
    .from('platform_settings')
    .select('value')
    .eq('key', 'platform_fee_percentage')
    .single();

  return data?.value?.value || 15; // Default 15%
};

// Create earning transaction
const createEarningTransaction = async (
  handymanId: string,
  serviceRequestId: string,
  amount: number,
  description: string
) => {
  const feePercentage = await getPlatformFeePercentage();
  const platformFee = amount * (feePercentage / 100);
  const netAmount = amount - platformFee;

  const { error } = await supabase.from('transactions').insert({
    handyman_id: handymanId,
    service_request_id: serviceRequestId,
    type: 'earning',
    amount: amount,
    platform_fee: platformFee,
    net_amount: netAmount,
    status: 'completed',
    description: description,
  });

  if (error) {
    console.error('Failed to create transaction:', error);
    // Don't throw - job is already completed, transaction failure shouldn't break flow
  }
};

// Create payment request via Edge Function
const createPaymentRequest = async (serviceRequestId: string, amount: number) => {
  const { data, error } = await supabase.functions.invoke('create-payment-request', {
    body: { serviceRequestId, amount },
  });

  if (error) {
    console.error('Failed to create payment request:', error);
    // Don't throw - job is completed, payment request can be retried
    return null;
  }

  return data;
};

// Mark job as completed and create payment request
const completeJob = async (jobId: string, finalCost?: number) => {
  const updateData: any = {
    status: 'completed',
    completed_at: new Date().toISOString(),
    payment_status: 'pending', // Set payment as pending
  };

  if (finalCost !== undefined) {
    updateData.final_cost = finalCost;
  }

  const { data, error } = await supabase
    .from('service_requests')
    .update(updateData)
    .eq('id', jobId)
    .eq('status', 'in_progress') // Only complete if in progress
    .select(`
      *,
      category:service_categories!category_id(name)
    `)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Job cannot be completed');

  // Create payment request instead of direct transaction
  // Transaction will be created by webhook when payment is confirmed
  const jobCost = finalCost ?? data.final_cost ?? data.estimated_cost;
  if (jobCost) {
    const paymentResult = await createPaymentRequest(jobId, jobCost);
    if (paymentResult?.success) {
      console.log('Payment request created:', paymentResult.paymentRequest?.paystack_reference);
    }
  }

  return data;
};

export const useHandymanJobs = (tabStatus?: JobTabStatus) => {
  const queryClient = useQueryClient();
  const { handymanProfile } = useHandymanProfile();

  const {
    data: jobs,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['handyman-jobs', handymanProfile?.id, tabStatus],
    queryFn: () => {
      if (!handymanProfile?.id || !handymanProfile?.profile_id) {
        throw new Error('Handyman profile not found');
      }
      return fetchHandymanJobs(handymanProfile.id, handymanProfile.profile_id, tabStatus);
    },
    enabled: !!handymanProfile?.id && !!handymanProfile?.profile_id,
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
      // Refresh earnings data since a transaction was created
      queryClient.invalidateQueries({ queryKey: ['earnings'] });
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

// Hook to get job counts for all tab statuses
export const useHandymanJobCounts = () => {
  const { handymanProfile } = useHandymanProfile();

  const { data: acceptedJobs } = useQuery({
    queryKey: ['handyman-jobs', handymanProfile?.id, 'accepted'],
    queryFn: () => {
      if (!handymanProfile?.id || !handymanProfile?.profile_id) return [];
      return fetchHandymanJobs(handymanProfile.id, handymanProfile.profile_id, 'accepted');
    },
    enabled: !!handymanProfile?.id && !!handymanProfile?.profile_id,
    staleTime: 1000 * 30,
  });

  const { data: activeJobs } = useQuery({
    queryKey: ['handyman-jobs', handymanProfile?.id, 'active'],
    queryFn: () => {
      if (!handymanProfile?.id || !handymanProfile?.profile_id) return [];
      return fetchHandymanJobs(handymanProfile.id, handymanProfile.profile_id, 'active');
    },
    enabled: !!handymanProfile?.id && !!handymanProfile?.profile_id,
    staleTime: 1000 * 30,
  });

  const { data: completedJobs } = useQuery({
    queryKey: ['handyman-jobs', handymanProfile?.id, 'completed'],
    queryFn: () => {
      if (!handymanProfile?.id || !handymanProfile?.profile_id) return [];
      return fetchHandymanJobs(handymanProfile.id, handymanProfile.profile_id, 'completed');
    },
    enabled: !!handymanProfile?.id && !!handymanProfile?.profile_id,
    staleTime: 1000 * 30,
  });

  return {
    acceptedCount: acceptedJobs?.length ?? 0,
    activeCount: activeJobs?.length ?? 0,
    completedCount: completedJobs?.length ?? 0,
  };
};
