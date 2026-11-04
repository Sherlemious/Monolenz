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
import { CheckCircle2, History, RotateCcw } from 'lucide-react';
import { formatRelative, getBlockTitle } from '@/app/components/profile/block-display';
import { ProfileSections } from '@/app/components/profile/ProfileDocument';

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
      setNotice(`Restored #${restoredFrom}. Your public page now shows these entries.`);
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
        description={`Every save is kept. ${total} ${total === 1 ? 'version' : 'versions'} so far. Restoring one never deletes the others.`}
      />

      {notice && (
        <div
          role='status'
          className='mx-6 md:mx-10 mb-4 px-3.5 py-2.5 rounded-lg border border-success-border bg-success-soft text-foreground text-[13px] flex items-center justify-between gap-3'
        >
          <span className='flex items-center gap-2'>
            <CheckCircle2 className='size-4 text-success shrink-0' />
            {notice}
          </span>
          <button
            type='button'
            className='text-xs text-muted-foreground hover:text-foreground'
            onClick={() => setNotice(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      <div className='flex-1 min-h-0 flex flex-col md:flex-row border-t'>
        {/* Version timeline */}
        <aside className='md:w-72 shrink-0 border-b md:border-b-0 md:border-r overflow-y-auto max-h-64 md:max-h-none'>
          <ol className='relative py-3'>
            <span className='absolute left-[31px] top-6 bottom-6 w-px bg-border' aria-hidden />
            {versions.map((version) => {
              const selected = version.id === selectedId;
              return (
                <li key={version.id} className='relative px-3'>
                  <button
                    type='button'
                    aria-current={selected ? 'true' : undefined}
                    onClick={() => {
                      setSelectedId(version.id);
                      setNotice(null);
                    }}
                    className={cn(
                      'w-full flex items-start gap-3 text-left px-2.5 py-2.5 rounded-lg transition-colors',
                      selected ? 'bg-secondary' : 'hover:bg-secondary/60'
                    )}
                  >
                    <span
                      className={cn(
                        'relative z-10 mt-[3px] size-[13px] rounded-full border-2 shrink-0 transition-colors',
                        version.is_current
                          ? 'border-brand bg-brand'
                          : selected
                            ? 'border-foreground bg-card'
                            : 'border-border-strong bg-card'
                      )}
                      aria-hidden
                    />
                    <span className='min-w-0 flex-1'>
                      <span className='flex items-center justify-between gap-2'>
                        <span className={cn('text-[13px] truncate', selected ? 'font-semibold' : 'font-medium')}>
                          {version.name || 'Saved changes'}
                        </span>
                        {version.is_current && <Badge variant='accent'>Live</Badge>}
                      </span>
                      <span className='block text-[12px] text-muted-foreground mt-0.5'>
                        {formatRelative(version.created_at)} · {version.block_count}{' '}
                        {version.block_count === 1 ? 'entry' : 'entries'}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
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
        <section className='flex-1 min-w-0 overflow-y-auto bg-bg-sunken/40'>
          {selectedVersion && (
            <div className='max-w-4xl mx-auto px-6 lg:px-10 py-8'>
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5'>
                <div>
                  <h2 className='text-[17px] font-semibold tracking-tight'>
                    {selectedVersion.name || 'Saved changes'}
                    <span className='ml-2 font-mono text-[12px] font-normal text-muted-foreground'>
                      #{selectedVersion.id}
                    </span>
                  </h2>
                  <p className='text-[13px] text-muted-foreground mt-0.5'>
                    {formatTimestamp(selectedVersion.created_at)}
                  </p>
                </div>
                {selectedVersion.is_current ? (
                  <p className='text-[13px] text-muted-foreground flex items-center gap-2'>
                    <span className='size-2 rounded-full bg-brand' aria-hidden />
                    Live on your public page
                  </p>
                ) : (
                  <Button
                    onClick={() => {
                      setRestoreError(null);
                      setConfirmOpen(true);
                    }}
                    disabled={isLoadingPreview || Boolean(previewError)}
                  >
                    <RotateCcw className='size-3.5' />
                    Restore this version
                  </Button>
                )}
              </div>

              {!selectedVersion.is_current && !isLoadingPreview && !previewError && <ChangeSummary changes={changes} />}

              <div className='rounded-xl border bg-card px-6 sm:px-10 py-8'>
                {isLoadingPreview ? (
                  <div className='space-y-3 py-4' aria-label='Loading entries'>
                    <div className='h-3 w-24 rounded bg-secondary animate-pulse' />
                    <div className='h-4 w-2/3 rounded bg-secondary animate-pulse' />
                    <div className='h-4 w-1/2 rounded bg-secondary animate-pulse' />
                  </div>
                ) : previewError ? (
                  <p className='text-sm text-destructive py-10 text-center'>{previewError}</p>
                ) : (
                  <ProfileSections blocks={selectedBlocks} showHidden emptyMessage='This version has no entries.' />
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      <Dialog open={confirmOpen} onOpenChange={(open) => !isRestoring && setConfirmOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore this version?</DialogTitle>
            <DialogDescription>
              Your public page will show these entries. This is saved as a new version, so what you have now stays in
              history and you can switch back any time.
            </DialogDescription>
          </DialogHeader>
          <ChangeSummary changes={changes} compact />
          {restoreError && (
            <div className='px-3 py-2.5 rounded-lg border border-danger-border bg-danger-soft text-destructive text-sm'>
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
    <div className={cn('rounded-xl border bg-card p-4 text-[13px]', !compact && 'mb-4')}>
      <p className='text-[12px] font-medium text-muted-foreground mb-2'>Compared with what is live now</p>
      {nothing ? (
        <p className='text-muted-foreground'>Same entries as your live profile (order may differ).</p>
      ) : (
        <ul className='space-y-1.5'>
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
    <li className='flex gap-2'>
      <span
        className={cn(
          'mt-[3px] flex size-4 shrink-0 items-center justify-center rounded-full text-[11px] font-bold leading-none',
          tone === 'add' && 'bg-success-soft text-success',
          tone === 'remove' && 'bg-danger-soft text-danger',
          tone === 'neutral' && 'bg-secondary text-muted-foreground'
        )}
        aria-hidden
      >
        {tone === 'add' ? '+' : tone === 'remove' ? '\u2212' : '~'}
      </span>
      <span>
        <span className='font-medium text-foreground'>
          {label} ({blocks.length}):
        </span>{' '}
        <span className='text-muted-foreground'>
          {shown.map((b) => getBlockTitle(b)).join(', ')}
          {rest > 0 && `, and ${rest} more`}
        </span>
      </span>
    </li>
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
      <History className='size-6 text-muted-foreground mb-1' />
      <h2 className='font-serif text-3xl'>{title}</h2>
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
