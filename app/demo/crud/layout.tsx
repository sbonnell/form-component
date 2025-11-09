import { CrudProviders } from './providers';

/**
 * Layout for CRUD demo pages
 * Provides QueryClient for React Query support in forms
 */
export default function CrudLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CrudProviders>{children}</CrudProviders>;
}
