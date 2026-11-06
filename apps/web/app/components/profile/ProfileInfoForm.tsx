'use client';

/**
 * ProfileInfoForm - Edit profile basic info (username, bio, URLs)
 * Edit-only — profile creation happens via onboarding on the profile page.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Profile } from '@monolenz/types/entities';
import {
  extractSocialHandle,
  isSocialKind,
  isValidProfileUrl,
  normalizeProfileUrl,
  type ProfileUrlKind,
  type SocialKind,
} from '@monolenz/types/validation';
import type { ProfileApi } from '@/lib/api/profile';
import { describeApiError } from '@/lib/api/common';
import { SocialHandleInput, socialHandleError } from '@/app/components/profile/SocialHandleInput';
import { Input, Label } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { validateUsername, isUsernameValidForChecking, USERNAME_MAX_LENGTH } from '@/lib/validation/username';
import { THEMES, getTheme } from '@/lib/themes';

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
  display_name: string;
  phone: string;
  location: string;
  bio: string;
  profile_picture_url: string;
  linkedin_url: string;
  github_url: string;
  portfolio_url: string;
}

const URL_FIELDS: [keyof FormData & `${string}_url`, ProfileUrlKind][] = [
  ['profile_picture_url', 'image'],
  ['linkedin_url', 'linkedin'],
  ['github_url', 'github'],
  ['portfolio_url', 'portfolio'],
];

/** Stored URL → what the username-only field shows (falls back to the raw value if it isn't a profile link). */
function handleFromUrl(url: string | null | undefined, kind: SocialKind): string {
  if (!url) return '';
  return extractSocialHandle(url, kind) ?? url;
}

function profileToForm(profile: Profile): FormData {
  return {
    username: profile.username ?? '',
    display_name: profile.display_name ?? '',
    phone: profile.phone ?? '',
    location: profile.location ?? '',
    bio: profile.bio ?? '',
    profile_picture_url: profile.profile_picture_url ?? '',
    linkedin_url: handleFromUrl(profile.linkedin_url, 'linkedin'),
    github_url: handleFromUrl(profile.github_url, 'github'),
    portfolio_url: profile.portfolio_url ?? '',
  };
}

interface FormErrors {
  username?: string;
  display_name?: string;
  phone?: string;
  location?: string;
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
  const [formData, setFormData] = useState<FormData>(() => profileToForm(profile));

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Theme selector state (saves immediately on selection)
  const [selectedTheme, setSelectedTheme] = useState(() => getTheme(profile.theme).id);
  const [themeSaving, setThemeSaving] = useState(false);

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

