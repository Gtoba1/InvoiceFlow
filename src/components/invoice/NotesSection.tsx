'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

// Build the paymentInstructions string from individual fields
function buildPayment(bank: string, accountName: string, accountNumber: string, extra: string) {
  const lines: string[] = [];
  if (bank)          lines.push(`Bank: ${bank}`);
  if (accountName)   lines.push(`Account Name: ${accountName}`);
  if (accountNumber) lines.push(`Account Number: ${accountNumber}`);
  if (extra)         lines.push(extra);
  return lines.join('\n');
}

// Parse a paymentInstructions string back into individual fields (used only on mount)
function parsePayment(text: string) {
  // Use replace instead of trim so internal spaces are never stripped
  const bank          = text.match(/^Bank:\s*(.*)/m)?.[1]?.replace(/\s+$/, '') ?? '';
  const accountName   = text.match(/^Account Name:\s*(.*)/m)?.[1]?.replace(/\s+$/, '') ?? '';
  const accountNumber = text.match(/^Account Number:\s*(.*)/m)?.[1]?.replace(/\s+$/, '') ?? '';
  const extra = text
    .split('\n')
    .filter((l) => !/^(Bank|Account Name|Account Number):/.test(l))
    .join('\n')
    .replace(/^\s+|\s+$/g, '');
  return { bank, accountName, accountNumber, extra };
}

export function NotesSection() {
  const { invoice, updateField } = useApp();

  // Local state for payment fields — avoids the controlled-input re-parse bug
  // where .trim() strips trailing spaces and prevents typing multi-word names.
  const parsed = parsePayment(invoice.paymentInstructions);
  const [bank,          setBank]          = useState(parsed.bank);
  const [accountName,   setAccountName]   = useState(parsed.accountName);
  const [accountNumber, setAccountNumber] = useState(parsed.accountNumber);
  const [extra,         setExtra]         = useState(parsed.extra);

  // Re-sync local state if the invoice is loaded from history (e.g. clicking Load)
  useEffect(() => {
    const p = parsePayment(invoice.paymentInstructions);
    setBank(p.bank);
    setAccountName(p.accountName);
    setAccountNumber(p.accountNumber);
    setExtra(p.extra);
  // Only re-sync when the invoice itself changes (not on every keystroke)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoice.id]);

  const sync = (b: string, an: string, anum: string, ex: string) =>
    updateField('paymentInstructions', buildPayment(b, an, anum, ex));

  return (
    <div className="space-y-5">
      {/* Payment Instructions */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Payment Instructions</Label>
        <div className="rounded-lg border bg-muted/20 p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Bank</Label>
              <Input
                value={bank}
                onChange={(e) => { setBank(e.target.value); sync(e.target.value, accountName, accountNumber, extra); }}
                placeholder="e.g. First Bank"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Account Name</Label>
              <Input
                value={accountName}
                onChange={(e) => { setAccountName(e.target.value); sync(bank, e.target.value, accountNumber, extra); }}
                placeholder="e.g. Gabriel Oloruntoba"
                className="h-8 text-sm"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Account Number</Label>
            <Input
              value={accountNumber}
              onChange={(e) => { setAccountNumber(e.target.value); sync(bank, accountName, e.target.value, extra); }}
              placeholder="e.g. 0123456789"
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Additional info (sort code, IBAN, etc.)</Label>
            <Textarea
              value={extra}
              onChange={(e) => { setExtra(e.target.value); sync(bank, accountName, accountNumber, e.target.value); }}
              placeholder="Any other payment details..."
              className="min-h-[48px] text-sm resize-none"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Notes */}
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">Notes</Label>
        <Textarea
          value={invoice.notes}
          onChange={(e) => updateField('notes', e.target.value)}
          placeholder="Thank you for your business!"
          className="min-h-[60px] text-sm resize-none"
        />
      </div>

      {/* Terms */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">Terms &amp; Conditions</Label>
          <span className="text-[10px] text-muted-foreground">Auto-fills from selected services</span>
        </div>
        <Textarea
          value={invoice.terms}
          onChange={(e) => updateField('terms', e.target.value)}
          placeholder="Select a service above to auto-populate terms, or type your own..."
          className="min-h-[100px] text-sm resize-none"
        />
      </div>
    </div>
  );
}
