'use client';

/**
 * Version History Page
 * Lists every saved version of the profile's content, previews any of them,
 * and restores an earlier one. Restoring never rewrites history: it creates a
 * new version with the selected version's entries.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { VersionBlockDetail, VersionSummary } from '@monolenz/types/entities';
import { useApiClient } from '@/lib/hooks/useApiClient';
import { createProfileBlocksApi } from '@/lib/api/profile-blocks';
import { createProfileApi } from '@/lib/api/profile';
import { PageHeader } from '@/app/components/dashboard/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  BLOCK_TYPE_META,
  getBlockDates,
  getBlockSubtitle,
  getBlockTitle,
  groupBlocksByCategory,
} from '@/app/components/profile/block-display';

const PAGE_SIZE = 20;

export default function VersionHistoryPage() {
  const client = useApiClient();
  const blocksApi = useMemo(() => createProfileBlocksApi(client), [client]);
  const profileApi = useMemo(() => createProfileApi(client), [client]);

  const [versions, setVersions] = useState<VersionSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState(true);

  const [currentBlocks, setCurrentBlocks] = useState<VersionBlockDetail[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedBlocks, setSelectedBlocks] = useState<VersionBlockDetail[]>([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadInitial = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const profile = await profileApi.getMyProfile();
      if (!profile) {
        setHasProfile(false);
        return;
      }
      const [history, latest] = await Promise.all([
        blocksApi.listMyVersions(1, PAGE_SIZE),
        profileApi.getLatestVersion('me'),
      ]);
      setVersions(history.versions);
      setTotal(history.total);
      setPage(1);
      setCurrentBlocks(latest?.blocks ?? []);
      setSelectedId((prev) =>
        prev && history.versions.some((v) => v.id === prev) ? prev : (history.versions[0]?.id ?? null)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setIsLoading(false);
    }
  }, [blocksApi, profileApi]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  // Load the selected version's entries
  useEffect(() => {
    if (selectedId === null) {
      setSelectedBlocks([]);
      return;
    }
    let cancelled = false;
    setIsLoadingPreview(true);
    setPreviewError(null);
    blocksApi
      .listVersionBlocks('me', selectedId)
      .then((blocks) => {
        if (!cancelled) setSelectedBlocks(blocks);
      })
      .catch((err) => {
        if (!cancelled) setPreviewError(err instanceof Error ? err.message : 'Failed to load this version');
      })
      .finally(() => {
        if (!cancelled) setIsLoadingPreview(false);
      });
    return () => {
      cancelled = true;
    };
  }, [blocksApi, selectedId]);

  async function handleLoadMore() {
    setIsLoadingMore(true);
    try {
      const next = page + 1;
      const history = await blocksApi.listMyVersions(next, PAGE_SIZE);
      setVersions((prev) => {
        const seen = new Set(prev.map((v) => v.id));
        return [...prev, ...history.versions.filter((v) => !seen.has(v.id))];
      });
      setTotal(history.total);
      setPage(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more versions');
    } finally {
      setIsLoadingMore(false);
    }
  }

  async function handleRestore() {
    if (selectedId === null) return;
    setIsRestoring(true);
    setRestoreError(null);
    try {
      const restoredFrom = selectedId;
      const result = await blocksApi.restoreVersion(restoredFrom);
      setConfirmOpen(false);
      setSelectedId(result.versionId);
      await loadInitial();
      setNotice(`Restored version #${restoredFrom}. Your public profile now shows these entries.`);
    } catch (err) {
      setRestoreError(err instanceof Error ? err.message : 'Failed to restore version');
    } finally {
      setIsRestoring(false);
    }
  }

  const selectedVersion = versions.find((v) => v.id === selectedId) ?? null;
  const changes = useMemo(() => compareWithCurrent(selectedBlocks, currentBlocks), [selectedBlocks, currentBlocks]);

  if (isLoading) {
    return (
      <div className='flex flex-col items-center justify-center h-full gap-4'>
        <div className='relative size-10'>
          <div className='absolute inset-0 rounded-full border-2 border-muted' />
          <div className='absolute inset-0 rounded-full border-2 border-t-primary animate-spin' />
        </div>
        <p className='text-muted-foreground text-sm'>Loading history...</p>
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <EmptyState
        title='No profile yet'
        description='Create your profile first. Every time you save, a version appears here.'
        href='/dashboard/profile'
        cta='Create Profile'
      />
    );
  }

  if (error && versions.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center h-full text-center gap-3 p-8'>
        <h2 className='text-lg font-semibold'>Something went wrong</h2>
        <p className='text-muted-foreground text-sm max-w-sm'>{error}</p>
        <Button variant='outline' size='sm' onClick={loadInitial}>
          Try again
        </Button>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <EmptyState
        title='No saved versions yet'
        description='Each time you save your content, Monolenz keeps a snapshot. Save once and it shows up here.'
        href='/dashboard/profile/edit'
        cta='Add Your Content'
      />
    );
  }

  return (
    <div className='flex flex-col h-full'>
      <PageHeader
        title='History'
        description={`${total} saved ${total === 1 ? 'version' : 'versions'}. Preview any of them or restore an earlier one.`}
      />

      {notice && (
        <div className='mx-6 md:mx-8 mt-4 px-3 py-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 text-sm flex items-center justify-between gap-3'>
          <span>{notice}</span>
          <button type='button' className='text-xs underline' onClick={() => setNotice(null)}>
            Dismiss
          </button>
        </div>
      )}

      <div className='flex-1 min-h-0 flex flex-col md:flex-row'>
        {/* Version list */}
        <aside className='md:w-80 shrink-0 border-b md:border-b-0 md:border-r overflow-y-auto max-h-64 md:max-h-none'>
          <ol className='p-3 space-y-1'>
            {versions.map((version) => (
              <li key={version.id}>
                <button
                  type='button'
                  onClick={() => {
                    setSelectedId(version.id);
                    setNotice(null);
                  }}
                  className={cn(
                    'w-full text-left px-3 py-2.5 rounded-lg transition-colors',
                    version.id === selectedId ? 'bg-primary/10 text-foreground' : 'hover:bg-accent text-foreground'
                  )}
                >
                  <div className='flex items-center justify-between gap-2'>
                    <span className='text-sm font-medium truncate'>{version.name || `Version #${version.id}`}</span>
                    {version.is_current && (
                      <Badge variant='secondary' className='text-[10px] shrink-0'>
                        Current
                      </Badge>
                    )}
                  </div>
                  <div className='text-xs text-muted-foreground mt-0.5'>
                    {formatTimestamp(version.created_at)} · {version.block_count}{' '}
                    {version.block_count === 1 ? 'entry' : 'entries'}
                  </div>
                </button>
              </li>
            ))}
          </ol>
          {versions.length < total && (
            <div className='px-3 pb-4'>
              <Button variant='ghost' size='sm' className='w-full' onClick={handleLoadMore} disabled={isLoadingMore}>
                {isLoadingMore ? 'Loading...' : 'Load older versions'}
              </Button>
            </div>
          )}
        </aside>

        {/* Preview */}
        <section className='flex-1 min-w-0 overflow-y-auto'>
          {selectedVersion && (
            <div className='max-w-4xl mx-auto px-6 lg:px-8 py-6'>
              <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6'>
                <div>
                  <h2 className='text-lg font-semibold'>{selectedVersion.name || `Version #${selectedVersion.id}`}</h2>
                  <p className='text-sm text-muted-foreground mt-0.5'>
                    Saved {formatTimestamp(selectedVersion.created_at)}
                  </p>
                </div>
                {selectedVersion.is_current ? (
                  <Badge variant='outline' className='self-start'>
                    This is what your profile shows now
                  </Badge>
                ) : (
                  <Button
                    onClick={() => {
                      setRestoreError(null);
                      setConfirmOpen(true);
                    }}
                    disabled={isLoadingPreview || Boolean(previewError)}
                  >
                    Restore this version
                  </Button>
                )}
              </div>

              {!selectedVersion.is_current && !isLoadingPreview && !previewError && <ChangeSummary changes={changes} />}

              {isLoadingPreview ? (
                <p className='text-sm text-muted-foreground py-10 text-center'>Loading entries...</p>
              ) : previewError ? (
                <p className='text-sm text-destructive py-10 text-center'>{previewError}</p>
              ) : selectedBlocks.length === 0 ? (
                <p className='text-sm text-muted-foreground py-10 text-center'>This version has no entries.</p>
              ) : (
                <EntriesByCategory blocks={selectedBlocks} />
              )}
            </div>
          )}
        </section>
      </div>

      <Dialog open={confirmOpen} onOpenChange={(open) => !isRestoring && setConfirmOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore version #{selectedId}?</DialogTitle>
            <DialogDescription>
              Your profile will show this version&apos;s entries. A new version is saved, so your current content stays
              in history and you can switch back at any time.
            </DialogDescription>
          </DialogHeader>
          <ChangeSummary changes={changes} compact />
          {restoreError && (
            <div className='px-3 py-2.5 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-sm'>
              {restoreError}
            </div>
          )}
          <DialogFooter>
            <Button variant='outline' onClick={() => setConfirmOpen(false)} disabled={isRestoring}>
              Cancel
            </Button>
            <Button onClick={handleRestore} disabled={isRestoring}>
              {isRestoring ? 'Restoring...' : 'Restore'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================================
// Comparison
// ============================================================================

interface VersionChanges {
  /** Entries in the selected version that the current profile doesn't have */
  broughtBack: VersionBlockDetail[];
  /** Entries on the current profile that the selected version doesn't have */
  removed: VersionBlockDetail[];
  /** Same entry, different public/hidden state */
  visibilityChanged: VersionBlockDetail[];
}

function compareWithCurrent(selected: VersionBlockDetail[], current: VersionBlockDetail[]): VersionChanges {
  const currentById = new Map(current.map((b) => [b.id, b]));
  const selectedIds = new Set(selected.map((b) => b.id));

  const broughtBack: VersionBlockDetail[] = [];
  const visibilityChanged: VersionBlockDetail[] = [];
  for (const block of selected) {
    const match = currentById.get(block.id);
    if (!match) broughtBack.push(block);
    else if ((match.is_visible ?? true) !== (block.is_visible ?? true)) visibilityChanged.push(block);
  }
  const removed = current.filter((b) => !selectedIds.has(b.id));

  return { broughtBack, removed, visibilityChanged };
}

function ChangeSummary({ changes, compact }: { changes: VersionChanges; compact?: boolean }) {
  const { broughtBack, removed, visibilityChanged } = changes;
  const nothing = broughtBack.length === 0 && removed.length === 0 && visibilityChanged.length === 0;

  return (
    <div className={cn('rounded-xl border bg-muted/30 p-4 text-sm', !compact && 'mb-6')}>
      <p className='font-medium mb-2'>Compared with your current profile</p>
      {nothing ? (
        <p className='text-muted-foreground'>Same entries as your current profile (order may differ).</p>
      ) : (
        <ul className='space-y-2'>
          {broughtBack.length > 0 && (
            <ChangeLine tone='add' label='Brought back' blocks={broughtBack} compact={compact} />
          )}
          {removed.length > 0 && <ChangeLine tone='remove' label='Removed' blocks={removed} compact={compact} />}
          {visibilityChanged.length > 0 && (
            <ChangeLine tone='neutral' label='Visibility changes' blocks={visibilityChanged} compact={compact} />
          )}
        </ul>
      )}
    </div>
  );
}

function ChangeLine({
  tone,
  label,
  blocks,
  compact,
}: {
  tone: 'add' | 'remove' | 'neutral';
  label: string;
  blocks: VersionBlockDetail[];
  compact?: boolean;
}) {
  const shown = compact ? blocks.slice(0, 3) : blocks.slice(0, 6);
  const rest = blocks.length - shown.length;
  return (
    <li>
      <span
        className={cn(
          'font-medium',
          tone === 'add' && 'text-emerald-700 dark:text-emerald-400',
          tone === 'remove' && 'text-destructive',
          tone === 'neutral' && 'text-foreground'
        )}
      >
        {label} ({blocks.length}):
      </span>{' '}
      <span className='text-muted-foreground'>
        {shown.map((b) => getBlockTitle(b)).join(', ')}
        {rest > 0 && `, and ${rest} more`}
      </span>
    </li>
  );
}

// ============================================================================
// Entries preview
// ============================================================================

function EntriesByCategory({ blocks }: { blocks: VersionBlockDetail[] }) {
  const byCategory = groupBlocksByCategory(blocks);
  return (
    <div className='space-y-8'>
      {Array.from(byCategory.entries()).map(([category, categoryBlocks]) => (
        <section key={category}>
          <div className='flex items-center gap-2 mb-3 pb-2 border-b'>
            <h3 className='text-xs font-semibold uppercase tracking-wider'>{category}</h3>
            <Badge variant='secondary' className='text-[10px]'>
              {categoryBlocks.length}
            </Badge>
          </div>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
            {categoryBlocks.map((block) => {
              const subtitle = getBlockSubtitle(block);
              const dates = getBlockDates(block);
              return (
                <article
                  key={block.id}
                  className={cn(
                    'bg-card border rounded-xl p-4 border-l-[3px]',
                    BLOCK_TYPE_META[block.block_type as string]?.accent ?? 'border-l-muted'
                  )}
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div className='min-w-0'>
                      <h4 className='font-semibold text-sm truncate'>{getBlockTitle(block)}</h4>
                      {subtitle && <p className='text-sm text-muted-foreground mt-0.5 truncate'>{subtitle}</p>}
                    </div>
                    {block.is_visible === false && (
                      <Badge variant='outline' className='text-[10px] shrink-0'>
                        Hidden
                      </Badge>
                    )}
                  </div>
                  {dates && <p className='text-xs text-muted-foreground mt-2'>{dates}</p>}
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

// ============================================================================
// Misc
// ============================================================================

function EmptyState({
  title,
  description,
  href,
  cta,
}: {
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <div className='flex flex-col items-center justify-center h-full text-center gap-3 p-8'>
      <h2 className='text-lg font-semibold'>{title}</h2>
      <p className='text-muted-foreground text-sm max-w-sm'>{description}</p>
      <Button asChild className='mt-2'>
        <Link href={href}>{cta}</Link>
      </Button>
    </div>
  );
}

function formatTimestamp(value?: string | null): string {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
