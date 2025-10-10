/**
 * useProfile Hook
 * Manages basic profile state and operations
 */

'use client';

import { useState, useEffect } from 'react';
import { profileApi } from '@/lib/api/profile';
import type { BasicProfile, BasicProfileUpdate } from '@/lib/types/profile';
import { ApiError } from '@/lib/api/common';


export function useProfile() {
  const [profile, setProfile] = useState<BasicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; status?: number } | null>(null);

  // Fetch profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileApi.getMyProfile();
      setProfile(data);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError({ message: err.message, status: err.status });
      } else {
        setError({ message: 'Failed to load profile' });
      }
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

