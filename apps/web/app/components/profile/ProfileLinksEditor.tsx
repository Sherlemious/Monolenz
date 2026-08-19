'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Reorder } from 'framer-motion';
import { GripVertical, Plus, Trash2, Globe, ExternalLink } from 'lucide-react';
import type { ProfileApi, ProfileLink, LinkPlatform, SyncLinkPayload } from '@/lib/api/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ============================================================================
// Types
// ============================================================================

interface DraftLink {
  _key: string; // local key for React / Reorder
  id?: number;
  platform_id: number | null;
  url: string;
  label: string;
  is_public: boolean;
}

interface ProfileLinksEditorProps {
  api: ProfileApi;
  onDirtyChange?: (dirty: boolean) => void;
}

// ============================================================================
// Helpers
// ============================================================================

let _keyCounter = 0;
function newKey() {
  return `draft-${++_keyCounter}`;
}

function toDraft(link: ProfileLink): DraftLink {
  return {
    _key: `server-${link.id}`,
    id: link.id,
    platform_id: link.platform_id ?? null,
    url: link.url,
    label: link.label ?? link.link_platforms?.display_name ?? '',
    is_public: link.is_public ?? true,
  };
}

function toPayload(draft: DraftLink, index: number): SyncLinkPayload {
  return {
    ...(draft.id != null ? { id: draft.id } : {}),
    platform_id: draft.platform_id,
    url: draft.url,
    label: draft.label || null,
    is_public: draft.is_public,
    sort_order: index,
  };
}

function isDirty(drafts: DraftLink[], original: DraftLink[]): boolean {
  if (drafts.length !== original.length) return true;
  return drafts.some((d, i) => {
    const o = original[i]!;
    return (
      d.id !== o.id ||
      d.platform_id !== o.platform_id ||
      d.url !== o.url ||
      d.label !== o.label ||
      d.is_public !== o.is_public
    );
  });
}

function hasExplicitProtocol(value: string): boolean {
  return /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(value);
}

function toOrigin(value: string): string | null {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function getPrimaryPathPrefix(platformName?: string): string {
  switch (platformName) {
    case 'linkedin':
      return 'in/';
    case 'tiktok':
    case 'youtube':
    case 'medium':
      return '@';
    default:
      return '';
  }
}

function buildPrimaryPlatformPath(value: string, platformName?: string): string {
  const cleaned = value.replace(/^\/+|\/+$/g, '');
  const bare = cleaned.replace(/^@/, '');

  if (!cleaned) {
    return cleaned;
  }

  if (cleaned.includes('/')) {
    return cleaned;
  }

  switch (platformName) {
    case 'linkedin':
      return `in/${bare}`;
    case 'tiktok':
    case 'youtube':
    case 'medium':
      return `@${bare}`;
    default:
      return cleaned;
  }
}

function getInputPrefix(platform?: LinkPlatform | null): string | null {
  if (!platform?.base_url) {
    return null;
  }

  const origin = toOrigin(platform.base_url);
  if (!origin) {
    return null;
  }

  return `${origin}/${getPrimaryPathPrefix(platform.name)}`;
}

function getDisplayUrlInput(value: string, platform?: LinkPlatform | null): string {
  const trimmed = value.trim();
  if (!trimmed || !platform?.base_url) {
    return trimmed;
  }

  const platformOrigin = toOrigin(platform.base_url);
  if (!platformOrigin) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.origin !== platformOrigin) {
      return trimmed;
    }
    const path = `${parsed.pathname}${parsed.search}${parsed.hash}`.replace(/^\/+/, '');
    const primaryPrefix = getPrimaryPathPrefix(platform.name);

    if (primaryPrefix && path.startsWith(primaryPrefix)) {
      return path.slice(primaryPrefix.length);
    }

    return path;
  } catch {
    return trimmed;
  }
}

function normalizeDraftLinkValue(rawValue: string, platform?: LinkPlatform | null): string {
  const value = rawValue.trim();
  if (!value) {
    return value;
  }

  if (hasExplicitProtocol(value)) {
    return value;
  }

  if ((platform?.name === 'email' || !platform?.base_url) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return `mailto:${value}`;
  }

  if (platform?.base_url) {
    const platformOrigin = toOrigin(platform.base_url);
    if (!platformOrigin) {
      return value;
    }

    const candidate = value.startsWith('/')
      ? `${platformOrigin}${value}`
      : value.includes('.') || value.startsWith('www.')
        ? `https://${value.replace(/^\/+/, '')}`
        : null;

    if (candidate) {
      try {
        const parsed = new URL(candidate);
        if (parsed.origin === platformOrigin) {
          const path = `${parsed.pathname}${parsed.search}${parsed.hash}`.replace(/^\/+/, '');
          return path ? `${platformOrigin}/${path}` : platformOrigin;
        }
        return parsed.toString();
      } catch {
        // Fall through to handle-based normalization.
      }
    }

    const normalizedPath = buildPrimaryPlatformPath(value, platform.name);
    return `${platformOrigin}/${normalizedPath}`;
  }

  return `https://${value.replace(/^\/+/, '')}`;
}

