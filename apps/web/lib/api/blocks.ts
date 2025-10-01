/**
 * Blocks API Client
 */

import { createBrowserApiClient } from './client';
import type {
  BlockType,
  BlockSchema,
  Block,
  BlockBatchRequest,
  BlockBatchResponse,
} from '@/lib/types/block';

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

export const blocksApi = {
  /**
   * Get all available block types
   */
  getBlockTypes: async (): Promise<BlockType[]> => {
    const client = createBrowserApiClient();
    const response = await client.get<ApiResponse<BlockType[]>>(
      '/api/v1/profiles/block-types'
    );
    return response.data;
  },

  /**
   * Get schema for a specific block type
   */
  getBlockSchema: async (blockTypeName: string): Promise<BlockSchema> => {
    const client = createBrowserApiClient();
    const response = await client.get<ApiResponse<BlockSchema>>(
      `/api/v1/profiles/block-types/${blockTypeName}/properties`
    );
    return response.data;
  },

  /**
   * Get all blocks for current user
   */
  getUserBlocks: async (): Promise<Block[]> => {
    const client = createBrowserApiClient();
    const response = await client.get<ApiResponse<Block[]>>(
      '/api/v1/profiles/me/blocks'
    );
    return response.data;
  },

  /**
   * Batch create/update/delete blocks
   */
  batchUpdateBlocks: async (request: BlockBatchRequest): Promise<BlockBatchResponse> => {
    const client = createBrowserApiClient();
    const response = await client.post<ApiResponse<BlockBatchResponse>, BlockBatchRequest>(
      '/api/v1/profiles/blocks',
      request
    );
    return response.data;
  },
};

