'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Reorder } from 'framer-motion';
import { ArrowLeft, Download, GripVertical, Save } from 'lucide-react';
import { toast } from 'sonner';
import type { ResumeDetail, ResumeHeader, ResumeTemplateId, VersionBlockDetail } from '@monolenz/types/entities';
import { PageHeader } from '@/app/components/dashboard/PageHeader';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useApiClient } from '@/lib/hooks/useApiClient';
import { createResumeApi } from '@/lib/api/resumes';
import { createProfileApi } from '@/lib/api/profile';
import { ApiError } from '@/lib/api/common';
import {
  formatBlockType,
  getBlockSubtitle,
  getBlockTitle,
  triggerBlobDownload,
} from '@/app/components/resumes/blockLabels';
import { TailorResumeDialog } from '@/app/components/resumes/TailorResumeDialog';

const ResumePreview = dynamic(() => import('@/app/components/resumes/ResumePreview').then((mod) => mod.ResumePreview), {
  ssr: false,
  loading: () => <div className='h-full bg-muted animate-pulse' />,
});

const TEMPLATES: { id: ResumeTemplateId; label: string; hint: string }[] = [
  { id: 'professional', label: 'Professional', hint: 'More space, classic headings' },
  { id: 'jake', label: 'Jake', hint: 'Dense, ATS-friendly single column' },
];

export default function ResumeComposerPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const client = useApiClient();
  const resumeApi = useMemo(() => createResumeApi(client), [client]);
  const profileApi = useMemo(() => createProfileApi(client), [client]);

  const [resume, setResume] = useState<ResumeDetail | null>(null);
  const [catalog, setCatalog] = useState<VersionBlockDetail[]>([]);
  const [latestIds, setLatestIds] = useState<Set<number>>(new Set());
  const [name, setName] = useState('');
  const [templateId, setTemplateId] = useState<ResumeTemplateId>('professional');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [detail, latest] = await Promise.all([resumeApi.get(params.id), profileApi.getLatestVersion('me')]);
        if (cancelled) return;
        const latestBlocks = latest?.blocks ?? [];
        const byId = new Map<number, VersionBlockDetail>();
        for (const block of latestBlocks) byId.set(block.id, block);
        for (const block of detail.blocks) {
          if (!byId.has(block.id)) byId.set(block.id, block);
        }
        setCatalog(Array.from(byId.values()));
        setLatestIds(new Set(latestBlocks.map((block) => block.id)));
        setResume(detail);
        setName(detail.name);
        setTemplateId(detail.template_id);
        setSelectedIds(detail.blocks.map((block) => block.id));
      } catch (err) {
        if (err instanceof ApiError && err.is404()) {
          toast.error('Resume not found');
          router.replace('/dashboard/resumes');
          return;
        }
        toast.error('Could not load resume');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [params.id, resumeApi, profileApi, router]);

  const catalogById = useMemo(() => new Map(catalog.map((block) => [block.id, block])), [catalog]);
  const selectedBlocks = useMemo(
    () => selectedIds.map((id) => catalogById.get(id)).filter((block): block is VersionBlockDetail => Boolean(block)),
    [selectedIds, catalogById]
  );
  const unselected = useMemo(() => catalog.filter((block) => !selectedIds.includes(block.id)), [catalog, selectedIds]);
  const missingDisplayName = !resume?.header.display_name || resume.header.display_name === resume.header.username;

  const header = useMemo<ResumeHeader | null>(
    () => (resume ? { ...resume.header, display_name: resume.header.display_name || resume.header.username } : null),
    [resume]
  );

  const toggleBlock = useCallback((id: number, included: boolean) => {
    setSelectedIds((current) => {
      if (included) return current.includes(id) ? current : [...current, id];
      return current.filter((item) => item !== id);
    });
  }, []);

  async function handleSave() {
    if (selectedIds.length === 0) {
      toast.error('Select at least one entry');
      return;
    }
    setSaving(true);
    try {
      const updated = await resumeApi.update(params.id, {
        name: name.trim() || 'Untitled resume',
        template_id: templateId,
        block_ids: selectedIds,
      });
      setResume(updated);
      setName(updated.name);
      toast.success('Resume saved');
    } catch {
      toast.error('Could not save resume');
    } finally {
      setSaving(false);
    }
  }

  async function handleDownload() {
    if (selectedIds.length === 0) {
      toast.error('Select at least one entry');
      return;
    }
    setDownloading(true);
    try {
      await resumeApi.update(params.id, {
        name: name.trim() || 'Untitled resume',
        template_id: templateId,
        block_ids: selectedIds,
      });
      const { blob, filename } = await resumeApi.downloadPdf(params.id);
      triggerBlobDownload(blob, filename);
    } catch {
      toast.error('Could not download PDF');
    } finally {
      setDownloading(false);
    }
  }

  if (loading || !resume || !header) {
    return (
      <div className='h-full flex items-center justify-center text-sm text-muted-foreground'>Loading composer…</div>
    );
  }

  return (
    <div className='h-full flex flex-col min-h-0'>
      <PageHeader
        title={name.trim() || 'Untitled resume'}
        description='Choose entries, pick a template, then download a PDF'
        actions={
          <div className='flex items-center gap-2'>
            <Button variant='ghost' size='sm' asChild>
              <Link href='/dashboard/resumes'>
                <ArrowLeft className='size-4' />
                All resumes
              </Link>
            </Button>
            <Button variant='outline' onClick={handleSave} disabled={saving}>
              <Save className='size-4' />
              {saving ? 'Saving…' : 'Save'}
            </Button>
            <TailorResumeDialog
              resumeId={resume.id}
              templateId={templateId}
              blocks={resume.blocks}
              resumeApi={resumeApi}
            />
            <Button onClick={handleDownload} disabled={downloading || selectedIds.length === 0}>
              <Download className='size-4' />
              {downloading ? 'Exporting…' : 'Download PDF'}
            </Button>
          </div>
        }
      />

      <div className='flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[minmax(320px,420px)_1fr]'>
        <aside className='border-r overflow-y-auto p-5 space-y-6'>
          <div className='space-y-1.5'>
            <Label htmlFor='resume-name'>Resume name</Label>
            <Input id='resume-name' value={name} onChange={(e) => setName(e.target.value)} maxLength={255} />
          </div>

          <div>
            <p className='font-mono text-[10px] uppercase tracking-[0.1em] font-medium text-fg-subtle mb-2'>Template</p>
            <div className='grid grid-cols-2 gap-2'>
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type='button'
                  onClick={() => setTemplateId(template.id)}
                  className={cn(
                    'text-left rounded-lg border p-3 transition-colors',
                    templateId === template.id ? 'border-primary bg-primary/5' : 'border-border hover:border-ring'
                  )}
                >
                  <div className='text-sm font-semibold'>{template.label}</div>
                  <div className='text-[11px] text-muted-foreground mt-0.5'>{template.hint}</div>
                </button>
              ))}
            </div>
          </div>

          {missingDisplayName ? (
            <p className='text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg px-3 py-2'>
              Add a display name in your profile so the PDF header is not just your username.{' '}
              <Link href='/dashboard/profile/edit' className='underline'>
                Edit profile
              </Link>
            </p>
          ) : null}

          <section>
            <h2 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3'>
              Included ({selectedBlocks.length})
            </h2>
            {selectedBlocks.length === 0 ? (
              <p className='text-sm text-muted-foreground'>Select entries below to include them.</p>
            ) : (
              <Reorder.Group axis='y' values={selectedIds} onReorder={setSelectedIds} className='space-y-2'>
                {selectedIds.map((id) => {
                  const block = catalogById.get(id);
                  if (!block) return null;
                  return (
                    <Reorder.Item key={id} value={id} className='list-none'>
                      <BlockRow
                        block={block}
                        included
                        frozen={!latestIds.has(id)}
                        onToggle={() => toggleBlock(id, false)}
                      />
                    </Reorder.Item>
                  );
                })}
              </Reorder.Group>
            )}
          </section>

          {unselected.length > 0 ? (
            <section>
              <h2 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3'>Available</h2>
              <div className='space-y-2'>
                {unselected.map((block) => (
                  <BlockRow
                    key={block.id}
                    block={block}
                    included={false}
                    onToggle={() => toggleBlock(block.id, true)}
                  />
                ))}
              </div>
            </section>
          ) : catalog.length === 0 ? (
            <EmptyBlocks />
          ) : null}
        </aside>

        <div className='min-h-[480px] xl:min-h-0 bg-muted/40'>
          {selectedBlocks.length === 0 ? (
            <div className='h-full flex items-center justify-center text-sm text-muted-foreground p-8 text-center'>
              Select at least one entry to preview the PDF.
            </div>
          ) : (
            <ResumePreview templateId={templateId} header={header} blocks={selectedBlocks} />
          )}
        </div>
      </div>
    </div>
  );
}

