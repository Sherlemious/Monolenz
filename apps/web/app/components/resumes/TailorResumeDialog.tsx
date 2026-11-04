'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { TailorProposal, VersionBlockDetail, ResumeTemplateId } from '@monolenz/types/entities';
import { ApiError } from '@/lib/api/common';
import type { ResumeApi } from '@/lib/api/resumes';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input, Label } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { formatBlockType, getBlockSubtitle, getBlockTitle } from '@/app/components/resumes/blockLabels';

type ReviewBullet = { text: string; recommended: boolean; checked: boolean };

type ReviewEntry = {
  source_block_id: number;
  include: boolean;
  reason?: string | null;
  selected: boolean;
  addAnyway: boolean;
  bullets: ReviewBullet[];
};

function messageFromApiError(err: unknown, fallback: string): string {
  if (!(err instanceof ApiError)) return fallback;
  const body = err.body;
  if (body && typeof body === 'object' && 'message' in body) {
    const message = (body as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  if (err.status === 503) return 'AI is not configured. Set AI_API_KEY on the API.';
  if (err.status === 429) return 'Too many tailor requests. Please wait and try again.';
  return fallback;
}

function toReviewEntries(proposal: TailorProposal): ReviewEntry[] {
  return proposal.entries.map((entry) => ({
    ...entry,
    selected: entry.include,
    addAnyway: false,
    bullets: entry.bullets.map((bullet) => ({
      ...bullet,
      checked: bullet.recommended,
    })),
  }));
}

export function TailorResumeDialog({
  resumeId,
  templateId,
  blocks,
  resumeApi,
}: {
  resumeId: string;
  templateId: ResumeTemplateId;
  blocks: VersionBlockDetail[];
  resumeApi: ResumeApi;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'paste' | 'review'>('paste');
  const [jobDescription, setJobDescription] = useState('');
  const [name, setName] = useState('');
  const [entries, setEntries] = useState<ReviewEntry[]>([]);
  const [proposing, setProposing] = useState(false);
  const [applying, setApplying] = useState(false);

  const blocksById = useMemo(() => new Map(blocks.map((block) => [block.id, block])), [blocks]);
  const selectedCount = entries.filter((entry) => (entry.include ? entry.selected : entry.addAnyway)).length;
  const canPropose = jobDescription.trim().length >= 200 && jobDescription.trim().length <= 12_000;

  function reset() {
    setStep('paste');
    setJobDescription('');
    setName('');
    setEntries([]);
    setProposing(false);
    setApplying(false);
  }

  async function handlePropose() {
    if (!canPropose) {
      toast.error('Paste a job description of at least 200 characters');
      return;
    }
    setProposing(true);
    try {
      const proposal = await resumeApi.tailor(resumeId, { job_description: jobDescription.trim() });
      setName(proposal.suggested_name);
      setEntries(toReviewEntries(proposal));
      setStep('review');
    } catch (err) {
      toast.error(messageFromApiError(err, 'Could not tailor this resume'));
    } finally {
      setProposing(false);
    }
  }

  async function handleApply() {
    const selections = entries
      .filter((entry) => (entry.include ? entry.selected : entry.addAnyway))
      .map((entry) => {
        if (entry.include && entry.selected && entry.bullets.length > 0) {
          return {
            source_block_id: entry.source_block_id,
            bullets: entry.bullets.filter((bullet) => bullet.checked).map((bullet) => bullet.text),
          };
        }
        return { source_block_id: entry.source_block_id };
      });

    if (selections.length === 0) {
      toast.error('Keep at least one entry');
      return;
    }

    setApplying(true);
    try {
      const created = await resumeApi.applyTailor(resumeId, {
        name: name.trim() || undefined,
        template_id: templateId,
        selections,
      });
      toast.success('Tailored resume created');
      setOpen(false);
      reset();
      router.push(`/dashboard/resumes/${created.id}`);
    } catch (err) {
      toast.error(messageFromApiError(err, 'Could not create tailored resume'));
    } finally {
      setApplying(false);
    }
  }

  return (
    <>
      <Button variant='outline' onClick={() => setOpen(true)}>
        <Sparkles className='size-4' />
        Tailor for a job
      </Button>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) reset();
        }}
      >
        <DialogContent className='sm:max-w-2xl max-h-[85vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>{step === 'paste' ? 'Tailor for a job' : 'Review suggested bullets'}</DialogTitle>
            <DialogDescription>
              {step === 'paste'
                ? 'Paste a job description. We will suggest what to keep and rewrite bullets. Your current resume stays unchanged.'
                : 'Recommended bullets start checked. Create a new named resume from what you keep.'}
            </DialogDescription>
          </DialogHeader>

          {step === 'paste' ? (
            <div className='space-y-2'>
              <Label htmlFor='job-description'>Job description</Label>
              <Textarea
                id='job-description'
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                placeholder='Paste the full job posting here…'
                className='min-h-[220px]'
                maxLength={12_000}
              />
              <p className='text-[11px] text-muted-foreground'>
                {jobDescription.trim().length} / 12,000 characters (200 minimum)
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              <div className='space-y-1.5'>
                <Label htmlFor='tailored-name'>New resume name</Label>
                <Input
                  id='tailored-name'
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={255}
                />
              </div>
              <div className='space-y-3'>
                {entries.map((entry) => {
                  const block = blocksById.get(entry.source_block_id);
                  if (!block) return null;
                  return (
                    <ProposalCard
                      key={entry.source_block_id}
                      block={block}
                      entry={entry}
                      onChange={(next) =>
                        setEntries((current) =>
                          current.map((item) => (item.source_block_id === next.source_block_id ? next : item))
                        )
                      }
                    />
                  );
                })}
              </div>
            </div>
          )}

          <DialogFooter>
            {step === 'paste' ? (
              <Button onClick={handlePropose} disabled={proposing || !canPropose}>
                {proposing ? 'Reading the job…' : 'Get suggestions'}
              </Button>
            ) : (
              <>
                <Button variant='ghost' onClick={() => setStep('paste')} disabled={applying}>
                  Back
                </Button>
                <Button onClick={handleApply} disabled={applying || selectedCount === 0}>
                  {applying ? 'Creating…' : 'Create resume'}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ProposalCard({
  block,
  entry,
  onChange,
}: {
  block: VersionBlockDetail;
  entry: ReviewEntry;
  onChange: (entry: ReviewEntry) => void;
}) {
  const title = getBlockTitle(block);
  const subtitle = getBlockSubtitle(block);
  const included = entry.include ? entry.selected : entry.addAnyway;

  if (!entry.include) {
    return (
      <details className='rounded-lg border border-border bg-muted/30 p-3'>
        <summary className='cursor-pointer text-sm font-medium'>
          {title}
          <span className='ml-2 text-[11px] font-normal text-muted-foreground'>
            {formatBlockType(String(block.block_type))}
            {subtitle ? ` · ${subtitle}` : ''}
            {' · dropped'}
          </span>
        </summary>
        <div className='mt-2 space-y-2'>
          {entry.reason ? <p className='text-xs text-muted-foreground'>{entry.reason}</p> : null}
          <label className='flex items-start gap-2 cursor-pointer text-sm'>
            <input
              type='checkbox'
              className='mt-1'
              checked={entry.addAnyway}
              onChange={(event) => onChange({ ...entry, addAnyway: event.target.checked })}
            />
            <span>Add anyway (keeps the original entry)</span>
          </label>
        </div>
      </details>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border p-3 space-y-3',
        included ? 'border-border bg-card' : 'border-border bg-muted/30'
      )}
    >
      <label className='flex items-start gap-2 cursor-pointer'>
        <input
          type='checkbox'
          className='mt-1'
          checked={entry.selected}
          onChange={(event) => onChange({ ...entry, selected: event.target.checked })}
        />
        <span className='min-w-0'>
          <span className='block text-sm font-medium'>{title}</span>
          <span className='block text-[11px] text-muted-foreground'>
            {formatBlockType(String(block.block_type))}
            {subtitle ? ` · ${subtitle}` : ''}
          </span>
          {entry.reason ? <span className='block text-xs text-muted-foreground mt-1'>{entry.reason}</span> : null}
        </span>
      </label>
      {entry.selected && entry.bullets.length > 0 ? (
        <ul className='space-y-2 pl-6'>
          {entry.bullets.map((bullet, index) => (
            <li key={`${entry.source_block_id}-${index}`}>
              <label className='flex items-start gap-2 cursor-pointer text-sm'>
                <input
                  type='checkbox'
                  className='mt-1'
                  checked={bullet.checked}
                  onChange={(event) =>
                    onChange({
                      ...entry,
                      bullets: entry.bullets.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, checked: event.target.checked } : item
                      ),
                    })
                  }
                />
                <span>
                  {bullet.text}
                  {bullet.recommended ? (
                    <span className='ml-1 text-[10px] uppercase tracking-wide text-muted-foreground'>Suggested</span>
                  ) : null}
                </span>
              </label>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
