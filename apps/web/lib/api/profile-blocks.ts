/**
 * Profile Blocks API Client
 * Handles all block-related API calls
 */

import type { ApiClient } from './common';
import type {
  BlockType,
  BlockProperty,
  VersionBlockDetail,
  BatchUpdatePayload,
  BatchUpdateResponse,
} from '@monolenz/types/entities';
import type { ApiResponse } from '@monolenz/types/api';

// ============================================================================
// API Response Wrappers
// ============================================================================

type BlockTypesResponse = ApiResponse<BlockType[]>;
type BlockPropertiesResponse = ApiResponse<BlockProperty[]>;
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
     */
    async listBlockTypes(): Promise<BlockType[]> {
      const response = await client.get<BlockTypesResponse>(`${BASE_PATH}/block-types`);
      return response.data ?? [];
    },

    /**
     * Get properties for a specific block type
     */
    async getBlockTypeProperties(blockTypeId: number): Promise<BlockProperty[]> {
      const response = await client.get<BlockPropertiesResponse>(`${BASE_PATH}/block-types/${blockTypeId}/properties`);
      return response.data ?? [];
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

    // ========================================================================
    // Convenience Methods
    // ========================================================================

    /**
     * Get block type with its properties in one call
     */
    async getBlockTypeWithProperties(
      blockTypeId: number
    ): Promise<{ type: BlockType; properties: BlockProperty[] } | null> {
      const [types, properties] = await Promise.all([this.listBlockTypes(), this.getBlockTypeProperties(blockTypeId)]);

      const type = types.find((t) => t.id === blockTypeId);
      if (!type) return null;

      return { type, properties };
    },

    /**
     * Get all block types with their properties
     * Useful for pre-loading the entire catalog
     */
    async getFullCatalog(): Promise<Map<number, { type: BlockType; properties: BlockProperty[] }>> {
      const types = await this.listBlockTypes();
      const catalog = new Map<number, { type: BlockType; properties: BlockProperty[] }>();

      // Fetch properties in parallel
      const propertiesPromises = types.map((type) =>
        this.getBlockTypeProperties(type.id).then((properties) => ({
          typeId: type.id,
          properties,
        }))
      );

      const allProperties = await Promise.all(propertiesPromises);

      for (const type of types) {
        const propsResult = allProperties.find((p) => p.typeId === type.id);
        catalog.set(type.id, {
          type,
          properties: propsResult?.properties ?? [],
        });
      }

      return catalog;
    },
  };
}

export type ProfileBlocksApi = ReturnType<typeof createProfileBlocksApi>;
