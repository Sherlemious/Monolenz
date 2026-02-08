'use client';

/**
 * ProfileInfoForm - Edit profile basic info (username, bio, URLs)
 * Edit-only — profile creation happens via onboarding on the profile page.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Profile } from '@monolenz/types/entities';
import type { ProfileApi } from '@/lib/api/profile';
import { Input, Label } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface ProfileInfoFormProps {
  profile: Profile;
  api: ProfileApi;
  onSaved?: (profile: Profile) => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

interface FormData {
  username: string;
  bio: string;
  profile_picture_url: string;
  linkedin_url: string;
  github_url: string;
  portfolio_url: string;
}

interface FormErrors {
  username?: string;
  bio?: string;
  profile_picture_url?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
}

// ============================================================================
// Main Component
// ============================================================================

export function ProfileInfoForm({ profile, api, onSaved, onDirtyChange }: ProfileInfoFormProps) {
  const [formData, setFormData] = useState<FormData>({
    username: profile.username ?? '',
    bio: profile.bio ?? '',
    profile_picture_url: profile.profile_picture_url ?? '',
    linkedin_url: profile.linkedin_url ?? '',
    github_url: profile.github_url ?? '',
    portfolio_url: profile.portfolio_url ?? '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Track dirty state
  const [isDirty, setIsDirty] = useState(false);

  // Username availability
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const usernameTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const originalUsername = useRef(profile.username ?? '');

  // Debounced username check
  const checkUsername = useCallback(
    (username: string) => {
      if (usernameTimerRef.current) {
        clearTimeout(usernameTimerRef.current);
      }

      if (username === originalUsername.current) {
        setUsernameStatus('idle');
        return;
      }

      if (username.length < 3 || !/^[a-zA-Z0-9_-]+$/.test(username)) {
        setUsernameStatus('idle');
        return;
      }

      setUsernameStatus('checking');

      usernameTimerRef.current = setTimeout(async () => {
        try {
          const result = await api.checkUsernameAvailability(username);
          setUsernameStatus(result.available ? 'available' : 'taken');
        } catch {
          setUsernameStatus('idle');
        }
      }, 500);
    },
    [api]
  );

  useEffect(() => {
    return () => {
      if (usernameTimerRef.current) {
        clearTimeout(usernameTimerRef.current);
      }
    };
  }, []);

  // Check if form is dirty
  useEffect(() => {
    const isFormDirty = 
      formData.username !== (profile.username ?? '') ||
      formData.bio !== (profile.bio ?? '') ||
      formData.profile_picture_url !== (profile.profile_picture_url ?? '') ||
      formData.linkedin_url !== (profile.linkedin_url ?? '') ||
      formData.github_url !== (profile.github_url ?? '') ||
      formData.portfolio_url !== (profile.portfolio_url ?? '');
    
    setIsDirty(isFormDirty);
    onDirtyChange?.(isFormDirty);
  }, [formData, profile, onDirtyChange]);

  // ========================================================================
  // Validation
  // ========================================================================

  function validate(data: FormData): FormErrors {
    const errs: FormErrors = {};

    if (!data.username || data.username.length < 3) {
      errs.username = 'Username must be at least 3 characters';
    } else if (data.username.length > 50) {
      errs.username = 'Username must be less than 50 characters';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(data.username)) {
      errs.username = 'Username can only contain letters, numbers, underscores, and hyphens';
    }

    if (data.bio && data.bio.length > 500) {
      errs.bio = 'Bio must be less than 500 characters';
    }

    const urlFields: (keyof FormData)[] = ['profile_picture_url', 'linkedin_url', 'github_url', 'portfolio_url'];
    for (const field of urlFields) {
      const val = data[field];
      if (val && val.trim()) {
        try {
          new URL(val);
        } catch {
          errs[field] = 'Invalid URL';
        }
      }
    }

    return errs;
  }

  // ========================================================================
  // Handlers
  // ========================================================================

  function handleChange(field: keyof FormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSaveMessage(null);

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }

    if (field === 'username') {
      checkUsername(value);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (usernameStatus === 'taken') {
      setErrors({ username: 'This username is already taken' });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const payload: Record<string, string | undefined> = {};
      for (const [key, value] of Object.entries(formData)) {
        payload[key] = value.trim() || undefined;
      }

      const saved = await api.updateProfile(payload);
      setSaveMessage({ type: 'success', text: 'Profile updated successfully' });

      originalUsername.current = saved.username;
      setUsernameStatus('idle');
      setIsDirty(false);
      onDirtyChange?.(false);
      onSaved?.(saved);
    } catch (err) {
      setSaveMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update profile',
      });
    } finally {
      setIsSaving(false);
    }
  }

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <form className='max-w-[600px] p-6' onSubmit={handleSubmit}>
      <div className='mb-6'>
        <h2 className='text-xl font-semibold'>Profile Information</h2>
        <p className='text-sm text-muted-foreground mt-1'>Update your basic profile details</p>
      </div>

      {/* Save message */}
      {saveMessage && (
        <div
          className={cn(
            'px-4 py-3 rounded-lg text-sm mb-6 border',
            saveMessage.type === 'success' &&
              'bg-green-50 border-green-200 text-green-700 dark:bg-green-950/20 dark:border-green-800 dark:text-green-400',
            saveMessage.type === 'error' && 'bg-destructive/5 border-destructive/30 text-destructive'
          )}
        >
          {saveMessage.text}
        </div>
      )}

      <div className='flex flex-col gap-5'>
        {/* Username */}
        <div className='space-y-1.5'>
          <Label htmlFor='username'>
            Username <span className='text-destructive'>*</span>
          </Label>
          <div className='relative'>
            <Input
              id='username'
              value={formData.username}
              onChange={(e) => handleChange('username', e.target.value)}
              placeholder='your-username'
              maxLength={50}
              aria-invalid={!!errors.username}
            />
            {usernameStatus !== 'idle' && (
              <span
                className={cn(
                  'absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium',
                  usernameStatus === 'checking' && 'text-muted-foreground',
                  usernameStatus === 'available' && 'text-green-600',
                  usernameStatus === 'taken' && 'text-destructive'
                )}
              >
                {usernameStatus === 'checking' && 'Checking...'}
                {usernameStatus === 'available' && 'Available'}
                {usernameStatus === 'taken' && 'Taken'}
              </span>
            )}
          </div>
          {errors.username && <p className='text-xs text-destructive'>{errors.username}</p>}
          <p className='text-xs text-muted-foreground'>Letters, numbers, underscores, and hyphens only</p>
        </div>

        {/* Bio */}
        <div className='space-y-1.5'>
          <Label htmlFor='bio'>Bio</Label>
          <textarea
            id='bio'
            className={cn(
              'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y font-[inherit]',
              errors.bio && 'border-destructive'
            )}
            value={formData.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            placeholder='A brief description about yourself'
            rows={3}
            maxLength={500}
          />
          <div className='text-xs text-muted-foreground text-right'>{formData.bio.length}/500</div>
          {errors.bio && <p className='text-xs text-destructive'>{errors.bio}</p>}
        </div>

        {/* Profile Picture URL */}
        <div className='space-y-1.5'>
          <Label htmlFor='profile_picture_url'>Profile Picture URL</Label>
          <Input
            id='profile_picture_url'
            type='url'
            value={formData.profile_picture_url}
            onChange={(e) => handleChange('profile_picture_url', e.target.value)}
            placeholder='https://example.com/photo.jpg'
            aria-invalid={!!errors.profile_picture_url}
          />
          {errors.profile_picture_url && <p className='text-xs text-destructive'>{errors.profile_picture_url}</p>}
        </div>

        <div className='text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-2 pb-2 border-b'>
          Social Links
        </div>

        {/* LinkedIn URL */}
        <div className='space-y-1.5'>
          <Label htmlFor='linkedin_url'>LinkedIn</Label>
          <Input
            id='linkedin_url'
            type='url'
            value={formData.linkedin_url}
            onChange={(e) => handleChange('linkedin_url', e.target.value)}
            placeholder='https://linkedin.com/in/username'
            aria-invalid={!!errors.linkedin_url}
          />
          {errors.linkedin_url && <p className='text-xs text-destructive'>{errors.linkedin_url}</p>}
        </div>

        {/* GitHub URL */}
        <div className='space-y-1.5'>
          <Label htmlFor='github_url'>GitHub</Label>
          <Input
            id='github_url'
            type='url'
            value={formData.github_url}
            onChange={(e) => handleChange('github_url', e.target.value)}
            placeholder='https://github.com/username'
            aria-invalid={!!errors.github_url}
          />
          {errors.github_url && <p className='text-xs text-destructive'>{errors.github_url}</p>}
        </div>

        {/* Portfolio URL */}
        <div className='space-y-1.5'>
          <Label htmlFor='portfolio_url'>Portfolio</Label>
          <Input
            id='portfolio_url'
            type='url'
            value={formData.portfolio_url}
            onChange={(e) => handleChange('portfolio_url', e.target.value)}
            placeholder='https://your-website.com'
            aria-invalid={!!errors.portfolio_url}
          />
          {errors.portfolio_url && <p className='text-xs text-destructive'>{errors.portfolio_url}</p>}
        </div>
      </div>

      {/* Submit */}
      <div className='mt-6 pt-6 border-t'>
        <Button type='submit' disabled={isSaving || usernameStatus === 'taken'}>
          {isSaving ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </form>
  );
}
