'use client';

/**
 * Admin dashboard — /admin
 * Shows platform-wide stats: total users, invoices, revenue, new users this month.
 * Only accessible to users with is_admin = true (enforced in middleware + API).
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileText, TrendingUp, UserPlus, ArrowRight, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import type { Currency } from '@/types';

interface Stats {
  totalUsers: number;
  totalInvoices: number;
  totalRevenue: number;
  newUsersThisMonth: number;
  recentInvoices: { total: number; currency: string; created_at: string }[];
}

/** Fetch admin data — passes JWT so it works on Render without cookie issues */
async function adminFetch(path: string) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return fetch(path, {
    headers: { Authorization: `Bearer ${session?.access_token ?? ''}` },
  });
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminFetch('/api/admin/stats')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setStats(data);
      })
      .catch(() => setError('Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-20 justify-center">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading dashboard…
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center text-destructive">
        <p className="font-medium">{error}</p>
        <p className="text-sm text-muted-foreground mt-1">
          Make sure your account has admin access (run the SQL to set is_admin = true).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Platform overview — InvoiceFlow</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Users</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalUsers ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">New This Month</CardTitle>
            <UserPlus className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.newUsersThisMonth ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Invoices</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalInvoices ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Platform Revenue</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats?.totalRevenue
                ? formatCurrency(stats.totalRevenue, (stats.recentInvoices[0]?.currency ?? 'NGN') as Currency)
                : '—'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Sum of all invoices</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent invoice activity */}
      {stats && stats.recentInvoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Invoice Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.recentInvoices.map((inv, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm py-1.5 border-b last:border-0">
                  <span className="text-muted-foreground">
                    {new Date(inv.created_at).toLocaleDateString('en-GB', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </span>
                  <span className="font-semibold">
                    {formatCurrency(inv.total, inv.currency as Currency)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Link href="/admin/users">
          <Button variant="outline" className="gap-2">
            <Users className="w-4 h-4" /> Manage Users <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
