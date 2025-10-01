/**
 * useBlockTypes Hook
 * Fetches and caches block types
 */

'use client';

import { useState, useEffect } from 'react';
import { blocksApi } from '@/lib/api/blocks';
import type { BlockType } from '@/lib/types/block';

export function useBlockTypes() {
  const [blockTypes, setBlockTypes] = useState<BlockType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlockTypes = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await blocksApi.getBlockTypes();
        setBlockTypes(data);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load block types';
        setError(errorMessage);
        console.error('Error fetching block types:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlockTypes();
  }, []);

  return { blockTypes, loading, error };
}

