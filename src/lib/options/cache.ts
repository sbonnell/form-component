/**
 * Options cache using TanStack Query
 * 
 * Caches remote option data with 10-minute TTL to reduce API calls.
 * Supports search, pagination, and dependent field filtering.
 * 
 * Phase 2: Basic cache setup
 * Phase 5 (US3): Enhanced with infinite queries for pagination
 */

import { QueryClient, useQuery, useInfiniteQuery, UseQueryResult } from '@tanstack/react-query';
import type { OnOptionsCallback, OnOptionsResponse, CallbackContext } from '@/types/callbacks';
import type { Option, OptionsCallbackResponse } from './types';

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
  dependsOn: Record<string, unknown>;
  
  /** Pagination token */
  pageToken?: string;
}

/**
 * Build unique cache key for options query
 * Excludes pageToken for infinite queries (handled by react-query)
 */
function buildCacheKey(params: Omit<OptionsQueryParams, 'pageToken'>): string[] {
  return [
    'options',
    params.name,
    params.query,
    JSON.stringify(params.dependsOn),
  ];
}

/**
 * Hook to fetch remote options (single page)
 * Use this for simple selects without pagination
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
 * Hook to fetch remote options with pagination support
 * Use this for selects with infinite scroll
 */
export function useInfiniteOptions(
  params: Omit<OptionsQueryParams, 'pageToken'>,
  onOptions: OnOptionsCallback,
  context: CallbackContext,
  enabled = true
) {
  return useInfiniteQuery({
    queryKey: buildCacheKey(params),
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      onOptions({
        name: params.name,
        query: params.query,
        dependsOn: params.dependsOn,
        pageToken: pageParam,
        context,
      }),
    getNextPageParam: (lastPage: OptionsCallbackResponse) => lastPage.nextPageToken ?? undefined,
    initialPageParam: undefined as string | undefined,
    enabled,
  });
}

/**
 * Flatten paginated options from infinite query into single array
 */
export function flattenInfiniteOptions(
  data: { pages: OptionsCallbackResponse[] } | undefined
): Option[] {
  if (!data) return [];
  return data.pages.flatMap((page: OptionsCallbackResponse) => page.options);
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
