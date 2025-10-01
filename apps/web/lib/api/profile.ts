/**
 * Profile API Client
 */

import { createBrowserApiClient } from './client';
import type {
  BasicProfile,
  BasicProfileUpdate,
  UsernameAvailability,
} from '@/lib/types/profile';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

export const profileApi = {
  /**
   * Get current user's basic profile
   */
  getMyProfile: async (): Promise<BasicProfile> => {
    const client = createBrowserApiClient();
    const response = await client.get<ApiResponse<BasicProfile>>('/api/v1/profiles/me');
    return response.data;
  },

  /**
   * Update basic profile
   */
  updateProfile: async (data: BasicProfileUpdate): Promise<BasicProfile> => {
    const client = createBrowserApiClient();
    const response = await client.put<ApiResponse<BasicProfile>, BasicProfileUpdate>(
      '/api/v1/profiles/me',
      data
    );
    return response.data;
  },

  /**
   * Get any user's profile by identifier (username or ID)
   */
  getProfile: async (identifier: string): Promise<BasicProfile> => {
    const client = createBrowserApiClient();
    const response = await client.get<ApiResponse<BasicProfile>>(
      `/api/v1/profiles/${identifier}`
    );
    return response.data;
  },

  /**
   * Check username availability
   */
  checkUsername: async (username: string): Promise<UsernameAvailability> => {
    const client = createBrowserApiClient();
    const response = await client.get<ApiResponse<UsernameAvailability>>(
      `/api/v1/profiles/username/${username}/availability`
    );
    return response.data;
  },
};

