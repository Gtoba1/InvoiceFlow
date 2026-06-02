'use client';

import { useLocalStorage } from './useLocalStorage';
import { Client } from '@/types';
import { STORAGE_KEYS } from '@/lib/storage';
import { generateId } from '@/lib/utils';

export function useClients() {
  const [clients, setClients] = useLocalStorage<Client[]>(STORAGE_KEYS.CLIENTS, []);

  const addClient = (data: Omit<Client, 'id' | 'createdAt'>): Client => {
    const client: Client = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setClients((prev) => [...prev, client]);
    return client;
  };

  const updateClient = (id: string, data: Partial<Omit<Client, 'id' | 'createdAt'>>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  return { clients, addClient, updateClient, deleteClient };
}
