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
import { Users, FileText, Receipt, StickyNote, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

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
  const { invoice, updateField, updateClientInfo } = useApp();
  const [clientDialogOpen, setClientDialogOpen] = useState(false);

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

      <div className="h-4" />

      <ClientDialog open={clientDialogOpen} onOpenChange={setClientDialogOpen} />
    </div>
  );
}
