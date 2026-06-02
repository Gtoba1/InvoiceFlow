/**
 * Browser-side Supabase client.
 * Use this in Client Components ('use client') for auth and data fetching.
 * Creates one shared instance per browser session.
 */
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
