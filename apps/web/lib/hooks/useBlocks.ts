/**
 * useBlocks Hook
 * Manages blocks state and CRUD operations
 */

'use client';

import { useState, useEffect } from 'react';
import { blocksApi } from '@/lib/api/blocks';
import type { Block, BlockCreation } from '@/lib/types/block';

export function useBlocks() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch blocks
  const fetchBlocks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await blocksApi.getUserBlocks();
      setBlocks(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load blocks';
      setError(errorMessage);
      console.error('Error fetching blocks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create block (optimistic)
  const createBlock = async (
    blockData: Omit<BlockCreation, 'sortOrder'>
  ): Promise<Block> => {
    const tempId = -Date.now(); // Temporary ID for optimistic update
    
    // Calculate sortOrder (last in section + 1)
    const sectionBlocks = blocks.filter((b) => b.sectionName === blockData.sectionName);
    const maxSortOrder = sectionBlocks.reduce((max, b) => Math.max(max, b.sortOrder), 0);
    const sortOrder = maxSortOrder + 1;

    const optimisticBlock: Block = {
      id: tempId,
      ...blockData,
      sortOrder,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Optimistic update
    setBlocks((prev) => [...prev, optimisticBlock]);

    try {
      const result = await blocksApi.batchUpdateBlocks({
        creations: [{ ...blockData, sortOrder }],
      });

      const createdBlock = result.created?.[0];
      if (!createdBlock) {
        throw new Error('No block returned from API');
      }

      // Replace temp block with real one
      setBlocks((prev) =>
        prev.map((block) => (block.id === tempId ? createdBlock : block))
      );

      return createdBlock;
    } catch (err: unknown) {
      // Rollback on error
      setBlocks((prev) => prev.filter((block) => block.id !== tempId));
      throw err;
    }
  };

  // Update block (optimistic)
  const updateBlock = async (
    blockId: number,
    updates: Partial<Block['data']>
  ): Promise<void> => {
    const originalBlocks = [...blocks];
    const blockToUpdate = blocks.find((b) => b.id === blockId);
    if (!blockToUpdate) {
      throw new Error('Block not found');
    }

    // Optimistic update
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === blockId
          ? {
              ...block,
              data: { ...block.data, ...updates },
              updatedAt: new Date().toISOString(),
            }
          : block
      )
    );

    try {
      await blocksApi.batchUpdateBlocks({
        updates: [
          {
            parentBlockId: blockId,
            blockTypeName: blockToUpdate.blockTypeName,
            data: updates,
            sectionName: blockToUpdate.sectionName,
            sortOrder: blockToUpdate.sortOrder,
          },
        ],
      });
    } catch (err: unknown) {
      // Rollback on error
      setBlocks(originalBlocks);
      throw err;
    }
  };

  // Delete block (optimistic)
  const deleteBlock = async (blockId: number): Promise<void> => {
    const originalBlocks = [...blocks];

    // Optimistic delete
    setBlocks((prev) => prev.filter((block) => block.id !== blockId));

    try {
      await blocksApi.batchUpdateBlocks({
        deletions: [blockId],
      });
    } catch (err: unknown) {
      // Rollback on error
      setBlocks(originalBlocks);
      throw err;
    }
  };

  // Reorder blocks within a section
  const reorderBlocks = async (
    sectionName: string,
    newOrder: number[]
  ): Promise<void> => {
    const originalBlocks = [...blocks];
    const sectionBlocks = blocks.filter((b) => b.sectionName === sectionName);

    // Optimistic reorder
    const reorderedBlocks = blocks.map((block) => {
      if (block.sectionName === sectionName) {
        const newIndex = newOrder.indexOf(block.id);
        return { ...block, sortOrder: newIndex + 1 };
      }
      return block;
    });
    setBlocks(reorderedBlocks);

    try {
      const updates = sectionBlocks.map((block) => ({
        parentBlockId: block.id,
        blockTypeName: block.blockTypeName,
        data: {},
        sectionName: block.sectionName,
        sortOrder: newOrder.indexOf(block.id) + 1,
      }));

      await blocksApi.batchUpdateBlocks({ updates });
    } catch (err: unknown) {
      // Rollback on error
      setBlocks(originalBlocks);
      throw err;
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchBlocks();
  }, []);

  return {
    blocks,
    loading,
    error,
    createBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks,
    refetch: fetchBlocks,
  };
}

