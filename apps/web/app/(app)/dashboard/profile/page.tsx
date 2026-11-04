'use client';

/**
 * Profile Overview Page
 * - No profile: step-by-step onboarding wizard
 * - Has profile: polished read-only view of profile info and blocks
 */

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import type { Profile, VersionBlockDetail } from '@monolenz/types/entities';
import { useApiClient } from '@/lib/hooks/useApiClient';
import { createProfileApi, type ProfileApi } from '@/lib/api/profile';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { isUsernameValidForChecking, validateUsername } from '@/lib/validation/username';
import { ArrowUpRight } from 'lucide-react';
import { PageHeader } from '@/app/components/dashboard/PageHeader';
import { ProfileHeader, ProfileSections } from '@/app/components/profile/ProfileDocument';

// ============================================================================
// Main Page
// ============================================================================

export default function ProfilePage() {
  const client = useApiClient();
  const profileApi = useMemo(() => createProfileApi(client), [client]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [blocks, setBlocks] = useState<VersionBlockDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoading(true);
        const userProfile = await profileApi.getMyProfile();
        setProfile(userProfile);

        if (userProfile) {
          const latest = await profileApi.getLatestVersion('me');
          if (latest?.blocks) {
            setBlocks(latest.blocks);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [profileApi]);

  const handleProfileCreated = useCallback((newProfile: Profile) => {
    setProfile(newProfile);
  }, []);

  if (isLoading) {
    return (
      <div className='flex flex-col items-center justify-center h-full gap-4'>
        <div className='relative size-10'>
          <div className='absolute inset-0 rounded-full border-2 border-muted' />
          <div className='absolute inset-0 rounded-full border-2 border-t-primary animate-spin' />
        </div>
        <p className='text-muted-foreground text-sm'>Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center h-full text-center gap-3 p-8'>
        <div className='size-14 rounded-2xl bg-destructive/10 flex items-center justify-center'>
          <span className='text-destructive text-xl'>!</span>
        </div>
        <h2 className='text-lg font-semibold'>Something went wrong</h2>
        <p className='text-muted-foreground text-sm max-w-sm'>{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className='h-full overflow-y-auto'>
        <OnboardingWizard api={profileApi} onCreated={handleProfileCreated} />
      </div>
    );
  }

  return (
    <div className='h-full overflow-y-auto'>
      <ProfileOverview profile={profile} blocks={blocks} />
    </div>
  );
}

// ============================================================================
// Onboarding Step Config
// ============================================================================

interface OnboardingStep {
  key: string;
  title: string;
  description: string;
  placeholder: string;
  multiline?: boolean;
  type?: 'text' | 'url';
  required?: boolean;
  icon: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    key: 'username',
    title: 'Choose a username',
    description: 'This will be your unique public profile handle.',
    placeholder: 'e.g. john-doe',
    required: true,
    icon: '@',
  },
  {
    key: 'bio',
    title: 'Write a short bio',
    description: 'Introduce yourself in a sentence or two.',
    placeholder: 'Full-stack developer passionate about building great products...',
    multiline: true,
    icon: 'Aa',
  },
  {
    key: 'linkedin_url',
    title: 'Add your LinkedIn',
    description: 'Help people connect with you professionally.',
    placeholder: 'https://linkedin.com/in/your-profile',
    type: 'url',
    icon: 'in',
  },
  {
    key: 'github_url',
    title: 'Add your GitHub',
    description: 'Showcase your open source contributions.',
    placeholder: 'https://github.com/your-username',
    type: 'url',
    icon: '</>',
  },
  {
    key: 'portfolio_url',
    title: 'Add your portfolio',
    description: 'Link to your personal website or portfolio.',
    placeholder: 'https://your-website.com',
    type: 'url',
    icon: 'www',
  },
];

// ============================================================================
// Onboarding Wizard
// ============================================================================

interface OnboardingWizardProps {
  api: ProfileApi;
  onCreated: (profile: Profile) => void;
}

function OnboardingWizard({ api, onCreated }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdProfile, setCreatedProfile] = useState<Profile | null>(null);

  // Username availability state
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const usernameTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (usernameTimerRef.current) clearTimeout(usernameTimerRef.current);
    };
  }, []);

  const checkUsername = useCallback(
    (username: string) => {
      if (usernameTimerRef.current) clearTimeout(usernameTimerRef.current);

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

  const currentStep = ONBOARDING_STEPS[step]!;
  const isLastStep = step === ONBOARDING_STEPS.length - 1;
  const isFirstStep = step === 0;
  const currentValue = formData[currentStep.key] ?? '';

  // Username step: must be valid format and not taken
  const usernameError = currentStep.key === 'username' ? validateUsername(currentValue) : null;
  const canProceed = (() => {
    if (currentStep.key === 'username') {
      return !usernameError && usernameStatus !== 'taken' && usernameStatus !== 'checking';
    }
    return !currentStep.required || currentValue.trim().length >= 1;
  })();

  function handleFieldChange(key: string, value: string) {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (key === 'username') {
      checkUsername(value);
    }
  }

  async function handleNext() {
    if (isLastStep) {
      await handleCreate();
    } else {
      setStep((s) => s + 1);
      setError(null);
    }
  }

  async function handleCreate() {
    setIsSubmitting(true);
    setError(null);

    try {
      const payload: Record<string, string> = {};
      for (const [key, value] of Object.entries(formData)) {
        const trimmed = value.trim();
        if (trimmed) payload[key] = trimmed;
      }

      const { username, bio, linkedin_url, github_url, portfolio_url } = payload;
      if (!username) {
        throw new Error('Username is required');
      }
      const newProfile = await api.createProfile({
        username,
        ...(bio && { bio }),
        ...(linkedin_url && { linkedin_url }),
        ...(github_url && { github_url }),
        ...(portfolio_url && { portfolio_url }),
      });
      setCreatedProfile(newProfile);
      setShowSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !currentStep.multiline && canProceed) {
      e.preventDefault();
      handleNext();
    }
  }

  // Success screen
  if (showSuccess && createdProfile) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[80vh] p-6'>
        <div className='size-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6'>
          <CheckIcon className='size-10 text-primary' />
        </div>
        <h1 className='font-serif text-[40px] leading-tight mb-2'>You&apos;re all set.</h1>
        <p className='text-muted-foreground text-sm text-center max-w-sm mb-8'>
          Your profile has been created as{' '}
          <span className='font-semibold text-foreground'>@{createdProfile.username}</span>. Start adding your
          experience, skills, and projects.
        </p>
        <div className='flex gap-3'>
          <Button variant='outline' onClick={() => onCreated(createdProfile)}>
            View Profile
          </Button>
          <Button asChild>
            <Link href='/dashboard/profile/edit'>Add Your Content</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-[80vh] p-6'>
      {/* Header */}
      <div className='text-center mb-8'>
        <h1 className='font-serif text-[40px] leading-tight mb-1'>Welcome to Monolenz</h1>
        <p className='text-muted-foreground text-sm'>Let&apos;s set up your professional profile</p>
      </div>

      {/* Stepper */}
      <div className='flex items-center gap-0 mb-8'>
        {ONBOARDING_STEPS.map((s, i) => (
          <div key={s.key} className='flex items-center'>
            <button
              type='button'
              onClick={() => {
                if (i < step) {
                  setStep(i);
                  setError(null);
                }
              }}
              className={cn(
                'size-9 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2',
                i === step && 'bg-primary text-primary-foreground border-primary scale-110',
                i < step && 'bg-primary/10 text-primary border-primary/30 cursor-pointer hover:bg-primary/20',
                i > step && 'bg-muted text-muted-foreground border-transparent'
              )}
            >
              {i + 1}
            </button>
            {i < ONBOARDING_STEPS.length - 1 && (
              <div className={cn('w-8 h-0.5 transition-colors', i < step ? 'bg-primary/30' : 'bg-muted')} />
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <Card className='w-full max-w-md'>
        <CardHeader className='pb-4'>
          <div className='flex items-center justify-between'>
            <div className='size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm'>
              {currentStep.icon}
            </div>
            {!currentStep.required && (
              <Badge variant='outline' className='text-[10px]'>
                Optional
              </Badge>
            )}
          </div>
          <CardTitle className='text-lg mt-3'>{currentStep.title}</CardTitle>
          <CardDescription>{currentStep.description}</CardDescription>
        </CardHeader>

        <CardContent className='pb-4'>
          <Label htmlFor={`onboarding-${currentStep.key}`} className='sr-only'>
            {currentStep.title}
          </Label>
          {currentStep.multiline ? (
            <textarea
              id={`onboarding-${currentStep.key}`}
              className='flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm shadow-xs transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring resize-y font-[inherit]'
              value={currentValue}
              onChange={(e) => handleFieldChange(currentStep.key, e.target.value)}
              placeholder={currentStep.placeholder}
              autoFocus
            />
          ) : (
            <Input
              id={`onboarding-${currentStep.key}`}
              type={currentStep.type ?? 'text'}
              value={currentValue}
              onChange={(e) => handleFieldChange(currentStep.key, e.target.value)}
              placeholder={currentStep.placeholder}
              onKeyDown={handleKeyDown}
              className='h-10'
              autoFocus
            />
          )}

          {/* Username validation feedback */}
          {currentStep.key === 'username' && currentValue.length > 0 && (
            <div className='mt-2'>
              {usernameError ? (
                <p className='text-xs text-muted-foreground'>{usernameError}</p>
              ) : usernameStatus === 'checking' ? (
                <p className='text-xs text-muted-foreground'>Checking availability...</p>
              ) : usernameStatus === 'available' ? (
                <p className='text-xs text-emerald-600'>Username is available</p>
              ) : usernameStatus === 'taken' ? (
                <p className='text-xs text-destructive'>Username is already taken</p>
              ) : null}
            </div>
          )}

          {error && (
            <div className='mt-4 px-3 py-2.5 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-sm'>
              {error}
            </div>
          )}
        </CardContent>

        <CardFooter className='flex justify-between pt-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => {
              setStep((s) => s - 1);
              setError(null);
            }}
            disabled={isFirstStep}
          >
            Back
          </Button>

          <div className='flex gap-2'>
            {!currentStep.required && !isLastStep && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  setStep((s) => s + 1);
                  setError(null);
                }}
              >
                Skip
              </Button>
            )}
            <Button size='sm' onClick={handleNext} disabled={!canProceed || isSubmitting}>
              {isSubmitting ? 'Creating...' : isLastStep ? 'Create Profile' : 'Next'}
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Progress bar */}
      <div className='w-full max-w-md mt-6'>
        <div className='h-1 bg-muted rounded-full overflow-hidden'>
          <div
            className='h-full bg-primary rounded-full transition-all duration-500 ease-out'
            style={{ width: `${((step + 1) / ONBOARDING_STEPS.length) * 100}%` }}
          />
        </div>
        <p className='text-[11px] text-muted-foreground text-center mt-2'>
          Step {step + 1} of {ONBOARDING_STEPS.length}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Profile Overview
// ============================================================================

function ProfileOverview({ profile, blocks }: { profile: Profile; blocks: VersionBlockDetail[] }) {
  const hidden = blocks.filter((b) => b.is_visible === false).length;
  return (
    <div className='min-h-full'>
      <PageHeader
        title='Profile'
        maxWidth='max-w-4xl'
        description={
          hidden > 0
            ? `This is what visitors see. ${hidden} hidden ${hidden === 1 ? 'entry is' : 'entries are'} shown faded and only visible to you.`
            : 'This is exactly what visitors see on your public page.'
        }
        actions={
          <>
            <Button variant='outline' asChild>
              <a href={`/${profile.username}`} target='_blank' rel='noopener noreferrer'>
                View public page <ArrowUpRight className='size-3.5' />
              </a>
            </Button>
            <Button asChild>
              <Link href='/dashboard/profile/edit'>
                <EditIcon className='size-3.5' />
                Edit
              </Link>
            </Button>
          </>
        }
      />

      <div className='px-6 md:px-10 pb-12 max-w-4xl'>
        <div className='rounded-xl border bg-card shadow-[0_1px_2px_rgb(0_0_0/0.03)]'>
          <div className='px-6 sm:px-12 py-10 sm:py-14'>
            <ProfileHeader profile={profile} />
            <div className='mt-12'>
              {blocks.length === 0 ? (
                <div className='flex flex-col items-center text-center py-12 border border-dashed rounded-xl'>
                  <p className='font-serif text-2xl'>Your page is a blank sheet.</p>
                  <p className='text-muted-foreground text-sm mt-2 mb-6 max-w-sm'>
                    Add experience, skills, education and more. Everything you add shows up here.
                  </p>
                  <Button asChild>
                    <Link href='/dashboard/profile/edit'>
                      <PlusIcon className='size-4' />
                      Add your first entry
                    </Link>
                  </Button>
                </div>
              ) : (
                <ProfileSections blocks={blocks} showHidden />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Icons
// ============================================================================

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2.5}>
      <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
      />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
      <path strokeLinecap='round' strokeLinejoin='round' d='M12 4v16m8-8H4' />
    </svg>
  );
}
