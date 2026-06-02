'use client';

import { useLocalStorage } from './useLocalStorage';
import { FreelancerProfile, DEFAULT_PROFILE } from '@/types';
import { STORAGE_KEYS } from '@/lib/storage';

export function useProfile() {
  const [profile, setProfile] = useLocalStorage<FreelancerProfile>(
    STORAGE_KEYS.PROFILE,
    DEFAULT_PROFILE
  );

  const updateProfile = (updates: Partial<FreelancerProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  return { profile, setProfile, updateProfile };
}
