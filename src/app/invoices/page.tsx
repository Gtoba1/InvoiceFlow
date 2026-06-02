'use client';

/**
 * Invoice history page — /invoices
 * Shows all invoices the user has ever saved, with filters for:
 *   - Client name (text search)
 *   - Date range (from / to)
 *
 * Clicking "Load" restores that invoice into the editor at /app.
 * The page wraps itself in AppProvider so it has access to profile/context.
 */
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppProvider } from '@/contexts/AppContext';
import { useTheme } from 'next-themes';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { STORAGE_KEYS, storageSet } from '@/lib/storage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import {
  ArrowLeft, Search, Calendar, FileText,
  ExternalLink, Moon, Sun, Zap, Loader2,
} from 'lucide-react';
import type { Currency, InvoiceTemplate, InvoiceStatus } from '@/types';

// Shape returned by /api/invoices (snake_case from Supabase)
interface ApiInvoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  currency: string;
  client_snapshot: { name: string; company?: string } | null;
  status: string;
  template: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  notes: string;
  payment_instructions: string;
  terms: string;
  tax_rate: number;
  discount: { type: string; value: number } | null;
  invoice_items: {
    id: string;
    service_name: string;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
    sort_order: number;
  }[];
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'secondary',
  sent: 'default',
  paid: 'outline',
};

function InvoicesContent() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [invoices, setInvoices] = useState<ApiInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    fetch('/api/invoices')
      .then((r) => r.json())
      .then((data) => { setInvoices(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Filter invoices by client name and date range
  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const clientName = (inv.client_snapshot?.name ?? '').toLowerCase();
      const company = (inv.client_snapshot?.company ?? '').toLowerCase();
      const invNum = inv.invoice_number.toLowerCase();
      const q = search.toLowerCase();

      const matchesSearch = !q || clientName.includes(q) || company.includes(q) || invNum.includes(q);
      const matchesFrom = !fromDate || inv.invoice_date >= fromDate;
      const matchesTo = !toDate || inv.invoice_date <= toDate;

      return matchesSearch && matchesFrom && matchesTo;
    });
  }, [invoices, search, fromDate, toDate]);

  /** Load a saved invoice into the editor draft (via localStorage) then navigate to /app */
  const handleLoad = (inv: ApiInvoice) => {
    const draft = {
      id: inv.id,
      invoiceNumber: inv.invoice_number,
      invoiceDate: inv.invoice_date,
      dueDate: inv.due_date,
      currency: inv.currency as Currency,
      client: inv.client_snapshot ?? { name: '', company: '', email: '', phone: '', address: '', country: '', countryCode: '' },
      items: (inv.invoice_items ?? [])
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((item) => ({
          id: item.id,
          service: item.service_name,
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
        })),
      discount: inv.discount ?? undefined,
      taxRate: inv.tax_rate ?? 0,
      notes: inv.notes ?? '',
      paymentInstructions: inv.payment_instructions ?? '',
      terms: inv.terms ?? '',
      status: (inv.status ?? 'draft') as InvoiceStatus,
      template: (inv.template ?? 'minimal') as InvoiceTemplate,
      subtotal: inv.subtotal,
      discountAmount: inv.discount_amount,
      taxAmount: inv.tax_amount,
      total: inv.total,
      createdAt: inv.created_at,
      updatedAt: new Date().toISOString(),
    };

    storageSet(STORAGE_KEYS.CURRENT_INVOICE, draft);
    toast.success(`Loading ${inv.invoice_number}…`);
    router.push('/app');
  };

  const totalRevenue = filtered.reduce((s, inv) => s + inv.total, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header bar */}
      <div className="border-b bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/app" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">Invoice History</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Filters */}
        <div className="bg-muted/30 border rounded-xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 space-y-1">
              <Label className="text-xs text-muted-foreground">Search by client or invoice #</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Client name, company…"
                  className="pl-8 h-9 text-sm"
                />
              </div>
            </div>

            {/* Date from */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">From date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="pl-8 h-9 text-sm" />
              </div>
            </div>

            {/* Date to */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">To date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="pl-8 h-9 text-sm" />
              </div>
            </div>

            {(search || fromDate || toDate) && (
              <div className="flex items-end">
                <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setFromDate(''); setToDate(''); }}>
                  Clear
                </Button>
              </div>
            )}
          </div>

          {/* Summary */}
          {!loading && (
            <div className="flex gap-4 text-sm text-muted-foreground pt-1">
              <span><strong className="text-foreground">{filtered.length}</strong> invoice{filtered.length !== 1 ? 's' : ''}</span>
              {filtered.length > 0 && (
                <span>Total value: <strong className="text-foreground">
                  {formatCurrency(totalRevenue, (filtered[0]?.currency as Currency) ?? 'NGN')}
                </strong></span>
              )}
            </div>
          )}
        </div>

        {/* Invoice list */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading invoices…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No invoices found</p>
            <p className="text-sm mt-1">
              {invoices.length === 0
                ? 'You haven\'t saved any invoices yet.'
                : 'Try adjusting your filters.'}
            </p>
            {invoices.length === 0 && (
              <Link href="/app">
                <Button className="mt-4 gap-2"><ExternalLink className="w-4 h-4" /> Create your first invoice</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((inv) => (
              <div
                key={inv.id}
                className="border rounded-xl p-4 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  {/* Invoice info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-semibold text-sm">{inv.invoice_number}</span>
                      <Badge variant={STATUS_COLORS[inv.status] as 'default' | 'secondary' | 'outline' ?? 'secondary'} className="text-xs">
                        {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                      </Badge>
                      <span className="text-xs text-muted-foreground capitalize">{inv.template}</span>
                    </div>

                    {/* Client */}
                    {inv.client_snapshot?.name && (
                      <div className="text-sm text-foreground font-medium">
                        {inv.client_snapshot.name}
                        {inv.client_snapshot.company && (
                          <span className="text-muted-foreground font-normal"> · {inv.client_snapshot.company}</span>
                        )}
                      </div>
                    )}

                    {/* Dates */}
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>Issued {formatDate(inv.invoice_date)}</span>
                      <span>Due {formatDate(inv.due_date)}</span>
                    </div>
                  </div>

                  {/* Total + action */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <div className="font-bold text-base text-primary">
                        {formatCurrency(inv.total, inv.currency as Currency)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {inv.invoice_items?.length ?? 0} item{(inv.invoice_items?.length ?? 0) !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLoad(inv)}
                      className="gap-1.5 text-xs h-8"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Load
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AppProvider>
        <InvoicesContent />
        <Toaster position="bottom-right" richColors />
      </AppProvider>
    </ThemeProvider>
  );
}
