'use client';

/**
 * Admin user management page (/admin/users).
 * Lists all registered users with their profile info, invoice count,
 * and an admin toggle.
 */
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Search, Shield } from 'lucide-react';

interface AdminUser {
  id: string;
  full_name: string | null;
  business_name: string | null;
  email: string | null;
  is_admin: boolean;
  invoice_count: number;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then((data) => { setUsers(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  /** Toggle admin status for a specific user */
  const toggleAdmin = async (userId: string, current: boolean) => {
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, is_admin: !current }),
    });

    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) => u.id === userId ? { ...u, is_admin: !current } : u),
      );
      toast.success(`Admin ${!current ? 'granted' : 'revoked'}`);
    } else {
      toast.error('Failed to update admin status');
    }
  };

  // Filter users by name or email search
  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      (u.full_name ?? '').toLowerCase().includes(q) ||
      (u.email ?? '').toLowerCase().includes(q) ||
      (u.business_name ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground text-sm">{users.length} registered accounts</p>
        </div>
        {/* Search bar */}
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
            <div className="text-muted-foreground text-sm py-8 text-center">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="text-muted-foreground text-sm py-8 text-center">No users found.</div>
          ) : (
            <div className="space-y-2">
              {filtered.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30 flex-wrap sm:flex-nowrap"
                >
                  {/* Avatar placeholder */}
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

                  {/* Stats */}
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {user.invoice_count} invoice{user.invoice_count !== 1 ? 's' : ''}
                  </div>

                  {/* Joined date */}
                  <div className="text-xs text-muted-foreground whitespace-nowrap hidden sm:block">
                    Joined {new Date(user.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>

                  {/* Admin toggle */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-muted-foreground">Admin</span>
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

      {/* How to make yourself admin — shown until there's at least one admin */}
      {users.every((u) => !u.is_admin) && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="pt-4">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>No admins yet.</strong> Use the toggle above to grant admin access to your own account.
              Your account is the one matching your login email.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
