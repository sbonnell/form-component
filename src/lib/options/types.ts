/**
 * Types for dynamic options (remote data sources)
 * User Story 3: Dynamic Options with Search and Dependencies
 */

import { CallbackContext } from '@/types/callbacks';

/**
 * Single option in a select/multi-select dropdown
 */
export interface Option {
  /** Unique value for this option (submitted with form) */
  value: string | number | boolean;
  /** Display label shown to user */
  label: string;
  /** Whether this option is disabled (cannot be selected) */
  disabled?: boolean;
}

/**
 * Parameters passed to onOptions callback
 */
export interface OptionsCallbackParams {
  /** Name of the data source (from schema.dataSources.options) */
  name: string;
  /** Search query string entered by user */
  query: string;
  /** Values of fields this select depends on (from ui.dependsOn) */
  dependsOn: Record<string, unknown>;
  /** Pagination token from previous response (for infinite scroll) */
  pageToken?: string;
  /** Callback context (userId, locale, correlationId, etc.) */
  context: CallbackContext;
}

/**
 * Response from onOptions callback
 */
export interface OptionsCallbackResponse {
  /** Array of options to display */
  options: Option[];
  /** Token for next page (if more results available) */
  nextPageToken?: string;
}

/**
 * onOptions callback function signature
 */
export type OnOptionsCallback = (
  params: OptionsCallbackParams
) => Promise<OptionsCallbackResponse>;

/**
 * Cache key structure for TanStack Query
 */
export interface OptionsCacheKey {
  /** Always 'options' to namespace queries */
  scope: 'options';
  /** Data source name */
  sourceName: string;
  /** Search query */
  query: string;
  /** Stringified dependsOn object */
  dependencies: string;
}

/**
 * Configuration for an options data source in schema
 */
export interface OptionsDataSource {
  /** Data source name (referenced by field ui.optionsSource) */
  name: string;
  /** Type identifier (always 'options' for this data source type) */
  type: 'options';
}

/**
 * Options fetcher state
 */
export interface OptionsFetchState {
  /** Whether initial options are loading */
  isLoading: boolean;
  /** Whether next page is loading (pagination) */
  isFetchingNextPage: boolean;
  /** Whether there are more pages available */
  hasNextPage: boolean;
  /** Error from failed fetch */
  error: Error | null;
  /** All loaded options (across pages) */
  options: Option[];
  /** Function to load next page */
  fetchNextPage: () => void;
  /** Function to retry failed request */
  refetch: () => void;
}
