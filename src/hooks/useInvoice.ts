'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Invoice, InvoiceItem, ClientInfo, InvoiceDiscount, InvoiceTemplate,
  AppSettings, DEFAULT_SETTINGS, FreelancerProfile,
} from '@/types';
import { generateId } from '@/lib/utils';
import { calculateTotals, calculateItemAmount } from '@/lib/calculations';
import { STORAGE_KEYS, storageGet, storageSet } from '@/lib/storage';
import { today, addDays } from '@/lib/formatters';

// Calculates totals synchronously — call inside every setInvoice that touches items/discount/taxRate
function withTotals(inv: Invoice): Invoice {
  const { subtotal, discountAmount, taxAmount, total } = calculateTotals(inv.items, inv.discount, inv.taxRate);
  return { ...inv, subtotal, discountAmount, taxAmount, total, updatedAt: new Date().toISOString() };
}

function createDefaultInvoice(settings: AppSettings, profile: FreelancerProfile | null): Invoice {
  const invoiceDate = today();
  const dueDate = addDays(invoiceDate, 30);
  const num = String(settings.nextInvoiceNumber).padStart(3, '0');
  const year = new Date().getFullYear();

  const paymentInstructions = profile?.bankName
    ? `Bank: ${profile.bankName}\nAccount Name: ${profile.accountName}\nAccount Number: ${profile.accountNumber}`
    : '';

  return {
    id: generateId(),
    invoiceNumber: `${settings.invoicePrefix}-${year}-${num}`,
    invoiceDate,
    dueDate,
    currency: settings.defaultCurrency,
    client: { name: '', company: '', email: '', phone: '', address: '', country: '', countryCode: '' },
    items: [],
    taxRate: settings.defaultTaxRate,
    notes: '',
    paymentInstructions,
    terms: 'Payment is due within 30 days of invoice date. Thank you for your business.',
    status: 'draft',
    template: settings.defaultTemplate,
    subtotal: 0,
    discountAmount: 0,
    taxAmount: 0,
    total: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function useInvoice(profile: FreelancerProfile | null) {
  const [settings, setSettings] = useState<AppSettings>(() =>
    storageGet<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)
  );

  const [invoice, setInvoice] = useState<Invoice>(() => {
    const saved = storageGet<Invoice | null>(STORAGE_KEYS.CURRENT_INVOICE, null);
    if (saved) {
      // Backfill country/countryCode for invoices saved before these fields existed
      const client = Object.assign(
        { country: '', countryCode: '' },
        saved.client,
      ) as ClientInfo;
      // Ensure qty is never 0 for any existing item — recalculate amounts too
      const items = (saved.items ?? []).map((item) => {
        const quantity = item.quantity > 0 ? item.quantity : 1;
        return { ...item, quantity, amount: calculateItemAmount(quantity, item.rate) };
      });
      return withTotals({ ...saved, client, items });
    }
    const s = storageGet<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    return createDefaultInvoice(s, null);
  });

  // Auto-save current invoice whenever it changes
  useEffect(() => {
    storageSet(STORAGE_KEYS.CURRENT_INVOICE, invoice);
  }, [invoice]);

  const updateField = useCallback(<K extends keyof Invoice>(field: K, value: Invoice[K]) => {
    if (field === 'taxRate') {
      setInvoice((prev) => withTotals({ ...prev, [field]: value }));
    } else {
      setInvoice((prev) => ({ ...prev, [field]: value }));
    }
  }, []);

  const updateClient = useCallback((client: Partial<ClientInfo>) => {
    setInvoice((prev) => ({ ...prev, client: { ...prev.client, ...client } }));
  }, []);

  const setClientFromSaved = useCallback((clientId: string, client: ClientInfo) => {
    setInvoice((prev) => ({ ...prev, clientId, client }));
  }, []);

  const addItem = useCallback(() => {
    const newItem: InvoiceItem = {
      id: generateId(),
      service: '',
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
    };
    setInvoice((prev) => withTotals({ ...prev, items: [...prev.items, newItem] }));
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<InvoiceItem>) => {
    setInvoice((prev) => {
      const items = prev.items.map((item) => {
        if (item.id !== id) return item;
        const merged = { ...item, ...updates };
        if ('quantity' in updates || 'rate' in updates) {
          merged.amount = calculateItemAmount(merged.quantity, merged.rate);
        }
        return merged;
      });
      return withTotals({ ...prev, items });
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setInvoice((prev) => withTotals({ ...prev, items: prev.items.filter((i) => i.id !== id) }));
  }, []);

  const duplicateItem = useCallback((id: string) => {
    setInvoice((prev) => {
      const idx = prev.items.findIndex((i) => i.id === id);
      if (idx === -1) return prev;
      const copy = { ...prev.items[idx], id: generateId() };
      const newItems = [...prev.items];
      newItems.splice(idx + 1, 0, copy);
      return withTotals({ ...prev, items: newItems });
    });
  }, []);

  // serviceTerms: collected terms from all currently-used services after this change
  const setServiceForItem = useCallback((
    itemId: string,
    service: { name: string; description: string; rate: number; id: string },
    serviceTerms?: string,
  ) => {
    setInvoice((prev) => {
      const items = prev.items.map((item) => {
        if (item.id !== itemId) return item;
        return {
          ...item,
          serviceId: service.id,
          service: service.name,
          description: item.description || service.description,
          rate: service.rate,
          amount: calculateItemAmount(item.quantity, service.rate),
        };
      });
      // Only auto-populate terms if the caller provided them
      const terms = serviceTerms !== undefined ? serviceTerms : prev.terms;
      return withTotals({ ...prev, items, terms });
    });
  }, []);

  const updateDiscount = useCallback((discount: InvoiceDiscount | undefined) => {
    setInvoice((prev) => withTotals({ ...prev, discount }));
  }, []);

  const setTemplate = useCallback((template: InvoiceTemplate) => {
    setInvoice((prev) => ({ ...prev, template }));
  }, []);

  const resetInvoice = useCallback(() => {
    const s = storageGet<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    const newSettings = { ...s, nextInvoiceNumber: s.nextInvoiceNumber + 1 };
    storageSet(STORAGE_KEYS.SETTINGS, newSettings);
    setSettings(newSettings);
    setInvoice(createDefaultInvoice(newSettings, profile));
  }, [profile]);

  const saveInvoice = useCallback(() => {
    const saved = storageGet<Invoice[]>(STORAGE_KEYS.INVOICES, []);
    const existing = saved.findIndex((inv) => inv.id === invoice.id);
    if (existing >= 0) saved[existing] = invoice;
    else saved.push(invoice);
    storageSet(STORAGE_KEYS.INVOICES, saved);
    const newSettings = { ...settings, nextInvoiceNumber: settings.nextInvoiceNumber + 1 };
    storageSet(STORAGE_KEYS.SETTINGS, newSettings);
    setSettings(newSettings);
  }, [invoice, settings]);

  return {
    invoice,
    settings,
    updateField,
    updateClient,
    setClientFromSaved,
    addItem,
    updateItem,
    removeItem,
    duplicateItem,
    setServiceForItem,
    updateDiscount,
    setTemplate,
    resetInvoice,
    saveInvoice,
  };
}
