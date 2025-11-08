/**
 * Options cache using TanStack Query
 * 
 * Caches remote option data with 10-minute TTL to reduce API calls.
 * Supports search, pagination, and dependent field filtering.
 */

import { QueryClient, useQuery, UseQueryResult } from '@tanstack/react-query';
import type { OnOptionsCallback, OnOptionsResponse, CallbackContext } from '@/types/callbacks';

/**
 * Global query client instance
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 15 * 60 * 1000, // 15 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Options query parameters
 */
export interface OptionsQueryParams {
  /** Option source name */
  name: string;
  
  /** Search query */
  query: string;
  
  /** Dependent field values */
  dependsOn: Record<string, any>;
  
  /** Pagination token */
  pageToken?: string;
}

/**
 * Build unique cache key for options query
 */
function buildCacheKey(params: OptionsQueryParams): string[] {
  return [
    'options',
    params.name,
    params.query,
    JSON.stringify(params.dependsOn),
    params.pageToken || 'initial',
  ];
}

/**
 * Hook to fetch remote options
 */
export function useOptions(
  params: OptionsQueryParams,
  onOptions: OnOptionsCallback,
  context: CallbackContext,
  enabled = true
): UseQueryResult<OnOptionsResponse, Error> {
  return useQuery({
    queryKey: buildCacheKey(params),
    queryFn: () =>
      onOptions({
        name: params.name,
        query: params.query,
        dependsOn: params.dependsOn,
        pageToken: params.pageToken,
        context,
      }),
    enabled,
  });
}

/**
 * Invalidate options cache for a specific source
 */
export function invalidateOptions(name: string): void {
  queryClient.invalidateQueries({
    queryKey: ['options', name],
  });
}

/**
 * Clear all options cache
 */
export function clearOptionsCache(): void {
  queryClient.invalidateQueries({
    queryKey: ['options'],
  });
}
