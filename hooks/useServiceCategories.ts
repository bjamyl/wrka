import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ServiceCategory } from '@/types/service';

const fetchServiceCategories = async (): Promise<ServiceCategory[]> => {
  const { data, error } = await supabase
    .from('service_categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;

  return data as ServiceCategory[];
};

export const useServiceCategories = () => {
  const {
    data: categories,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['service-categories'],
    queryFn: fetchServiceCategories,
    staleTime: 1000 * 60 * 30, // 30 minutes - categories don't change often
  });

  return {
    categories: categories ?? [],
    loading,
    error: queryError?.message ?? null,
    refetch,
  };
};
