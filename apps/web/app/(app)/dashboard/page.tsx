'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Check, Copy, FileText, History, Pencil, Printer } from 'lucide-react';
import { toast } from 'sonner';
import type { Profile, VersionBlockDetail, VersionSummary } from '@monolenz/types/entities';
import { PageHeader } from '@/app/components/dashboard/PageHeader';
import { Button } from '@/components/ui/button';
import { useApiClient } from '@/lib/hooks/useApiClient';
import { createProfileApi } from '@/lib/api/profile';
import { createProfileBlocksApi } from '@/lib/api/profile-blocks';
import { cn } from '@/lib/utils';
import { formatRelative } from '@/app/components/profile/block-display';
import { OnboardingWizard } from '@/app/components/onboarding/OnboardingWizard';

const CATEGORIES: { type: string; label: string; hint: string }[] = [
  { type: 'work_experience', label: 'Experience', hint: 'Roles you have held' },
  { type: 'education', label: 'Education', hint: 'Degrees and schools' },
  { type: 'skill', label: 'Skills', hint: 'What you are good at' },
  { type: 'project', label: 'Projects', hint: 'Things you have built' },
  { type: 'certification', label: 'Certifications', hint: 'Credentials' },
  { type: 'language', label: 'Languages', hint: 'Languages you speak' },
  { type: 'volunteer', label: 'Volunteering', hint: 'Causes you support' },
  { type: 'award', label: 'Awards', hint: 'Recognition' },
];

