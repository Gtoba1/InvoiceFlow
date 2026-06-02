import { InvoiceItem, InvoiceDiscount } from '@/types';

export interface InvoiceTotals {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  total: number;
}

export function calculateTotals(
  items: InvoiceItem[],
  discount: InvoiceDiscount | undefined,
  taxRate: number
): InvoiceTotals {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);

  let discountAmount = 0;
  if (discount && discount.value > 0) {
    if (discount.type === 'percentage') {
      discountAmount = (subtotal * discount.value) / 100;
    } else {
      discountAmount = Math.min(discount.value, subtotal);
    }
  }

  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxRate > 0 ? (taxableAmount * taxRate) / 100 : 0;
  const total = taxableAmount + taxAmount;

  return {
    subtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    total,
  };
}

export function calculateItemAmount(quantity: number, rate: number): number {
  return quantity * rate;
}
