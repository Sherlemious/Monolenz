/**
 * useBlockSchema Hook
 * Fetches and caches block schema for a specific type
 */

'use client';

import { useState, useEffect } from 'react';
import { blocksApi } from '@/lib/api/blocks';
import type { BlockSchema } from '@/lib/types/block';

export function useBlockSchema(blockTypeName: string | null) {
  const [schema, setSchema] = useState<BlockSchema | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!blockTypeName) {
      setSchema(null);
      return;
    }

    const fetchSchema = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await blocksApi.getBlockSchema(blockTypeName);
        setSchema(data);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load schema';
        setError(errorMessage);
        console.error('Error fetching schema:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchema();
  }, [blockTypeName]);

  return { schema, loading, error };
}

