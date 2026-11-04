'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, Plus, Download, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Resume } from '@monolenz/types/entities';
import { PageHeader } from '@/app/components/dashboard/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApiClient } from '@/lib/hooks/useApiClient';
import { createResumeApi } from '@/lib/api/resumes';
import { createProfileApi } from '@/lib/api/profile';
import { triggerBlobDownload } from '@/app/components/resumes/blockLabels';
import { ApiError } from '@/lib/api/common';

const TEMPLATE_LABELS: Record<string, string> = {
  professional: 'Professional',
  jake: 'Jake',
};

export default function ResumesPage() {
  const router = useRouter();
  const client = useApiClient();
  const resumeApi = useMemo(() => createResumeApi(client), [client]);
  const profileApi = useMemo(() => createProfileApi(client), [client]);

  const [resumes, setResumes] = useState<Resume[] | null>(null);
  const [hasProfile, setHasProfile] = useState(true);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([resumeApi.list(), profileApi.getMyProfile(), profileApi.getLatestVersion('me')])
      .then(([list, profile]) => {
        if (cancelled) return;
        setResumes(list);
        setHasProfile(Boolean(profile));
      })
      .catch((err) => {
        console.error(err);
        toast.error('Could not load resumes');
        if (!cancelled) setResumes([]);
      });
    return () => {
      cancelled = true;
    };
  }, [resumeApi, profileApi]);

  async function handleCreate() {
    setCreating(true);
    try {
      const created = await resumeApi.create();
      router.push(`/dashboard/resumes/${created.id}`);
    } catch (err) {
      const message =
        err instanceof ApiError && err.status === 422
          ? 'Add some profile content before creating a resume'
          : err instanceof ApiError && err.status === 404
            ? 'Create a profile first'
            : 'Could not create resume';
      toast.error(message);
    } finally {
      setCreating(false);
    }
  }

  async function handleDownload(resume: Resume) {
    setBusyId(resume.id);
    try {
      const { blob, filename } = await resumeApi.downloadPdf(resume.id);
      triggerBlobDownload(blob, filename);
    } catch {
      toast.error('Could not download PDF');
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(resume: Resume) {
    if (!window.confirm(`Delete “${resume.name}”? This cannot be undone.`)) return;
    setBusyId(resume.id);
    try {
      await resumeApi.delete(resume.id);
      setResumes((current) => (current ?? []).filter((item) => item.id !== resume.id));
      toast.success('Resume deleted');
    } catch {
      toast.error('Could not delete resume');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className='h-full overflow-y-auto'>
      <PageHeader
        title='Resumes'
        description='Compose named variants from your profile and export a PDF'
        actions={
          <Button onClick={handleCreate} disabled={creating || !hasProfile}>
            <Plus className='size-4' />
            {creating ? 'Creating…' : 'New resume'}
          </Button>
        }
      />

      <div className='p-6 md:p-8 max-w-5xl'>
        {!hasProfile ? (
          <EmptyState
            title='Create a profile first'
            description='Resumes are composed from your profile entries.'
            href='/dashboard/profile'
            action='Set up profile'
          />
        ) : resumes === null ? (
          <p className='text-sm text-muted-foreground'>Loading resumes…</p>
        ) : resumes.length === 0 ? (
          <EmptyState
            title='No resumes yet'
            description='Pick entries from your profile, choose a template, and download a PDF.'
            onClick={handleCreate}
            action={creating ? 'Creating…' : 'Create your first resume'}
          />
        ) : (
          <ul className='space-y-3'>
            {resumes.map((resume) => (
              <li
                key={resume.id}
                className='flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-card border border-border rounded-xl'
              >
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2 flex-wrap'>
                    <h2 className='text-sm font-semibold truncate'>{resume.name}</h2>
                    <Badge variant='secondary'>{TEMPLATE_LABELS[resume.template_id] ?? resume.template_id}</Badge>
                  </div>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Updated {new Date(resume.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <div className='flex items-center gap-2 shrink-0'>
                  <Button variant='outline' size='sm' asChild>
                    <Link href={`/dashboard/resumes/${resume.id}`}>
                      <Pencil className='size-3.5' />
                      Edit
                    </Link>
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleDownload(resume)}
                    disabled={busyId === resume.id}
                  >
                    <Download className='size-3.5' />
                    PDF
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => handleDelete(resume)}
                    disabled={busyId === resume.id}
                  >
                    <Trash2 className='size-3.5' />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function EmptyState({
  title,
  description,
  href,
  action,
  onClick,
}: {
  title: string;
  description: string;
  href?: string;
  action: string;
  onClick?: () => void;
}) {
  return (
    <div className='flex flex-col items-center text-center py-16 px-6 border border-dashed rounded-xl bg-card/40'>
      <div className='size-12 rounded-xl bg-secondary text-primary flex items-center justify-center mb-4'>
        <FileText className='size-5' />
      </div>
      <h2 className='text-base font-semibold'>{title}</h2>
      <p className='text-sm text-muted-foreground mt-1 max-w-md'>{description}</p>
      {href ? (
        <Button className='mt-5' asChild>
          <Link href={href}>{action}</Link>
        </Button>
      ) : (
        <Button className='mt-5' onClick={onClick}>
          <Plus className='size-4' />
          {action}
        </Button>
      )}
    </div>
  );
}
