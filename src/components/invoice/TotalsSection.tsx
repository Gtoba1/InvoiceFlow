'use client';

import { useApp } from '@/contexts/AppContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, getCurrencySymbol } from '@/lib/formatters';
import { useState } from 'react';

export function TotalsSection() {
  const { invoice, updateDiscount, updateField } = useApp();
  const [discountEnabled, setDiscountEnabled] = useState(!!invoice.discount && invoice.discount.value > 0);
  const [taxEnabled, setTaxEnabled] = useState(invoice.taxRate > 0);
  const sym = getCurrencySymbol(invoice.currency);

  const handleDiscountToggle = (enabled: boolean) => {
    setDiscountEnabled(enabled);
    if (!enabled) {
      updateDiscount(undefined);
    } else {
      updateDiscount({ type: 'percentage', value: 0 });
    }
  };

  const handleTaxToggle = (enabled: boolean) => {
    setTaxEnabled(enabled);
    if (!enabled) {
      updateField('taxRate', 0);
    } else {
      updateField('taxRate', 7.5);
    }
  };

  return (
    <div className="space-y-4">
      {/* Discount */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Discount</Label>
          <Switch checked={discountEnabled} onCheckedChange={handleDiscountToggle} />
        </div>
        {discountEnabled && (
          <div className="flex gap-2">
            <Select
              value={invoice.discount?.type || 'percentage'}
              onValueChange={(v: 'fixed' | 'percentage') =>
                updateDiscount({ type: v, value: invoice.discount?.value || 0 })
              }
            >
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage (%)</SelectItem>
                <SelectItem value="fixed">Fixed ({sym})</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              min="0"
              max={invoice.discount?.type === 'percentage' ? 100 : undefined}
              value={invoice.discount?.value || 0}
              onChange={(e) =>
                updateDiscount({
                  type: invoice.discount?.type || 'percentage',
                  value: parseFloat(e.target.value) || 0,
                })
              }
              className="h-8 text-sm flex-1"
              placeholder={invoice.discount?.type === 'percentage' ? 'e.g. 10' : 'e.g. 5000'}
            />
          </div>
        )}
      </div>

      {/* Tax */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Tax / VAT</Label>
          <Switch checked={taxEnabled} onCheckedChange={handleTaxToggle} />
        </div>
        {taxEnabled && (
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              min="0"
              max="100"
              value={invoice.taxRate}
              onChange={(e) => updateField('taxRate', parseFloat(e.target.value) || 0)}
              className="h-8 text-sm w-24"
              placeholder="7.5"
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        )}
      </div>

      <Separator />

      {/* Summary */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="font-medium text-foreground">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
        </div>
        {invoice.discount && invoice.discount.value > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>
              Discount ({invoice.discount.type === 'percentage' ? `${invoice.discount.value}%` : 'fixed'})
            </span>
            <span className="font-medium text-red-500">−{formatCurrency(invoice.discountAmount, invoice.currency)}</span>
          </div>
        )}
        {invoice.taxRate > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>Tax ({invoice.taxRate}%)</span>
            <span className="font-medium text-foreground">{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
          </div>
        )}
        <Separator />
        <div className="flex justify-between font-bold text-base">
          <span>Grand Total</span>
          <span className="text-primary">{formatCurrency(invoice.total, invoice.currency)}</span>
        </div>
      </div>
    </div>
  );
}
