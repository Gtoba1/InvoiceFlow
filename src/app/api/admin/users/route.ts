/**
 * API route: /api/admin/users  (admin only)
 * GET — list all users with their profile and invoice count.
 * Uses the service-role key to bypass RLS and access all profiles.
 */
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient as createAdmin } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  // First verify the caller is an authenticated admin
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Use the service-role client to bypass RLS and read all profiles
  const adminClient = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Get all profiles
  const { data: profiles, error } = await adminClient
    .from('profiles')
    .select('id, full_name, business_name, email, is_admin, created_at')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get invoice counts per user
  const { data: invoiceCounts } = await adminClient
    .from('invoices')
    .select('user_id');

  // Attach invoice count to each profile
  const countMap = (invoiceCounts ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.user_id] = (acc[row.user_id] ?? 0) + 1;
    return acc;
  }, {});

  const users = (profiles ?? []).map((p) => ({
    ...p,
    invoice_count: countMap[p.id] ?? 0,
  }));

  return NextResponse.json(users);
}

/** PATCH — toggle admin status for a user */
export async function PATCH(request: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { userId, is_admin } = await request.json();

  const adminClient = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { error } = await adminClient
    .from('profiles')
    .update({ is_admin })
    .eq('id', userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
