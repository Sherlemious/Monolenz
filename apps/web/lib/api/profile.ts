/**
 * Profile API Client
 * Handles profile CRUD and username availability
 */

import type { Profile, VersionBlockDetail } from '@monolenz/types/entities';
import type { ApiResponse } from '@monolenz/types/api';
import type { ApiClient } from './profile-blocks';

// ============================================================================
// API Response Types
// ============================================================================

type ProfileResponse = ApiResponse<Profile>;

type UsernameAvailabilityResponse = ApiResponse<{
  available: boolean;
  username: string;
}>;

type LatestVersionResponse = ApiResponse<{
  version: {
    id: number;
    profile_id: string;
    parent_version_id: number | null;
    name: string | null;
    description: string | null;
    metadata: Record<string, unknown> | null;
    created_at: string;
  };
  blocks: VersionBlockDetail[];
}>;

// ============================================================================
// Profile API
// ============================================================================

export function createProfileApi(client: ApiClient) {
  const BASE_PATH = '/api/v1/profiles';

  return {
    /**
     * Get the current user's profile (returns null if no profile exists yet)
     */
    async getMyProfile(): Promise<Profile | null> {
      try {
        const response = await client.get<ProfileResponse>(`${BASE_PATH}/me`);
        if (!response.data) {
          return null;
        }
        return response.data;
      } catch {
        // 404 = profile not found, which is expected for new users
        return null;
      }
    },

    /**
     * Create a new profile (for first-time users)
     */
    async createProfile(data: {
      username: string;
      bio?: string;
      profile_picture_url?: string;
      linkedin_url?: string;
      github_url?: string;
      portfolio_url?: string;
    }): Promise<Profile> {
      const response = await client.post<ProfileResponse>(BASE_PATH, data);
      if (!response.data) {
        throw new Error('Failed to create profile: no data returned');
      }
      return response.data;
    },

    /**
     * Update the current user's profile
     */
    async updateProfile(data: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>): Promise<Profile> {
      if (!client.put) {
        throw new Error('PUT method not available on API client');
      }
      const response = await client.put<ProfileResponse>(`${BASE_PATH}/me`, data);
      if (!response.data) {
        throw new Error('Failed to update profile: no data returned');
      }
      return response.data;
    },

    /**
     * Check if a username is available
     */
    async checkUsernameAvailability(username: string): Promise<{ available: boolean; username: string }> {
      const response = await client.get<UsernameAvailabilityResponse>(
        `${BASE_PATH}/username/${encodeURIComponent(username)}/availability`
      );
      if (!response.data) {
        throw new Error('Failed to check username availability');
      }
      return response.data;
    },

    /**
     * Get the latest version and blocks for a profile
     */
    async getLatestVersion(
      identifier: string
    ): Promise<{ version: { id: number }; blocks: VersionBlockDetail[] } | null> {
      try {
        const response = await client.get<LatestVersionResponse>(
          `${BASE_PATH}/${encodeURIComponent(identifier)}/versions/latest`
        );
        if (!response.data) {
          return null;
        }
        return response.data;
      } catch {
        // No versions yet is not an error
        return null;
      }
    },
  };
}

export type ProfileApi = ReturnType<typeof createProfileApi>;
