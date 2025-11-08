/**
 * Remote options fetcher
 * User Story 3: Dynamic Options with Search and Dependencies
 * 
 * Provides React hooks for fetching options from remote data sources
 * with search, pagination, and error handling.
 */

'use client';

import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useInfiniteOptions, flattenInfiniteOptions } from './cache';
import type { OnOptionsCallback } from '@/types/callbacks';
import type { CallbackContext } from '@/types/callbacks';
import type { Option } from './types';

export interface UseDynamicOptionsParams {
  /** Data source name (from schema.dataSources.options) */
  sourceName: string;
  
  /** Search query string */
  searchQuery: string;
  
  /** Field keys this select depends on (from ui.dependsOn) */
  dependsOn?: string[];
  
  /** Callback context for telemetry */
  context: CallbackContext;
  
  /** onOptions callback function */
  onOptions?: OnOptionsCallback;
  
  /** Whether to fetch options (disabled if no callback provided) */
  enabled?: boolean;
}

export interface UseDynamicOptionsResult {
  /** Flattened array of all options across pages */
  options: Option[];
  
  /** Whether initial load is in progress */
  isLoading: boolean;
  
  /** Whether next page is loading */
  isFetchingNextPage: boolean;
  
  /** Whether more pages are available */
  hasNextPage: boolean;
  
  /** Error from failed fetch */
  error: Error | null;
  
  /** Function to load next page */
  fetchNextPage: () => void;
  
  /** Function to retry failed request */
  refetch: () => void;
}

/**
 * Hook to fetch dynamic options with search, pagination, and dependencies
 * 
 * @example
 * ```tsx
 * const { options, isLoading, hasNextPage, fetchNextPage } = useDynamicOptions({
 *   sourceName: 'countries',
 *   searchQuery: userInput,
 *   dependsOn: ['region'],
 *   context: callbackContext,
 *   onOptions: props.onOptions,
 * });
 * ```
 */
export function useDynamicOptions({
  sourceName,
  searchQuery,
  dependsOn = [],
  context,
  onOptions,
  enabled = true,
}: UseDynamicOptionsParams): UseDynamicOptionsResult {
  const { watch } = useFormContext();
  
  // Watch all dependent fields to trigger re-renders when they change
  // This creates subscriptions to each dependent field
  const dependentFieldsData = watch(dependsOn);
  
  // Serialize dependent data for stable comparison
  const serializedDeps = JSON.stringify(dependentFieldsData);
  
  // Build dependent values object from watched data
  const dependentValues = useMemo(() => {
    const values: Record<string, unknown> = {};
    dependsOn.forEach((fieldKey, index) => {
      values[fieldKey] = Array.isArray(dependentFieldsData) 
        ? dependentFieldsData[index] 
        : dependentFieldsData;
    });
    return values;
  }, [dependsOn, dependentFieldsData, serializedDeps]);
  
  // Fetch options with infinite query (pagination support)
  const query = useInfiniteOptions(
    {
      name: sourceName,
      query: searchQuery,
      dependsOn: dependentValues,
    },
    onOptions!,
    context,
    enabled && !!onOptions
  );
  
  // Flatten paginated results into single array
  const options = useMemo(
    () => {
      if (!query.data?.pages) return [];
      return flattenInfiniteOptions(query.data);
    },
    [query.data]
  );
  
  return {
    options,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage ?? false,
    error: query.error,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
  };
}
