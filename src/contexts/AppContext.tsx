'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useClients } from '@/hooks/useClients';
import { useServices } from '@/hooks/useServices';
import { useInvoice } from '@/hooks/useInvoice';
import type {
  FreelancerProfile, Client, Service, Invoice,
  InvoiceItem, ClientInfo, InvoiceDiscount, InvoiceTemplate, AppSettings,
} from '@/types';

interface AppContextType {
  profile: FreelancerProfile;
  updateProfile: (updates: Partial<FreelancerProfile>) => void;
  setProfile: (profile: FreelancerProfile) => void;
  clients: Client[];
  addClient: (data: Omit<Client, 'id' | 'createdAt'>) => Client;
  updateClient: (id: string, data: Partial<Omit<Client, 'id' | 'createdAt'>>) => void;
  deleteClient: (id: string) => void;
  services: Service[];
  addService: (data: Omit<Service, 'id' | 'createdAt'>) => Service;
  updateService: (id: string, data: Partial<Omit<Service, 'id' | 'createdAt'>>) => void;
  deleteService: (id: string) => void;
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
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { profile, updateProfile, setProfile } = useProfile();
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
    resetInvoice, saveInvoice,
  } = useInvoice(profile);

  // Wrap setServiceForItem to inject terms collected from the service catalogue
  const setServiceForItem = (
    itemId: string,
    service: { name: string; description: string; rate: number; id: string },
  ) => {
    // Compute combined terms from all services that will be in the invoice after this change
    const updatedItems = invoice.items.map((item) =>
      item.id === itemId ? { ...item, serviceId: service.id } : item,
    );
    const usedServiceIds = new Set(updatedItems.map((i) => i.serviceId).filter(Boolean));
    const combinedTerms = services
      .filter((s) => usedServiceIds.has(s.id))
      .map((s) => s.terms)
      .filter(Boolean)
      .join('\n\n');

    rawSetServiceForItem(itemId, service, combinedTerms || undefined);
  };

  return (
    <AppContext.Provider value={{
      profile, updateProfile, setProfile,
      clients, addClient, updateClient, deleteClient,
      services, addService, updateService, deleteService,
      invoice, settings,
      updateField, updateClientInfo, setClientFromSaved,
      addItem, updateItem, removeItem, duplicateItem,
      setServiceForItem, updateDiscount, setTemplate,
      resetInvoice, saveInvoice,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
