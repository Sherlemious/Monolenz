'use client';

import { useEffect, useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { ResumeDocument } from '@monolenz/resume-pdf';
import type { ResumeHeader, ResumeTemplateId, VersionBlockDetail } from '@monolenz/types/entities';

interface ResumePreviewProps {
  templateId: ResumeTemplateId;
  header: ResumeHeader;
  blocks: VersionBlockDetail[];
}

export function ResumePreview({ templateId, header, blocks }: ResumePreviewProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const blob = await pdf(<ResumeDocument templateId={templateId} header={header} blocks={blocks} />).toBlob();
        if (cancelled) return;
        setUrl((previous) => {
          if (previous) URL.revokeObjectURL(previous);
          return URL.createObjectURL(blob);
        });
        setError(null);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError('Could not render preview');
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [templateId, header, blocks]);

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  if (error && !url) {
    return (
      <div className='h-full flex items-center justify-center text-sm text-muted-foreground p-8 text-center'>
        {error}. You can still save and download the PDF.
      </div>
    );
  }

  if (!url) {
    return <div className='h-full bg-muted animate-pulse' />;
  }

  return <iframe title='Resume preview' src={url} className='w-full h-full border-0 bg-muted' />;
}
