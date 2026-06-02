'use client';

import { useState, useEffect, useCallback } from 'react';
import { storageGet, storageSet } from '@/lib/storage';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = storageGet<T>(key, initialValue);
    setValue(stored);
    setHydrated(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const set = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const resolved = typeof newValue === 'function' ? (newValue as (prev: T) => T)(prev) : newValue;
      storageSet(key, resolved);
      return resolved;
    });
  }, [key]);

  return [value, set, hydrated] as const;
}