// ============================================================================
// Component
// ============================================================================

export function ProfileLinksEditor({ api, onDirtyChange }: ProfileLinksEditorProps) {
  const allowedProtocols = useMemo(() => new Set(['http:', 'https:', 'mailto:']), []);
  const [platforms, setPlatforms] = useState<LinkPlatform[]>([]);
  const [drafts, setDrafts] = useState<DraftLink[]>([]);
  const [original, setOriginal] = useState<DraftLink[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load data
  useEffect(() => {
    async function load() {
      try {
        const [links, plats] = await Promise.all([api.getMyLinks(), api.listPlatforms()]);
        const loaded = links.map(toDraft);
        setDrafts(loaded);
        setOriginal(loaded);
        setPlatforms(plats);
      } catch {
        toast.error('Failed to load links');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [api]);

  // Dirty tracking
  useEffect(() => {
    onDirtyChange?.(isDirty(drafts, original));
  }, [drafts, original, onDirtyChange]);

  const platformById = useMemo(() => new Map(platforms.map((p) => [p.id, p])), [platforms]);

  // Group platforms by category for the "Add Link" dropdown
  const platformsByCategory = useMemo(() => {
    const map = new Map<string, LinkPlatform[]>();
    for (const p of platforms) {
      const cat = p.category ?? 'other';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(p);
    }
    return map;
  }, [platforms]);

  const validate = useCallback(
    (ds: DraftLink[]) => {
      const errs: Record<string, string> = {};
      for (const d of ds) {
        const platform = d.platform_id != null ? platformById.get(d.platform_id) : null;
        const value = normalizeDraftLinkValue(d.url, platform).trim();
        if (!value) {
          errs[d._key] = 'URL is required';
          continue;
        }
        try {
          const parsed = new URL(value);
          if (!allowedProtocols.has(parsed.protocol)) {
            errs[d._key] = 'URL must use http, https, or mailto';
          }
        } catch {
          errs[d._key] = 'Invalid URL';
        }
      }
      return errs;
    },
    [allowedProtocols, platformById]
  );

  const handleSave = useCallback(async () => {
    const errs = validate(drafts);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setIsSaving(true);
    try {
      const normalized = drafts.map((draft) => {
        const platform = draft.platform_id != null ? platformById.get(draft.platform_id) : null;
        return {
          ...draft,
          url: normalizeDraftLinkValue(draft.url, platform),
        };
      });

      const payload = normalized.map((d, i) => toPayload(d, i));
      const saved = await api.syncLinks(payload);
      const loaded = saved.map(toDraft);
      setDrafts(loaded);
      setOriginal(loaded);
      toast.success('Links saved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save links');
    } finally {
      setIsSaving(false);
    }
  }, [drafts, api, validate, platformById]);

  const handleAddLink = useCallback((platform: LinkPlatform) => {
    setDrafts((prev) => [
      ...prev,
      {
        _key: newKey(),
        platform_id: platform.id,
        url: '',
        label: platform.display_name,
        is_public: true,
      },
    ]);
  }, []);

  const handleAddCustomLink = useCallback(() => {
    setDrafts((prev) => [...prev, { _key: newKey(), platform_id: null, url: '', label: '', is_public: true }]);
  }, []);

  const handleRemove = useCallback((key: string) => {
    setDrafts((prev) => prev.filter((d) => d._key !== key));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const handleFieldChange = useCallback(<K extends keyof DraftLink>(key: string, field: K, value: DraftLink[K]) => {
    setDrafts((prev) => prev.map((d) => (d._key === key ? { ...d, [field]: value } : d)));
    if (field === 'url') {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }, []);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-40'>
        <div className='animate-spin rounded-full size-6 border-2 border-muted border-t-primary' />
      </div>
    );
  }

  return (
    <div className='p-6 md:p-8 max-w-2xl space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-base font-semibold'>Profile Links</h2>
          <p className='text-sm text-muted-foreground mt-0.5'>Add links to your social profiles and websites.</p>
        </div>
        <Button size='sm' onClick={handleSave} disabled={isSaving || !isDirty(drafts, original)}>
          {isSaving ? 'Saving...' : 'Save Links'}
        </Button>
      </div>

      {/* Links list */}
      {drafts.length > 0 && (
        <Reorder.Group axis='y' values={drafts} onReorder={setDrafts} className='space-y-3'>
          {drafts.map((draft) => {
            const platform = draft.platform_id != null ? platformById.get(draft.platform_id) : null;
            const error = errors[draft._key];
            const displayUrl = getDisplayUrlInput(draft.url, platform);
            const inputPrefix = getInputPrefix(platform);
            const previewUrl = normalizeDraftLinkValue(draft.url, platform);

            return (
              <Reorder.Item key={draft._key} value={draft} className='list-none'>
                <div
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-xl border bg-card',
                    error && 'border-destructive/40'
                  )}
                >
                  {/* Drag handle */}
                  <button
                    type='button'
                    className='mt-2.5 cursor-grab text-muted-foreground/40 hover:text-muted-foreground transition-colors shrink-0'
                  >
                    <GripVertical className='size-4' />
                  </button>

                  <div className='flex-1 space-y-2 min-w-0'>
                    {/* Platform badge + label */}
                    <div className='flex items-center gap-2'>
                      <div className='size-6 rounded-md bg-muted flex items-center justify-center shrink-0'>
                        {platform ? (
                          <span className='text-[9px] font-bold text-muted-foreground uppercase tracking-tight'>
                            {platform.icon?.slice(0, 2) ?? platform.display_name.slice(0, 2)}
                          </span>
                        ) : (
                          <Globe className='size-3 text-muted-foreground' />
                        )}
                      </div>
                      <Input
                        value={draft.label}
                        onChange={(e) => handleFieldChange(draft._key, 'label', e.target.value)}
                        placeholder={platform?.display_name ?? 'Label'}
                        className='h-7 text-xs font-medium border-0 bg-transparent px-1 shadow-none focus-visible:ring-0 focus-visible:bg-muted/50 rounded'
                      />
                      {/* Public toggle */}
                      <button
                        type='button'
                        onClick={() => handleFieldChange(draft._key, 'is_public', !draft.is_public)}
                        className={cn(
                          'shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full border transition-colors',
                          draft.is_public
                            ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-400'
                            : 'bg-muted text-muted-foreground border-border'
                        )}
                        title={draft.is_public ? 'Visible on public profile' : 'Hidden from public profile'}
                      >
                        {draft.is_public ? 'Public' : 'Private'}
                      </button>
                    </div>

                    {/* URL input */}
                    <div className='relative'>
                      {inputPrefix ? (
                        <div
                          className={cn(
                            'h-8 rounded-md border bg-background px-2 text-sm flex items-center gap-1',
                            error && 'border-destructive'
                          )}
                        >
                          <span className='shrink-0 text-xs text-muted-foreground'>{inputPrefix}</span>
                          <input
                            value={displayUrl}
                            onChange={(e) => handleFieldChange(draft._key, 'url', e.target.value)}
                            placeholder='username or paste full link'
                            className='w-full bg-transparent outline-none border-0 text-sm'
                          />
                        </div>
                      ) : (
                        <Input
                          value={displayUrl}
                          onChange={(e) => handleFieldChange(draft._key, 'url', e.target.value)}
                          placeholder='username, domain, or full URL'
                          className={cn('h-8 text-sm pr-7', error && 'border-destructive')}
                          type='text'
                        />
                      )}
                      {draft.url && !error && (
                        <a
                          href={previewUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground'
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className='size-3.5' />
                        </a>
                      )}
                    </div>
                    {error && <p className='text-xs text-destructive'>{error}</p>}
                  </div>

                  {/* Remove */}
                  <button
                    type='button'
                    onClick={() => handleRemove(draft._key)}
                    className='mt-2 text-muted-foreground/40 hover:text-destructive transition-colors shrink-0'
                  >
                    <Trash2 className='size-4' />
                  </button>
                </div>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
      )}

      {/* Empty state */}
      {drafts.length === 0 && (
        <div className='flex flex-col items-center justify-center py-10 text-center border-2 border-dashed rounded-xl'>
          <Globe className='size-8 text-muted-foreground/30 mb-3' />
          <p className='text-sm font-medium text-muted-foreground mb-1'>No links yet</p>
          <p className='text-xs text-muted-foreground/70'>Add links to your social profiles and websites below.</p>
        </div>
      )}

      {/* Add link section */}
      <div className='space-y-3 pt-2'>
        <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>Add Link</p>

        <div className='space-y-3'>
          {Array.from(platformsByCategory.entries()).map(([category, plats]) => (
            <div key={category}>
              <p className='text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider mb-1.5 capitalize'>
                {category}
              </p>
              <div className='flex flex-wrap gap-1.5'>
                {plats.map((p) => (
                  <button
                    key={p.id}
                    type='button'
                    onClick={() => handleAddLink(p)}
                    className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-card text-xs font-medium hover:bg-accent hover:border-border/80 transition-colors'
                  >
                    <Plus className='size-3 text-muted-foreground' />
                    {p.display_name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          type='button'
          onClick={handleAddCustomLink}
          className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed bg-card text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors'
        >
          <Plus className='size-3' />
          Custom link
        </button>
      </div>
    </div>
  );
}
