/**
 * Supabase admin client — uses the service role key.
 * ONLY use server-side (API routes). Never import in browser components.
 * The service role key bypasses RLS so it can read all users' data.
 */
import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

/**
 * Verify a JWT access token and return the user.
 * Used in API routes to authenticate requests that pass the token in the
 * Authorization header (more reliable than cookie-based auth on Render).
 */
export async function verifyToken(token: string) {
  const admin = createAdminClient();
  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error || !user) return null;
  return user;
}
