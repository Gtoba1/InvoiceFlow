/**
 * Admin layout — wraps all /admin pages.
 * The middleware already blocks non-admins from reaching these routes,
 * but we also add a visual header to distinguish the admin area.
 */
import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Admin top bar */}
      <div className="border-b bg-slate-900 text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold">InvoiceFlow Admin</span>
        </div>
        <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors">
          ← Back to App
        </Link>
      </div>

      {/* Page content */}
      <div className="p-6 max-w-7xl mx-auto">{children}</div>
    </div>
  );
}
