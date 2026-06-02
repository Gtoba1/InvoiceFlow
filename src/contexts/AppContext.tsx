'use client';

/**
 * AppContext — global state provider for the invoice editor.
 * Combines profile, clients, services, and the current invoice into one
 * context so any component can read or update app state without prop drilling.
 *
 * Architecture note:
 *   - Profile / Clients / Services are persisted to Supabase via their hooks.
 *   - The current Invoice lives in React state (for real-time preview) and is
 *     saved to Supabase only when the user explicitly clicks Save.
 */
import { createContext, useContext, ReactNode } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useClients } from '@/hooks/useClients';
import { useServices } from '@/hooks/useServices';
import { useInvoice } from '@/hooks/useInvoice';
import { useAccentColor } from '@/hooks/useAccentColor';
import type {
  FreelancerProfile, Client, Service, Invoice,
  InvoiceItem, ClientInfo, InvoiceDiscount, InvoiceTemplate, AppSettings,
} from '@/types';

interface AppContextType {
  // ── Profile ───────────────────────────────────────────────
  profile: FreelancerProfile;
  isProfileLoading: boolean;
  needsSetup: boolean;
  updateProfile: (updates: Partial<FreelancerProfile>) => Promise<void>;
  setProfile: (profile: FreelancerProfile) => Promise<void>;
  saveInitialProfile: (raw: Record<string, string>) => Promise<void>;
  // ── Clients ───────────────────────────────────────────────
  clients: Client[];
  addClient: (data: Omit<Client, 'id' | 'createdAt'>) => Promise<Client>;
  updateClient: (id: string, data: Partial<Omit<Client, 'id' | 'createdAt'>>) => void | Promise<void>;
  deleteClient: (id: string) => void | Promise<void>;
  // ── Services ──────────────────────────────────────────────
  services: Service[];
  addService: (data: Omit<Service, 'id' | 'createdAt'>) => Promise<Service>;
  updateService: (id: string, data: Partial<Omit<Service, 'id' | 'createdAt'>>) => void | Promise<void>;
  deleteService: (id: string) => void | Promise<void>;
  // ── Invoice (current draft) ────────────────────────────────
  invoice: Invoice;
  settings: AppSettings;
  updateField: <K extends keyof Invoice>(field: K, value: Invoice[K]) => void;
  updateClientInfo: (client: Partial<ClientInfo>) => void;
  setClientFromSaved: (clientId: string, client: ClientInfo) => void;
  addItem: () => void;
  updateItem: (id: string, updates: Partial<InvoiceItem>) => void;
  removeItem: (id: string) => void;
  duplicateItem: (id: string) => void;
  setServiceForItem: (itemId: string, service: { name: string; description: string; rate: number; id: string }) => void;
  updateDiscount: (discount: InvoiceDiscount | undefined) => void;
  setTemplate: (template: InvoiceTemplate) => void;
  resetInvoice: () => void;
  saveInvoice: () => void;
  finalizeInvoice: () => Promise<string>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const {
    profile, isLoading: isProfileLoading, needsSetup,
    updateProfile, setProfile, saveInitialProfile,
  } = useProfile();

  // Apply the user's brand colour to the whole app UI as soon as it's loaded
  useAccentColor(profile.accentColor);

  const { clients, addClient, updateClient, deleteClient } = useClients();
  const { services, addService, updateService, deleteService } = useServices();

  const {
    invoice, settings,
    updateField,
    updateClient: updateClientInfo,
    setClientFromSaved,
    addItem, updateItem, removeItem, duplicateItem,
    setServiceForItem: rawSetServiceForItem,
    updateDiscount, setTemplate,
    resetInvoice, saveInvoice, finalizeInvoice,
  } = useInvoice(profile);

  /**
   * Wraps rawSetServiceForItem to inject the combined terms from the service
   * catalogue so the invoice Terms field auto-populates when services are selected.
   */
  const setServiceForItem = (
    itemId: string,
    service: { name: string; description: string; rate: number; id: string },
  ) => {
    // Calculate which service IDs will be active after this change
    const updatedItems = invoice.items.map((item) =>
      item.id === itemId ? { ...item, serviceId: service.id } : item,
    );
    const usedServiceIds = new Set(updatedItems.map((i) => i.serviceId).filter(Boolean));

    // Collect and deduplicate terms from all selected services
    const combinedTerms = services
      .filter((s) => usedServiceIds.has(s.id))
      .map((s) => s.terms)
      .filter(Boolean)
      .join('\n\n');

    rawSetServiceForItem(itemId, service, combinedTerms || undefined);
  };

  return (
    <AppContext.Provider value={{
      profile, isProfileLoading, needsSetup,
      updateProfile, setProfile, saveInitialProfile,
      clients, addClient, updateClient, deleteClient,
      services, addService, updateService, deleteService,
      invoice, settings,
      updateField, updateClientInfo, setClientFromSaved,
      addItem, updateItem, removeItem, duplicateItem,
      setServiceForItem, updateDiscount, setTemplate,
      resetInvoice, saveInvoice, finalizeInvoice,
    }}>
      {children}
    </AppContext.Provider>
  );
}

/** Convenience hook — throws if used outside AppProvider. */
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
