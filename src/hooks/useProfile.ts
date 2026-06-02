'use client';

/**
 * useProfile hook — manages the authenticated user's freelancer profile.
 * Fetches from /api/profile on mount and persists changes back to Supabase.
 * Falls back to the DEFAULT_PROFILE shape while loading.
 */
import { useState, useEffect, useCallback } from 'react';
import { FreelancerProfile, DEFAULT_PROFILE } from '@/types';

/** Convert snake_case DB column names to our camelCase FreelancerProfile shape. */
function dbToProfile(row: Record<string, unknown>): FreelancerProfile {
  return {
    fullName:      (row.full_name      as string)  ?? '',
    businessName:  (row.business_name  as string)  ?? '',
    email:         (row.email          as string)  ?? '',
    phone:         (row.phone          as string)  ?? '',
    address:       (row.address        as string)  ?? '',
    website:       (row.website        as string)  ?? '',
    bankName:      (row.bank_name      as string)  ?? '',
    accountNumber: (row.account_number as string)  ?? '',
    accountName:   (row.account_name   as string)  ?? '',
    logo:          (row.logo           as string)  ?? '',
    signature:     (row.signature      as string)  ?? '',
    accentColor:   (row.accent_color   as string)  ?? '#3b82f6',
    isAdmin:       (row.is_admin       as boolean) ?? false,
  };
}

/** Convert camelCase FreelancerProfile back to snake_case for the API. */
function profileToDb(profile: FreelancerProfile): Record<string, string> {
  return {
    full_name:      profile.fullName,
    business_name:  profile.businessName,
    email:          profile.email,
    phone:          profile.phone,
    address:        profile.address,
    website:        profile.website,
    bank_name:      profile.bankName,
    account_number: profile.accountNumber,
    account_name:   profile.accountName,
    logo:           profile.logo,
    signature:      profile.signature,
    accent_color:   profile.accentColor,
  };
}

export function useProfile() {
  const [profile, setProfileState] = useState<FreelancerProfile>(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = useState(true);
  // true when the user has never completed profile setup (shows the onboarding dialog)
  const [needsSetup, setNeedsSetup] = useState(false);

  // Key stored in localStorage after the user completes the profile setup dialog.
  // This prevents the dialog from re-appearing on refresh even if the API is slow or errors.
  const SETUP_FLAG = 'invoiceflow_setup_done';

  useEffect(() => {
    // Fast path: if the user has already completed setup (flag in localStorage), skip the dialog
    const setupDone = typeof window !== 'undefined' && localStorage.getItem(SETUP_FLAG) === 'true';

    fetch('/api/profile')
      .then((r) => r.json())
      .then((data) => {
        const hasName = data && typeof data.full_name === 'string' && data.full_name.trim().length > 0;
        if (hasName) {
          // Profile exists in DB — load it and mark setup done locally
          setProfileState(dbToProfile(data));
          setNeedsSetup(false);
          if (typeof window !== 'undefined') localStorage.setItem(SETUP_FLAG, 'true');
        } else if (setupDone) {
          // localStorage says done even though DB row might be empty — trust the flag
          if (data?.email) setProfileState((p) => ({ ...p, email: data.email as string }));
          setNeedsSetup(false);
        } else {
          // Genuinely first time — show the setup dialog
          if (data?.email) setProfileState((p) => ({ ...p, email: data.email as string }));
          setNeedsSetup(true);
        }
      })
      .catch(() => {
        // If API fails, trust localStorage flag to avoid blocking the user
        setNeedsSetup(!setupDone);
      })
      .finally(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Persist a full profile object (used by ProfileSetupDialog and ProfileDialog). */
  const setProfile = useCallback(async (next: FreelancerProfile) => {
    setProfileState(next);
    setNeedsSetup(false);
    await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileToDb(next)),
    });
  }, []);

  /** Merge partial updates — useful for individual field edits. */
  const updateProfile = useCallback(async (updates: Partial<FreelancerProfile>) => {
    const next = { ...profile, ...updates };
    setProfileState(next);
    await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileToDb(next)),
    });
  }, [profile]);

  /** Called from ProfileSetupDialog — accepts raw snake_case keys from the form. */
  const saveInitialProfile = useCallback(async (raw: Record<string, string>) => {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(raw),
    });
    const data = await res.json();
    setProfileState(dbToProfile(data));
    setNeedsSetup(false);
    // Persist the flag so the dialog never re-appears on refresh
    if (typeof window !== 'undefined') localStorage.setItem('invoiceflow_setup_done', 'true');
  }, []);

  return { profile, isLoading, needsSetup, setProfile, updateProfile, saveInitialProfile };
}
