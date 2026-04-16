'use client';

import { useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ProfileApi } from '@/lib/api/profile';

type AllowedContentType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';

const ALLOWED_TYPES: AllowedContentType[] = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_BYTES = 5 * 1024 * 1024;

interface AvatarUploaderProps {
  currentUrl?: string;
  fallback?: string;
  api: ProfileApi;
  onUploaded: (newUrl: string) => void;
}

type UploadState = 'idle' | 'uploading' | 'error';

export function AvatarUploader({ currentUrl, fallback, api, onUploaded }: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const displayUrl = previewUrl ?? currentUrl;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!inputRef.current) return;
    inputRef.current.value = '';

    if (!file) return;

    // Client-side guard
    if (!ALLOWED_TYPES.includes(file.type as AllowedContentType)) {
      setErrorMessage('Only JPEG, PNG, WebP, and GIF images are allowed.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setErrorMessage('Image must be smaller than 5 MB.');
      return;
    }

    setErrorMessage(undefined);
    setPreviewUrl(URL.createObjectURL(file));
    setUploadState('uploading');

    try {
      // 1. Get presigned URL from API
      const { uploadUrl, objectUrl } = await api.requestAvatarUploadUrl({
        contentType: file.type as AllowedContentType,
        fileSize: file.size,
      });

      // 2. PUT directly to S3
      const s3Response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!s3Response.ok) {
        throw new Error(`S3 upload failed: ${s3Response.status} ${s3Response.statusText}`);
      }

      // 3. Persist the new URL on the profile
      await api.updateProfile({ profile_picture_url: objectUrl });

      setUploadState('idle');
      onUploaded(objectUrl);
    } catch (err) {
      setPreviewUrl(undefined);
      setUploadState('error');
      setErrorMessage(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    }
  }

  return (
    <div className='flex items-center gap-4'>
      <Avatar size='lg' className='size-16'>
        <AvatarImage src={displayUrl} alt='Profile picture' />
        <AvatarFallback className='text-lg'>{fallback ?? '?'}</AvatarFallback>
      </Avatar>

      <div className='flex flex-col gap-1.5'>
        <div className='flex items-center gap-2'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            disabled={uploadState === 'uploading'}
            onClick={() => inputRef.current?.click()}
          >
            {uploadState === 'uploading' ? 'Uploading...' : 'Upload photo'}
          </Button>
          {displayUrl && uploadState !== 'uploading' && (
            <span className='text-xs text-muted-foreground'>JPEG, PNG, WebP, GIF · max 5 MB</span>
          )}
        </div>
        {!displayUrl && uploadState !== 'uploading' && (
          <p className='text-xs text-muted-foreground'>JPEG, PNG, WebP, GIF · max 5 MB</p>
        )}
        {errorMessage && (
          <p className={cn('text-xs text-destructive')}>{errorMessage}</p>
        )}
      </div>

      <input
        ref={inputRef}
        type='file'
        accept='image/jpeg,image/png,image/webp,image/gif'
        className='hidden'
        onChange={handleFileChange}
      />
    </div>
  );
}
