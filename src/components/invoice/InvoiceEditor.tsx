'use client';

import { useApp } from '@/contexts/AppContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { LineItemsSection } from './LineItemsSection';
import { TotalsSection } from './TotalsSection';
import { NotesSection } from './NotesSection';
import { ClientDialog } from '@/components/dialogs/ClientDialog';
import { Currency } from '@/types';
import { COUNTRIES, getDialCode } from '@/lib/countries';
import { formatCurrency } from '@/lib/formatters';
import { Users, FileText, Receipt, StickyNote, ChevronDown, ChevronUp, CheckCircle, Loader2, History } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const CURRENCIES: { value: Currency; label: string }[] = [
  { value: 'NGN', label: 'NGN — Nigerian Naira (₦)' },
  { value: 'USD', label: 'USD — US Dollar ($)' },
  { value: 'GBP', label: 'GBP — British Pound (£)' },
  { value: 'EUR', label: 'EUR — Euro (€)' },
];

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, icon, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-2 text-sm font-semibold">
          {icon}
          {title}
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
          : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}

export function InvoiceEditor() {
  const { invoice, updateField, updateClientInfo, finalizeInvoice } = useApp();
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null); // tracks if already saved this session
  const router = useRouter();

  const handleFinalize = async () => {
    if (invoice.items.length === 0) {
      toast.error('Add at least one line item before saving.');
      return;
    }
    if (!invoice.client.name) {
      toast.error('Please add a client name before saving.');
      return;
    }
    setFinalizing(true);
    try {
      const id = await finalizeInvoice();
      setSavedId(id);
      toast.success(`${invoice.invoiceNumber} saved to history!`, {
        action: {
          label: 'View History',
          onClick: () => router.push('/invoices'),
        },
      });
    } catch {
      toast.error('Failed to save. Please try again.');
    } finally {
      setFinalizing(false);
    }
  };

  const handleCountryChange = (countryCode: string) => {
    const country = COUNTRIES.find((c) => c.code === countryCode);
    if (!country) return;
    const dialCode = country.dialCode;
    // Preserve any local number already typed; strip previous dial code if present
    const localNumber = invoice.client.phone.replace(/^\+\d[\d\s\-()]*\s*/, '').trim();
    updateClientInfo({
      country: country.name,
      countryCode: country.code,
      phone: localNumber ? `${dialCode} ${localNumber}` : dialCode,
    });
  };

  const dialCode = getDialCode(invoice.client.countryCode);
  // Strip the leading dial code from the full phone for the local-number input
  const localPhone = dialCode
    ? invoice.client.phone.replace(dialCode, '').trim()
    : invoice.client.phone;

  return (
    <div className="space-y-3 p-4">
      {/* Invoice Details */}
      <Section title="Invoice Details" icon={<FileText className="w-4 h-4 text-primary" />}>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Invoice Number</Label>
            <Input
              value={invoice.invoiceNumber}
              onChange={(e) => updateField('invoiceNumber', e.target.value)}
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Currency</Label>
            <Select value={invoice.currency} onValueChange={(v) => updateField('currency', v as Currency)}>
              <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Invoice Date</Label>
            <Input type="date" value={invoice.invoiceDate} onChange={(e) => updateField('invoiceDate', e.target.value)} className="text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label>Due Date</Label>
            <Input type="date" value={invoice.dueDate} onChange={(e) => updateField('dueDate', e.target.value)} className="text-sm" />
          </div>
        </div>
      </Section>

      {/* Client Information */}
      <Section title="Client Information" icon={<Users className="w-4 h-4 text-primary" />}>
        <div className="space-y-3">
          <div className="flex gap-2 items-end">
            <div className="space-y-1.5 flex-1">
              <Label>Client Name *</Label>
              <Input
                value={invoice.client.name}
                onChange={(e) => updateClientInfo({ name: e.target.value })}
                placeholder="John Doe"
                className="text-sm"
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => setClientDialogOpen(true)} className="shrink-0 gap-1.5">
              <Users className="w-3.5 h-3.5" /> Saved
            </Button>
            {/* Clear all client fields */}
            {invoice.client.name && (
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 text-muted-foreground hover:text-destructive text-xs h-9"
                onClick={() => updateClientInfo({ name: '', company: '', email: '', phone: '', address: '', country: '', countryCode: '' })}
                title="Clear client"
              >
                Clear
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Company</Label>
              <Input
                value={invoice.client.company}
                onChange={(e) => updateClientInfo({ company: e.target.value })}
                placeholder="Acme Corp"
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                value={invoice.client.email}
                onChange={(e) => updateClientInfo({ email: e.target.value })}
                placeholder="client@email.com"
                className="text-sm"
              />
            </div>

            {/* Country */}
            <div className="space-y-1.5">
              <Label>Country</Label>
              <Select value={invoice.client.countryCode} onValueChange={handleCountryChange}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select country..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.name} ({c.dialCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Phone with dial-code prefix */}
            <div className="space-y-1.5">
              <Label>Phone</Label>
              {dialCode ? (
                <div className="flex gap-1.5">
                  <div className="flex items-center px-2.5 h-9 bg-muted border border-input rounded-md text-sm text-muted-foreground whitespace-nowrap shrink-0">
                    {dialCode}
                  </div>
                  <Input
                    value={localPhone}
                    onChange={(e) =>
                      updateClientInfo({ phone: `${dialCode} ${e.target.value}` })
                    }
                    placeholder="800 123 4567"
                    className="text-sm"
                  />
                </div>
              ) : (
                <Input
                  value={invoice.client.phone}
                  onChange={(e) => updateClientInfo({ phone: e.target.value })}
                  placeholder="+234 800 123 4567"
                  className="text-sm"
                />
              )}
            </div>

            <div className="space-y-1.5 col-span-2">
              <Label>Address</Label>
              <Input
                value={invoice.client.address}
                onChange={(e) => updateClientInfo({ address: e.target.value })}
                placeholder="Street, City"
                className="text-sm"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Line Items */}
      <Section title="Line Items" icon={<Receipt className="w-4 h-4 text-primary" />}>
        <LineItemsSection />
      </Section>

      {/* Totals */}
      <Section title="Totals & Adjustments" icon={<Receipt className="w-4 h-4 text-primary" />}>
        <TotalsSection />
      </Section>

      {/* Notes */}
      <Section title="Notes & Terms" icon={<StickyNote className="w-4 h-4 text-primary" />}>
        <NotesSection />
      </Section>

      {/* ── Finalize button ─────────────────────────────── */}
      <div className="border rounded-xl overflow-hidden">
        {savedId ? (
          /* Already saved this session — show update option */
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
              <CheckCircle className="w-4 h-4" />
              Saved — {invoice.invoiceNumber}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5 text-xs"
                onClick={handleFinalize}
                disabled={finalizing}
              >
                {finalizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                Update in History
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5 text-xs"
                onClick={() => router.push('/invoices')}
              >
                <History className="w-3.5 h-3.5" />
                View History
              </Button>
            </div>
          </div>
        ) : (
          /* Not yet saved — show the main CTA */
          <button
            onClick={handleFinalize}
            disabled={finalizing}
            className="w-full flex items-center justify-between px-5 py-4 bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            <div className="flex items-center gap-2 font-semibold text-sm">
              {finalizing
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <CheckCircle className="w-4 h-4" />}
              {finalizing ? 'Saving…' : 'Save to Invoice History'}
            </div>
            <div className="font-bold text-base">
              {formatCurrency(invoice.total, invoice.currency)}
            </div>
          </button>
        )}
      </div>

      <div className="h-4" />

      <ClientDialog open={clientDialogOpen} onOpenChange={setClientDialogOpen} />
    </div>
  );
}
