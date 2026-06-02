'use client';

/**
 * useClients hook — manages the user's saved client list.
 * All CRUD operations go through /api/clients and are persisted in Supabase.
 * Optimistic updates keep the UI snappy — the state updates immediately
 * while the API call runs in the background.
 */
import { useState, useEffect, useCallback } from 'react';
import { Client } from '@/types';
import { generateId } from '@/lib/utils';

/** Map the snake_case DB row to our Client type. */
function rowToClient(row: Record<string, unknown>): Client {
  return {
    id:          row.id          as string,
    name:        row.name        as string,
    company:     (row.company     as string) ?? '',
    email:       (row.email       as string) ?? '',
    phone:       (row.phone       as string) ?? '',
    address:     (row.address     as string) ?? '',
    country:     (row.country     as string) ?? '',
    countryCode: (row.country_code as string) ?? '',
    createdAt:   (row.created_at  as string) ?? new Date().toISOString(),
  };
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);

  // Fetch all clients on mount
  useEffect(() => {
    fetch('/api/clients')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setClients(data.map(rowToClient));
      })
      .catch(console.error);
  }, []);

  const addClient = useCallback(async (data: Omit<Client, 'id' | 'createdAt'>): Promise<Client> => {
    // Optimistic placeholder so the UI updates instantly
    const temp: Client = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    setClients((prev) => [temp, ...prev]);

    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:         data.name,
        company:      data.company,
        email:        data.email,
        phone:        data.phone,
        address:      data.address,
        country:      data.country,
        country_code: data.countryCode,
      }),
    });

    const saved = await res.json();
    const client = rowToClient(saved);

    // Replace the temp placeholder with the real DB record (which has the real UUID)
    setClients((prev) => prev.map((c) => (c.id === temp.id ? client : c)));
    return client;
  }, []);

  const updateClient = useCallback(async (id: string, data: Partial<Omit<Client, 'id' | 'createdAt'>>) => {
    // Optimistic update
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));

    await fetch(`/api/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:         data.name,
        company:      data.company,
        email:        data.email,
        phone:        data.phone,
        address:      data.address,
        country:      data.country,
        country_code: data.countryCode,
      }),
    });
  }, []);

  const deleteClient = useCallback(async (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    await fetch(`/api/clients/${id}`, { method: 'DELETE' });
  }, []);

  return { clients, addClient, updateClient, deleteClient };
}
