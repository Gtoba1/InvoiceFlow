'use client';

import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Service } from '@/types';
import { STORAGE_KEYS } from '@/lib/storage';
import { generateId } from '@/lib/utils';
import { DEFAULT_SERVICES } from '@/lib/sample-data';

export function useServices() {
  const [services, setServices, hydrated] = useLocalStorage<Service[]>(STORAGE_KEYS.SERVICES, []);

  // Seed default services on first run
  useEffect(() => {
    if (hydrated && services.length === 0) {
      setServices(DEFAULT_SERVICES);
    }
  }, [hydrated, services.length, setServices]);

  const addService = (data: Omit<Service, 'id' | 'createdAt'>): Service => {
    const service: Service = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setServices((prev) => [...prev, service]);
    return service;
  };

  const updateService = (id: string, data: Partial<Omit<Service, 'id' | 'createdAt'>>) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
  };

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  return { services, addService, updateService, deleteService };
}