      if (!isUsernameValidForChecking(username)) {
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
    const initial = profileToForm(profile);
    const isFormDirty = (Object.keys(initial) as (keyof FormData)[]).some((k) => formData[k] !== initial[k]);

    onDirtyChange?.(isFormDirty);
  }, [formData, profile, onDirtyChange]);

  // ========================================================================
  // Validation
  // ========================================================================

  function validate(data: FormData): FormErrors {
    const errs: FormErrors = {};

    const usernameError = validateUsername(data.username);
    if (usernameError) {
      errs.username = usernameError;
    }

    if (data.bio && data.bio.length > 500) {
      errs.bio = 'Bio must be less than 500 characters';
    }

    for (const [field, kind] of URL_FIELDS) {
      const val = data[field];
      if (!val || !val.trim()) continue;
      if (isSocialKind(kind)) {
        const err = socialHandleError(val, kind);
        if (err) errs[field] = err;
      } else if (!isValidProfileUrl(normalizeProfileUrl(val, kind), kind)) {
        errs[field] = 'That doesn’t look like a valid link';
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

  async function handleThemeSelect(themeId: string) {
    if (themeId === selectedTheme || themeSaving) return;
    const previousTheme = selectedTheme;
    setSelectedTheme(themeId);
    setThemeSaving(true);
    try {
      await api.updateProfile({ theme: themeId });
    } catch {
      setSelectedTheme(previousTheme);
    } finally {
      setThemeSaving(false);
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
      // Send '' for emptied fields so the API clears them (undefined is dropped from JSON).
      const payload: Record<string, string> = {};
      for (const [key, value] of Object.entries(formData)) {
        payload[key] = value.trim();
      }
      const cleaned: Partial<FormData> = {};
      for (const [field, kind] of URL_FIELDS) {
        payload[field] = normalizeProfileUrl(payload[field] ?? '', kind);
        cleaned[field] = isSocialKind(kind) ? handleFromUrl(payload[field], kind) : payload[field];
      }
      setFormData((prev) => ({ ...prev, ...payload, ...cleaned }) as FormData);

      const saved = await api.updateProfile(payload);
      setSaveMessage({ type: 'success', text: 'Profile updated successfully' });

      originalUsername.current = saved.username;
      setUsernameStatus('idle');
      onDirtyChange?.(false);
      onSaved?.(saved);
    } catch (err) {
      setSaveMessage({
        type: 'error',
        text: describeApiError(err, 'Failed to update profile').message,
      });
    } finally {
      setIsSaving(false);
    }
  }

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <form className='max-w-2xl px-6 md:px-10 py-8' onSubmit={handleSubmit}>
      <div className='mb-8'>
        <h2 className='text-[19px] font-semibold tracking-tight'>About you</h2>
        <p className='text-[13px] text-muted-foreground mt-0.5'>
          Your username, bio and photo appear at the top of your public page.
        </p>
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
              maxLength={USERNAME_MAX_LENGTH}
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

        <div className='space-y-1.5'>
          <Label htmlFor='display_name'>Display name</Label>
          <Input
            id='display_name'
            value={formData.display_name}
            onChange={(e) => handleChange('display_name', e.target.value)}
            placeholder='Your name as it should appear on resumes'
            maxLength={255}
            aria-invalid={!!errors.display_name}
          />
          {errors.display_name && <p className='text-xs text-destructive'>{errors.display_name}</p>}
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
          <div className='space-y-1.5'>
            <Label htmlFor='phone'>Phone</Label>
            <Input
              id='phone'
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder='+20 100 000 0000'
              maxLength={50}
              aria-invalid={!!errors.phone}
            />
            {errors.phone && <p className='text-xs text-destructive'>{errors.phone}</p>}
          </div>
          <div className='space-y-1.5'>
            <Label htmlFor='location'>Location</Label>
            <Input
              id='location'
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder='Cairo, Egypt'
              maxLength={255}
              aria-invalid={!!errors.location}
            />
            {errors.location && <p className='text-xs text-destructive'>{errors.location}</p>}
          </div>
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
            type='text'
            inputMode='url'
            autoCapitalize='none'
            spellCheck={false}
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
          <SocialHandleInput
            id='linkedin_url'
            kind='linkedin'
            value={formData.linkedin_url}
            onChange={(v) => handleChange('linkedin_url', v)}
            placeholder='username'
            error={errors.linkedin_url}
          />
          {errors.linkedin_url && <p className='text-xs text-destructive'>{errors.linkedin_url}</p>}
        </div>

        {/* GitHub URL */}
        <div className='space-y-1.5'>
          <Label htmlFor='github_url'>GitHub</Label>
          <SocialHandleInput
            id='github_url'
            kind='github'
            value={formData.github_url}
            onChange={(v) => handleChange('github_url', v)}
            placeholder='username'
            error={errors.github_url}
          />
          {errors.github_url && <p className='text-xs text-destructive'>{errors.github_url}</p>}
        </div>

        {/* Portfolio URL */}
        <div className='space-y-1.5'>
          <Label htmlFor='portfolio_url'>Portfolio</Label>
          <Input
            id='portfolio_url'
            type='text'
            inputMode='url'
            autoCapitalize='none'
            spellCheck={false}
            value={formData.portfolio_url}
            onChange={(e) => handleChange('portfolio_url', e.target.value)}
            placeholder='https://your-website.com'
            aria-invalid={!!errors.portfolio_url}
          />
          {errors.portfolio_url && <p className='text-xs text-destructive'>{errors.portfolio_url}</p>}
        </div>
      </div>

      {/* Profile Theme */}
      <div className='mt-6'>
        <div className='text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 pb-2 border-b'>
          Profile Theme
        </div>
        <p className='text-xs text-muted-foreground mb-3'>Choose how your public profile page looks to visitors.</p>
        <div className='flex flex-wrap gap-3'>
          {THEMES.map((t) => (
            <button
              key={t.id}
              type='button'
              onClick={() => handleThemeSelect(t.id)}
              disabled={themeSaving}
              className={cn(
                'flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all',
                selectedTheme === t.id
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-border hover:border-muted-foreground/40'
              )}
              title={t.label}
            >
              {/* Color swatch */}
              <div
                className='size-10 rounded-md border border-border/50 overflow-hidden flex items-end'
                style={{ background: t.preview.bg }}
              >
                <div className='h-3 w-full' style={{ background: t.preview.accent }} />
              </div>
              <span className='text-[10px] font-medium text-muted-foreground'>{t.label}</span>
            </button>
          ))}
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
