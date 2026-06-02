'use client';

/**
 * useProfile hook — manages the authenticated user's freelancer profile.
 *
 * Uses the Supabase browser client directly (not an API route) so the
 * authenticated session is always available without cookie-passing issues.
 */
import { useState, useEffect, useCallback } from 'react';
import { FreelancerProfile, DEFAULT_PROFILE } from '@/types';
import { createClient } from '@/lib/supabase/client';

/** Convert snake_case Supabase row → camelCase FreelancerProfile */
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

/** Convert camelCase FreelancerProfile → snake_case for Supabase */
function profileToDb(profile: FreelancerProfile): Record<string, unknown> {
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
    // Note: is_admin is intentionally excluded — only set via SQL by the dev
  };
}


export function useProfile() {
  const [profile, setProfileState] = useState<FreelancerProfile>(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data) {
          setProfileState(dbToProfile(data as Record<string, unknown>));
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  /** Persist a full profile object to Supabase */
  const setProfile = useCallback(async (next: FreelancerProfile) => {
    setProfileState(next);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('profiles')
      .upsert({ id: user.id, ...profileToDb(next) });
  }, []);

  /** Merge partial updates into the profile */
  const updateProfile = useCallback(async (updates: Partial<FreelancerProfile>) => {
    setProfileState((prev) => {
      const next = { ...prev, ...updates };

      // Fire the save in the background (no await needed in the updater)
      createClient().auth.getUser().then(({ data: { user } }) => {
        if (!user) return;
        createClient()
          .from('profiles')
          .upsert({ id: user.id, ...profileToDb(next) });
      });

      return next;
    });
  }, []);

  return { profile, isLoading, setProfile, updateProfile };
}