function BlockRow({
  block,
  included,
  frozen,
  onToggle,
}: {
  block: VersionBlockDetail;
  included: boolean;
  frozen?: boolean;
  onToggle: () => void;
}) {
  return (
    <div className='flex items-start gap-2 rounded-lg border border-border bg-card p-2.5'>
      {included ? (
        <GripVertical className='size-4 mt-1 text-muted-foreground shrink-0 cursor-grab' />
      ) : (
        <span className='size-4 shrink-0' />
      )}
      <label className='flex-1 min-w-0 flex items-start gap-2 cursor-pointer'>
        <input type='checkbox' className='mt-1' checked={included} onChange={onToggle} />
        <span className='min-w-0'>
          <span className='block text-sm font-medium truncate'>{getBlockTitle(block)}</span>
          <span className='block text-[11px] text-muted-foreground truncate'>
            {formatBlockType(String(block.block_type))}
            {getBlockSubtitle(block) ? ` · ${getBlockSubtitle(block)}` : ''}
            {frozen ? ' · earlier version' : ''}
          </span>
        </span>
      </label>
    </div>
  );
}

function EmptyBlocks() {
  return (
    <p className='text-sm text-muted-foreground'>
      No profile entries yet.{' '}
      <Link href='/dashboard/profile/edit' className='underline'>
        Add content
      </Link>
      .
    </p>
  );
}
