import { Currency } from '@/types';

const CURRENCY_CONFIG: Record<Currency, { symbol: string; locale: string; code: string }> = {
  NGN: { symbol: '₦', locale: 'en-NG', code: 'NGN' },
  USD: { symbol: '$', locale: 'en-US', code: 'USD' },
  GBP: { symbol: '£', locale: 'en-GB', code: 'GBP' },
  EUR: { symbol: '€', locale: 'de-DE', code: 'EUR' },
};

export function formatCurrency(amount: number, currency: Currency): string {
  const config = CURRENCY_CONFIG[currency];
  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${config.symbol}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }
}

export function getCurrencySymbol(currency: Currency): string {
  return CURRENCY_CONFIG[currency].symbol;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatNumber(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function today(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}
