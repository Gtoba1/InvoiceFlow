/**
 * API route: /api/admin/stats  (admin only)
 * GET — returns platform-wide statistics for the admin dashboard.
 */
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient as createAdmin } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const adminClient = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Run all count queries in parallel for speed
  const [
    { count: totalUsers },
    { count: totalInvoices },
    { data: recentInvoices },
  ] = await Promise.all([
    adminClient.from('profiles').select('*', { count: 'exact', head: true }),
    adminClient.from('invoices').select('*', { count: 'exact', head: true }),
    adminClient
      .from('invoices')
      .select('total, currency, created_at')
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  return NextResponse.json({
    totalUsers: totalUsers ?? 0,
    totalInvoices: totalInvoices ?? 0,
    recentInvoices: recentInvoices ?? [],
  });
}
