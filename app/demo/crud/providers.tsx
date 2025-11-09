'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/options/cache';

/**
 * Client-side providers for CRUD demo pages
 * Wraps pages with QueryClientProvider for React Query support
 */
export function CrudProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
