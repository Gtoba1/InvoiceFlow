/**
 * GET  /api/admin/users — list all users with profile + invoice count.
 * PATCH /api/admin/users — toggle is_admin for a user.
 * Auth: JWT from Authorization header.
 */
import { NextResponse } from 'next/server';
import { createAdminClient, verifyToken } from '@/lib/supabase/admin';

async function getAdminUser(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;

  const user = await verifyToken(token);
  if (!user) return null;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  return profile?.is_admin ? user : null;
}

export async function GET(request: Request) {
  const caller = await getAdminUser(request);
  if (!caller) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const admin = createAdminClient();

  const { data: profiles } = await admin
    .from('profiles')
    .select('id, full_name, business_name, email, is_admin, created_at')
    .order('created_at', { ascending: false });

  const { data: invoiceCounts } = await admin.from('invoices').select('user_id');

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

export async function PATCH(request: Request) {
  const caller = await getAdminUser(request);
  if (!caller) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { userId, is_admin } = await request.json();
  const admin = createAdminClient();

  const { error } = await admin.from('profiles').update({ is_admin }).eq('id', userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
