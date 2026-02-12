/**
 * Profile Blocks API Client
 * Handles all block-related API calls
 */

import type { BlockType, VersionBlockDetail, BatchUpdatePayload, BatchUpdateResponse } from '@monolenz/types/entities';
import type { ApiResponse } from '@monolenz/types/api';
import type { ApiClient } from './common';
export type { ApiClient };

// ============================================================================
// API Response Wrappers
// ============================================================================

type VersionBlocksResponse = ApiResponse<VersionBlockDetail[]>;
type BatchUpdateApiResponse = ApiResponse<BatchUpdateResponse>;

// ============================================================================
// Profile Blocks API
// ============================================================================

export function createProfileBlocksApi(client: ApiClient) {
  const BASE_PATH = '/api/v1/profiles';

  return {
    // ========================================================================
    // Block Type Catalog
    // ========================================================================

    /**
     * List all active block types
     * In the new system, BlockType is an enum with predefined values
     */
    async listBlockTypes(): Promise<BlockType[]> {
      // Return all available block types from the enum
      // In a real implementation, this might fetch from an endpoint
      return [
        'work_experience' as BlockType,
        'education' as BlockType,
        'skill' as BlockType,
        'project' as BlockType,
        'certification' as BlockType,
        'language' as BlockType,
        'volunteer' as BlockType,
        'award' as BlockType,
      ];
    },

    // ========================================================================
    // Version Blocks
    // ========================================================================

    /**
     * List blocks for a specific version (public endpoint)
     * @param identifier - Profile username or UUID
     * @param versionId - Version ID
     * @param section - Optional section filter
     */
    async listVersionBlocks(identifier: string, versionId: number, section?: string): Promise<VersionBlockDetail[]> {
      const params = new URLSearchParams();
      if (section) params.set('section', section);
      const query = params.toString();
      const url = `${BASE_PATH}/${identifier}/versions/${versionId}/blocks${query ? `?${query}` : ''}`;
      const response = await client.get<VersionBlocksResponse>(url);
      return response.data ?? [];
    },

    // ========================================================================
    // Batch Operations (requires auth)
    // ========================================================================

    /**
     * Apply batch update to create a new version
     * Creates/updates/deletes blocks atomically
     */
    async applyBatchUpdate(payload: BatchUpdatePayload): Promise<BatchUpdateResponse> {
      const response = await client.post<BatchUpdateApiResponse>(`${BASE_PATH}/me/versions`, payload);
      if (!response.data) {
        throw new Error('Failed to apply batch update: no data returned');
      }
      return response.data;
    },
  };
}

export type ProfileBlocksApi = ReturnType<typeof createProfileBlocksApi>;
