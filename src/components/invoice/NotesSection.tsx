'use client';

import { useApp } from '@/contexts/AppContext';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

// Parse structured payment fields out of a free-text string
function parsePayment(text: string) {
  const bank = text.match(/^Bank:\s*(.+)/m)?.[1]?.trim() ?? '';
  const accountName = text.match(/^Account Name:\s*(.+)/m)?.[1]?.trim() ?? '';
  const accountNumber = text.match(/^Account Number:\s*(.+)/m)?.[1]?.trim() ?? '';
  // Everything that isn't one of the three structured lines is "extra"
  const extra = text
    .split('\n')
    .filter((l) => !/^(Bank|Account Name|Account Number):/.test(l))
    .join('\n')
    .trim();
  return { bank, accountName, accountNumber, extra };
}

function buildPayment(bank: string, accountName: string, accountNumber: string, extra: string) {
  const lines: string[] = [];
  if (bank) lines.push(`Bank: ${bank}`);
  if (accountName) lines.push(`Account Name: ${accountName}`);
  if (accountNumber) lines.push(`Account Number: ${accountNumber}`);
  if (extra) lines.push(extra);
  return lines.join('\n');
}

export function NotesSection() {
  const { invoice, updateField } = useApp();

  const { bank, accountName, accountNumber, extra } = parsePayment(invoice.paymentInstructions);

  const handlePaymentField = (
    field: 'bank' | 'accountName' | 'accountNumber' | 'extra',
    value: string,
  ) => {
    const next = {
      bank: field === 'bank' ? value : bank,
      accountName: field === 'accountName' ? value : accountName,
      accountNumber: field === 'accountNumber' ? value : accountNumber,
      extra: field === 'extra' ? value : extra,
    };
    updateField('paymentInstructions', buildPayment(next.bank, next.accountName, next.accountNumber, next.extra));
  };

  return (
    <div className="space-y-5">
      {/* Payment Instructions — structured fields */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Payment Instructions</Label>
        <div className="rounded-lg border bg-muted/20 p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Bank</Label>
              <Input
                value={bank}
                onChange={(e) => handlePaymentField('bank', e.target.value)}
                placeholder="e.g. First Bank"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Account Name</Label>
              <Input
                value={accountName}
                onChange={(e) => handlePaymentField('accountName', e.target.value)}
                placeholder="e.g. John Doe"
                className="h-8 text-sm"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Account Number</Label>
            <Input
              value={accountNumber}
              onChange={(e) => handlePaymentField('accountNumber', e.target.value)}
              placeholder="e.g. 0123456789"
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Additional info (sort code, IBAN, etc.)</Label>
            <Textarea
              value={extra}
              onChange={(e) => handlePaymentField('extra', e.target.value)}
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

      {/* Terms — auto-populated from selected services, always editable */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">Terms &amp; Conditions</Label>
          <span className="text-[10px] text-muted-foreground">
            Auto-fills from selected services
          </span>
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
