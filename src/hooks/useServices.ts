'use client';

/**
 * useServices hook — manages the user's service catalogue via Supabase browser client.
 * Seeds default services on first login if the user has none.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { Service } from '@/types';
import { generateId } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { DEFAULT_SERVICES } from '@/lib/sample-data';

function rowToService(row: Record<string, unknown>): Service {
  return {
    id:          row.id          as string,
    name:        row.name        as string,
    description: (row.description as string) ?? '',
    rate:        Number(row.rate) ?? 0,
    terms:       (row.terms      as string) ?? '',
    createdAt:   (row.created_at  as string) ?? new Date().toISOString(),
  };
}

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const seeding = useRef(false); // prevent double-seeding in StrictMode

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;

      const { data } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (Array.isArray(data) && data.length > 0) {
        setServices(data.map((r) => rowToService(r as Record<string, unknown>)));
        return;
      }

      // First login — seed default services
      if (seeding.current) return;
      seeding.current = true;

      await Promise.all(
        DEFAULT_SERVICES.map((s) =>
          supabase.from('services').insert({
            user_id:     user.id,
            name:        s.name,
            description: s.description,
            rate:        s.rate,
            terms:       s.terms,
          }),
        ),
      );

      const { data: seeded } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (Array.isArray(seeded)) {
        setServices(seeded.map((r) => rowToService(r as Record<string, unknown>)));
      }
    });
  }, []);

  const addService = useCallback(async (data: Omit<Service, 'id' | 'createdAt'>): Promise<Service> => {
    const temp: Service = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    setServices((prev) => [...prev, temp]);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return temp;

    const { data: saved } = await supabase
      .from('services')
      .insert({ user_id: user.id, name: data.name, description: data.description, rate: data.rate, terms: data.terms })
      .select()
      .single();

    const service = rowToService(saved as Record<string, unknown>);
    setServices((prev) => prev.map((s) => (s.id === temp.id ? service : s)));
    return service;
  }, []);

  const updateService = useCallback(async (id: string, data: Partial<Omit<Service, 'id' | 'createdAt'>>) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('services')
      .update({ name: data.name, description: data.description, rate: data.rate, terms: data.terms })
      .eq('id', id)
      .eq('user_id', user.id);
  }, []);

  const deleteService = useCallback(async (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('services').delete().eq('id', id).eq('user_id', user.id);
  }, []);

  return { services, addService, updateService, deleteService };
}
