/**
 * useProfile Hook
 * Manages basic profile state and operations
 */

'use client';

import { useState, useEffect } from 'react';
import { profileApi } from '@/lib/api/profile';
import type { BasicProfile, BasicProfileUpdate } from '@/lib/types/profile';

export function useProfile() {
  const [profile, setProfile] = useState<BasicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileApi.getMyProfile();
      setProfile(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
      setError(errorMessage);
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update profile (optimistic)
  const updateProfile = async (updates: BasicProfileUpdate): Promise<void> => {
    const originalProfile = profile;

    // Optimistic update
    if (profile) {
      setProfile({ ...profile, ...updates });
    }

    try {
      const updatedProfile = await profileApi.updateProfile(updates);
      setProfile(updatedProfile);
    } catch (err: unknown) {
      // Rollback on error
      setProfile(originalProfile);
      throw err;
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetch: fetchProfile,
  };
}

