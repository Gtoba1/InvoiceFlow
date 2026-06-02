'use client';

/**
 * Admin user management — /admin/users
 * Lists all registered users with profile info, invoice count, join date, admin toggle.
 * Fetches data via JWT-authenticated API route (works on Render).
 */
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { Search, Shield, Loader2 } from 'lucide-react';

interface AdminUser {
  id: string;
  full_name: string | null;
  business_name: string | null;
  email: string | null;
  is_admin: boolean;
  invoice_count: number;
  created_at: string;
}

async function adminFetch(path: string, options?: RequestInit) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token ?? ''}`,
      ...(options?.headers ?? {}),
    },
  });
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminFetch('/api/admin/users')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setUsers(data);
      })
      .catch(() => setError('Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  const toggleAdmin = async (userId: string, current: boolean) => {
    const res = await adminFetch('/api/admin/users', {
      method: 'PATCH',
      body: JSON.stringify({ userId, is_admin: !current }),
    });

    if (res.ok) {
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, is_admin: !current } : u));
      toast.success(`Admin ${!current ? 'granted' : 'revoked'}`);
    } else {
      toast.error('Failed to update admin status');
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      !q ||
      (u.full_name ?? '').toLowerCase().includes(q) ||
      (u.email ?? '').toLowerCase().includes(q) ||
      (u.business_name ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Users</h1>
            <p className="text-muted-foreground text-sm">{users.length} registered accounts</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="pl-9 h-9"
            />
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">All Users</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" /> Loading…
              </div>
            ) : error ? (
              <div className="py-12 text-center text-destructive text-sm">{error}</div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">No users found.</div>
            ) : (
              <div className="space-y-2">
                {filtered.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30 flex-wrap sm:flex-nowrap"
                  >
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                      {(user.full_name ?? user.email ?? '?')[0].toUpperCase()}
                    </div>

                    {/* User info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm truncate">
                          {user.full_name ?? 'No name set'}
                        </span>
                        {user.is_admin && (
                          <Badge variant="secondary" className="gap-1 text-xs">
                            <Shield className="w-3 h-3" /> Admin
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {user.email}
                        {user.business_name && ` · ${user.business_name}`}
                      </div>
                    </div>

                    {/* Invoice count */}
                    <div className="text-xs text-muted-foreground whitespace-nowrap text-right">
                      <div className="font-semibold text-foreground text-sm">{user.invoice_count}</div>
                      <div>invoices</div>
                    </div>

                    {/* Join date */}
                    <div className="text-xs text-muted-foreground whitespace-nowrap hidden sm:block text-right">
                      <div>Joined</div>
                      <div>{new Date(user.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                    </div>

                    {/* Admin toggle */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-muted-foreground hidden sm:block">Admin</span>
                      <Switch
                        checked={user.is_admin}
                        onCheckedChange={() => toggleAdmin(user.id, user.is_admin)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* First-time guide */}
        {!loading && !error && users.every((u) => !u.is_admin) && (
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
            <CardContent className="pt-4">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>No admins yet.</strong> Run this SQL in{' '}
                <strong>Supabase → SQL Editor</strong> to grant yourself admin access:
              </p>
              <pre className="mt-2 text-xs bg-amber-100 dark:bg-amber-900/40 rounded p-2 overflow-x-auto">
                {`UPDATE public.profiles SET is_admin = true WHERE email = 'your@email.com';`}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
      <Toaster />
    </>
  );
}
