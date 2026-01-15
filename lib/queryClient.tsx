
import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { AppState, Platform } from 'react-native';
import { supabase } from './supabase';

// optionally detect when app returns to foreground
function setupAppStateListener(queryClient: QueryClient) {
  const subscription = AppState.addEventListener('change', async (state) => {
    if (state === 'active') {
      // Only invalidate queries if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        queryClient.invalidateQueries();
      }
    }
  });
  return () => {
    subscription.remove();
  };
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
     
      staleTime: 1000 * 60 * 5,        
      gcTime: 1000 * 60 * 30,      
      retry: 2,                        
      refetchOnWindowFocus: false,     
      refetchOnReconnect: true,         
      throwOnError: false,
    },
    mutations: {
      retry: 1,                        
    }
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      console.error('Global query error', { error, query });
    }
  }),
  mutationCache: new MutationCache({
    onError: (error, mutation) => {
      console.error('Global mutation error', { error, mutation });
    }
  })
});

// Optionally run the app state listener (for mobile)
if (Platform.OS !== 'web') {
  setupAppStateListener(queryClient);
}
