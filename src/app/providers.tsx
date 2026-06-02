'use client';

/**
 * Providers — wraps the app with the global AppContext (invoice state,
 * profile, clients, services). Kept separate from layout.tsx so it can be
 * a Client Component while layout.tsx stays a Server Component.
 */
import { AppProvider } from '@/contexts/AppContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return <AppProvider>{children}</AppProvider>;
}
