'use client';


/* this is for the profiles api different from profile blocks */

import type {ApiResponse , PaginatedResponse} from '@monolenz/types/api';
import type {Profile , PublicProfile} from '@monolenz/types/entities';


export interface ApiClient {
   
    // do get get , post , put , delete
    get: <T>(url: string, init?: RequestInit) => Promise<T>;
    post: <T>(url: string, body?: unknown, init?: RequestInit) => Promise<T>;
    put: <T>(url: string, body?: unknown, init?: RequestInit) => Promise<T>;
    delete: <T>(url: string, init?: RequestInit) => Promise<T>;

}


// ============================================================================
// API Response Wrappers
// ============================================================================

type ProfileResponse = ApiResponse<Profile>;
type PublicProfileResponse = ApiResponse<PublicProfile>;
type PaginatedProfileResponse = PaginatedResponse<Profile>;
type PaginatedPublicProfileResponse = PaginatedResponse<PublicProfile>;



// ============================================================================
// Profile API
// ============================================================================

export function CreateProfileApi(client: ApiClient) {
 const BASE_PATH = '/api/v1/profiles';
   return {
    async createProfile(payload: Partial<Profile> & { username: string }): Promise<Profile | null> {
        const response = await client.post<ProfileResponse>(`${BASE_PATH}`, payload);
        return response.data ?? null;
    },

    async getMyProfile(): Promise<Profile | null> {
        const response = await client.get<ProfileResponse>(`${BASE_PATH}/me`);
        return response.data ?? null;
    },

    async updateMyProfile(payload: Partial<Profile>): Promise<Profile | null> {
        const response = await client.put<ProfileResponse>(`${BASE_PATH}/me`, payload);
        return response.data ?? null;
    },



    
  };
}

export type ProfileApi = ReturnType<typeof CreateProfileApi>;

