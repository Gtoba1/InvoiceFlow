'use client';

/**
 * useServices hook — manages the user's service catalogue.
 * On first login the API returns an empty list, so we seed DEFAULT_SERVICES
 * into the database automatically so the user has something to start with.
 * Users can freely add, edit, or delete services at any time.
 */
import { useState, useEffect, useCallback } from 'react';
import { Service } from '@/types';
import { generateId } from '@/lib/utils';
import { DEFAULT_SERVICES } from '@/lib/sample-data';

/** Map snake_case DB row → our Service type. */
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
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    fetch('/api/services')
      .then((r) => r.json())
      .then(async (data) => {
        if (Array.isArray(data) && data.length > 0) {
          setServices(data.map(rowToService));
        } else if (!seeded) {
          // First login — seed the default services for this user
          setSeeded(true);
          await Promise.all(
            DEFAULT_SERVICES.map((s) =>
              fetch('/api/services', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: s.name, description: s.description, rate: s.rate, terms: s.terms,
                }),
              }),
            ),
          );
          // Fetch again to get real IDs from the DB
          const res = await fetch('/api/services');
          const seededData = await res.json();
          if (Array.isArray(seededData)) setServices(seededData.map(rowToService));
        }
      })
      .catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addService = useCallback(async (data: Omit<Service, 'id' | 'createdAt'>): Promise<Service> => {
    // Optimistic placeholder
    const temp: Service = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    setServices((prev) => [...prev, temp]);

    const res = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name, description: data.description, rate: data.rate, terms: data.terms,
      }),
    });
    const saved = await res.json();
    const service = rowToService(saved);
    setServices((prev) => prev.map((s) => (s.id === temp.id ? service : s)));
    return service;
  }, []);

  const updateService = useCallback(async (id: string, data: Partial<Omit<Service, 'id' | 'createdAt'>>) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
    await fetch(`/api/services/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name, description: data.description, rate: data.rate, terms: data.terms,
      }),
    });
  }, []);

  const deleteService = useCallback(async (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    await fetch(`/api/services/${id}`, { method: 'DELETE' });
  }, []);

  return { services, addService, updateService, deleteService };
}
