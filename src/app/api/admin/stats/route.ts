/**
 * GET /api/admin/stats — platform-wide statistics for the admin dashboard.
 * Auth: reads the JWT from the Authorization header (works reliably on Render).
 * Data: fetched via service-role client so RLS doesn't block cross-user reads.
 */
import { NextResponse } from 'next/server';
import { createAdminClient, verifyToken } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  // Authenticate via Authorization: Bearer <token>
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await verifyToken(token);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();

  // Confirm the caller has admin rights
  const { data: profile } = await admin
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Gather platform stats in parallel
  const [
    { count: totalUsers },
    { count: totalInvoices },
    { data: invoiceRows },
    { data: recentUsers },
  ] = await Promise.all([
    admin.from('profiles').select('*', { count: 'exact', head: true }),
    admin.from('invoices').select('*', { count: 'exact', head: true }),
    admin.from('invoices').select('total, currency, created_at').order('created_at', { ascending: false }),
    admin.from('profiles').select('created_at').order('created_at', { ascending: false }).limit(50),
  ]);

  // Total revenue across all currencies (raw sum)
  const totalRevenue = (invoiceRows ?? []).reduce((sum, inv) => sum + (inv.total ?? 0), 0);

  // New users this month
  const thisMonthStart = new Date();
  thisMonthStart.setDate(1);
  thisMonthStart.setHours(0, 0, 0, 0);
  const newUsersThisMonth = (recentUsers ?? []).filter(
    (u) => new Date(u.created_at) >= thisMonthStart,
  ).length;

  // Recent 10 invoices for the activity feed
  const recentInvoices = (invoiceRows ?? []).slice(0, 10);

  return NextResponse.json({
    totalUsers:        totalUsers   ?? 0,
    totalInvoices:     totalInvoices ?? 0,
    totalRevenue,
    newUsersThisMonth,
    recentInvoices,
  });
}
