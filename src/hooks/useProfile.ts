'use client';

/**
 * useProfile hook — loads and saves the authenticated user's profile.
 *
 * Uses onAuthStateChange so the profile reloads automatically after
 * sign-in / email verification without needing a page refresh.
 *
 * All Supabase calls go through the browser client (never API routes)
 * so the authenticated session is always available.
 */
import { useState, useEffect, useCallback } from 'react';
import { FreelancerProfile, DEFAULT_PROFILE } from '@/types';
import { createClient } from '@/lib/supabase/client';

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

function profileToDb(p: FreelancerProfile): Record<string, unknown> {
  return {
    full_name:      p.fullName,
    business_name:  p.businessName,
    email:          p.email,
    phone:          p.phone,
    address:        p.address,
    website:        p.website,
    bank_name:      p.bankName,
    account_number: p.accountNumber,
    account_name:   p.accountName,
    logo:           p.logo,
    signature:      p.signature,
    accent_color:   p.accentColor,
    // is_admin intentionally excluded — set via SQL only
  };
}

export function useProfile() {
  const [profile, setProfileState] = useState<FreelancerProfile>(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    /** Fetch the profile row for the currently signed-in user */
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !mounted) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!mounted) return;

        if (error) {
          console.error('[useProfile] fetch error:', error.message);
        } else if (data) {
          setProfileState(dbToProfile(data as Record<string, unknown>));
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    // Load immediately on mount
    loadProfile();

    // Re-load whenever the auth state changes (sign-in, token refresh, etc.)
    // This covers the case where the user verifies their email and the session
    // becomes available after the component has already mounted.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') {
        loadProfile();
      }
      if (event === 'SIGNED_OUT') {
        setProfileState(DEFAULT_PROFILE);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Save a complete profile to Supabase.
   * Throws on failure so the caller can show an error toast.
   */
  const setProfile = useCallback(async (next: FreelancerProfile) => {
    // Optimistic update — update UI immediately
    setProfileState(next);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not signed in');

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...profileToDb(next) });

    if (error) {
      console.error('[useProfile] save error:', error.message, error.details);
      throw error;
    }
  }, []);

  /** Merge partial updates — used for individual field changes */
  const updateProfile = useCallback(async (updates: Partial<FreelancerProfile>) => {
    const next = { ...profile, ...updates };
    setProfileState(next);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...profileToDb(next) });

    if (error) {
      console.error('[useProfile] update error:', error.message);
    }
  }, [profile]);

  return { profile, isLoading, setProfile, updateProfile };
}
