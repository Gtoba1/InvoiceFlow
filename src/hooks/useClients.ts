'use client';

/**
 * useClients hook — manages the user's saved client list via Supabase browser client.
 * Optimistic updates keep the UI snappy while the DB write happens in the background.
 */
import { useState, useEffect, useCallback } from 'react';
import { Client } from '@/types';
import { generateId } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

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

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          if (Array.isArray(data)) {
            setClients(data.map((r) => rowToClient(r as Record<string, unknown>)));
          }
        });
    });
  }, []);

  const addClient = useCallback(async (data: Omit<Client, 'id' | 'createdAt'>): Promise<Client> => {
    const temp: Client = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    setClients((prev) => [temp, ...prev]);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return temp;

    const { data: saved } = await supabase
      .from('clients')
      .insert({
        user_id:      user.id,
        name:         data.name,
        company:      data.company,
        email:        data.email,
        phone:        data.phone,
        address:      data.address,
        country:      data.country,
        country_code: data.countryCode,
      })
      .select()
      .single();

    const client = rowToClient(saved as Record<string, unknown>);
    setClients((prev) => prev.map((c) => (c.id === temp.id ? client : c)));
    return client;
  }, []);

  const updateClient = useCallback(async (id: string, data: Partial<Omit<Client, 'id' | 'createdAt'>>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('clients')
      .update({
        name:         data.name,
        company:      data.company,
        email:        data.email,
        phone:        data.phone,
        address:      data.address,
        country:      data.country,
        country_code: data.countryCode,
      })
      .eq('id', id)
      .eq('user_id', user.id);
  }, []);

  const deleteClient = useCallback(async (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('clients').delete().eq('id', id).eq('user_id', user.id);
  }, []);

  return { clients, addClient, updateClient, deleteClient };
}
