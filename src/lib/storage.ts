const PREFIX = 'invoiceflow_';

export const STORAGE_KEYS = {
  PROFILE: `${PREFIX}profile`,
  CLIENTS: `${PREFIX}clients`,
  SERVICES: `${PREFIX}services`,
  SETTINGS: `${PREFIX}settings`,
  INVOICES: `${PREFIX}invoices`,
  CURRENT_INVOICE: `${PREFIX}current_invoice`,
} as const;

export function storageGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function storageSet<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage write failed:', e);
  }
}

export function storageRemove(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
}