export default function DashboardPage() {
  const client = useApiClient();
  const profileApi = useMemo(() => createProfileApi(client), [client]);
  const blocksApi = useMemo(() => createProfileBlocksApi(client), [client]);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [blocks, setBlocks] = useState<VersionBlockDetail[]>([]);
  const [versions, setVersions] = useState<VersionSummary[]>([]);
  const [totalVersions, setTotalVersions] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p = await profileApi.getMyProfile();
        if (cancelled) return;
        setProfile(p);
        if (p) {
          const [latest, history] = await Promise.all([
            profileApi.getLatestVersion('me'),
            blocksApi.listMyVersions(1, 4).catch(() => null),
          ]);
          if (cancelled) return;
          setBlocks(latest?.blocks ?? []);
          setVersions(history?.versions ?? []);
          setTotalVersions(history?.total ?? 0);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [profileApi, blocksApi]);

  const counts = useMemo(() => {
    const byType = new Map<string, number>();
    for (const b of blocks) byType.set(b.block_type as string, (byType.get(b.block_type as string) ?? 0) + 1);
    return byType;
  }, [blocks]);
  const hiddenCount = blocks.filter((b) => b.is_visible === false).length;
  const filled = CATEGORIES.filter((c) => counts.has(c.type)).length;

  const publicPath = profile ? `/${profile.username}` : null;

  const copyPublicLink = async () => {
    if (!publicPath) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${publicPath}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error('Could not copy link');
    }
  };

  if (isLoading) {
    return (
      <div className='h-full overflow-y-auto'>
        <PageHeader title='Home' />
        <div className='px-6 md:px-10 max-w-5xl space-y-4'>
          <div className='h-36 rounded-xl bg-secondary animate-pulse' />
          <div className='grid md:grid-cols-3 gap-4'>
            <div className='md:col-span-2 h-72 rounded-xl bg-secondary animate-pulse' />
            <div className='h-72 rounded-xl bg-secondary animate-pulse' />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className='h-full overflow-y-auto'>
        <OnboardingWizard
          api={profileApi}
          onCreated={(p) => {
            setProfile(p);
            setBlocks([]);
          }}
        />
      </div>
    );
  }
  return (
    <div className='h-full overflow-y-auto'>
      <PageHeader
        title='Home'
        maxWidth='max-w-5xl'
        description={
          versions[0]?.created_at
            ? `Last saved ${formatRelative(versions[0].created_at)}`
            : 'Your profile is live. Add some content to fill it out.'
        }
        actions={
          <Button asChild>
            <Link href='/dashboard/profile/edit'>
              <Pencil className='size-3.5' /> Open editor
            </Link>
          </Button>
        }
      />

      <div className='px-6 md:px-10 pb-12 max-w-5xl space-y-4'>
        {/* Public page card */}
        <section className='rounded-xl border bg-card'>
          <div className='flex flex-col md:flex-row md:items-center gap-5 p-5 md:p-6'>
            <div className='flex items-center gap-4 min-w-0 flex-1'>
              <div className='size-12 rounded-full bg-secondary ring-1 ring-border flex items-center justify-center font-serif text-xl shrink-0'>
                {profile.username.charAt(0).toUpperCase()}
              </div>
              <div className='min-w-0'>
                <div className='flex items-center gap-2 text-[12px] text-muted-foreground'>
                  <span className='relative flex size-2'>
                    <span className='absolute inline-flex size-full rounded-full bg-brand opacity-60 animate-ping' />
                    <span className='relative inline-flex size-2 rounded-full bg-brand' />
                  </span>
                  Live
                </div>
                <p className='mt-0.5 text-[15px] font-medium truncate'>{publicPath}</p>
                {profile.bio && <p className='text-[13px] text-muted-foreground truncate max-w-md'>{profile.bio}</p>}
              </div>
            </div>
            <div className='flex flex-wrap items-center gap-2'>
              <Button variant='outline' size='sm' onClick={copyPublicLink}>
                {copied ? <Check className='size-3.5' /> : <Copy className='size-3.5' />}
                {copied ? 'Copied' : 'Copy link'}
              </Button>
              <Button variant='outline' size='sm' asChild>
                <a href={`${publicPath}?print=1`} target='_blank' rel='noopener noreferrer'>
                  <Printer className='size-3.5' /> Save as PDF
                </a>
              </Button>
              <Button variant='outline' size='sm' asChild>
                <Link href='/dashboard/resumes'>
                  <FileText className='size-3.5' /> Resumes
                </Link>
              </Button>
              <Button variant='outline' size='sm' asChild>
                <a href={`${publicPath}`} target='_blank' rel='noopener noreferrer'>
                  View <ArrowUpRight className='size-3.5' />
                </a>
              </Button>
            </div>
          </div>
          <dl className='grid grid-cols-3 border-t divide-x'>
            <Stat label='Entries' value={blocks.length} />
            <Stat label='Public' value={blocks.length - hiddenCount} />
            <Stat label='Hidden' value={hiddenCount} />
          </dl>
        </section>

        <div className='grid gap-4 md:grid-cols-3'>
          {/* Sections overview */}
          <section className='md:col-span-2 rounded-xl border bg-card'>
            <div className='flex items-center justify-between px-5 md:px-6 pt-5'>
              <div>
                <h2 className='text-sm font-semibold'>Sections</h2>
                <p className='text-[13px] text-muted-foreground'>
                  {filled} of {CATEGORIES.length} filled in
                </p>
              </div>
              <Progress value={filled / CATEGORIES.length} />
            </div>
            <ul className='mt-3 grid sm:grid-cols-2 px-2 pb-2'>
              {CATEGORIES.map((c) => {
                const n = counts.get(c.type) ?? 0;
                return (
                  <li key={c.type}>
                    <Link
                      href='/dashboard/profile/edit'
                      className='group flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-secondary transition-colors'
                    >
                      <span
                        className={cn(
                          'flex size-5 items-center justify-center rounded-full border text-[10px] shrink-0',
                          n > 0
                            ? 'border-transparent bg-foreground text-background'
                            : 'border-dashed border-border-strong'
                        )}
                        aria-hidden
                      >
                        {n > 0 && <Check className='size-3' strokeWidth={3} />}
                      </span>
                      <span className='min-w-0 flex-1'>
                        <span className='block text-[13px] font-medium'>{c.label}</span>
                        <span className='block text-[12px] text-muted-foreground truncate'>
                          {n > 0 ? `${n} ${n === 1 ? 'entry' : 'entries'}` : c.hint}
                        </span>
                      </span>
                      <ArrowRight className='size-3.5 text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all' />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Recent saves */}
          <section className='rounded-xl border bg-card flex flex-col'>
            <div className='px-5 pt-5'>
              <h2 className='text-sm font-semibold'>Recent saves</h2>
              <p className='text-[13px] text-muted-foreground'>
                {totalVersions} {totalVersions === 1 ? 'version' : 'versions'} kept
              </p>
            </div>
            {versions.length === 0 ? (
              <p className='px-5 py-8 text-[13px] text-muted-foreground'>Nothing saved yet.</p>
            ) : (
              <ol className='relative mt-4 px-5 flex-1'>
                <span className='absolute left-[25px] top-1.5 bottom-3 w-px bg-border' aria-hidden />
                {versions.map((v) => (
                  <li key={v.id} className='relative flex gap-3 pb-4'>
                    <span
                      className={cn(
                        'relative mt-1 size-[11px] rounded-full border-2 bg-card shrink-0',
                        v.is_current ? 'border-brand bg-brand' : 'border-border-strong'
                      )}
                      aria-hidden
                    />
                    <div className='min-w-0'>
                      <p className='text-[13px] font-medium truncate'>{v.name || 'Saved changes'}</p>
                      <p className='text-[12px] text-muted-foreground'>
                        {formatRelative(v.created_at)} · {v.block_count} {v.block_count === 1 ? 'entry' : 'entries'}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
            <div className='border-t p-2'>
              <Button variant='ghost' size='sm' className='w-full justify-between' asChild>
                <Link href='/dashboard/profile/history'>
                  <span className='inline-flex items-center gap-2'>
                    <History className='size-3.5' /> View history
                  </span>
                  <ArrowRight className='size-3.5' />
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className='px-5 md:px-6 py-3.5'>
      <dt className='text-[12px] text-muted-foreground'>{label}</dt>
      <dd className='text-xl font-semibold tabular-nums tracking-tight'>{value}</dd>
    </div>
  );
}

function Progress({ value }: { value: number }) {
  const r = 14;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox='0 0 36 36' className='size-9 -rotate-90' aria-hidden>
      <circle cx='18' cy='18' r={r} fill='none' strokeWidth='3' className='stroke-secondary' />
      <circle
        cx='18'
        cy='18'
        r={r}
        fill='none'
        strokeWidth='3'
        strokeLinecap='round'
        className='stroke-foreground transition-[stroke-dashoffset] duration-700'
        strokeDasharray={c}
        strokeDashoffset={c * (1 - value)}
      />
    </svg>
  );
}
