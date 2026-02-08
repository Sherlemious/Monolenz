'use client';

/**
 * Profile Overview Page
 * - No profile: step-by-step onboarding wizard
 * - Has profile: polished read-only view of profile info and blocks
 */

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import type { Profile, VersionBlockDetail } from '@monolenz/types/entities';
import { useProfileApi } from '@/lib/hooks/useProfile';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { USERNAME_MIN_LENGTH, meetsMinimumLength } from '@/lib/validation/username';

// ============================================================================
// Main Page
// ============================================================================

export default function ProfilePage() {
  const profileApi = useProfileApi();
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative size-10">
          <div className="absolute inset-0 rounded-full border-2 border-muted" />
          <div className="absolute inset-0 rounded-full border-2 border-t-primary animate-spin" />
        </div>
        <p className="text-muted-foreground text-sm">Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-3 p-8">
        <div className="size-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
          <span className="text-destructive text-xl">!</span>
        </div>
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="text-muted-foreground text-sm max-w-sm">{error}</p>
      </div>
    );
  }

  if (!profile) {
    return <OnboardingWizard api={profileApi} onCreated={handleProfileCreated} />;
  }

  return <ProfileOverview profile={profile} blocks={blocks} />;
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
  api: ReturnType<typeof useProfileApi>;
  onCreated: (profile: Profile) => void;
}

function OnboardingWizard({ api, onCreated }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentStep = ONBOARDING_STEPS[step]!;
  const isLastStep = step === ONBOARDING_STEPS.length - 1;
  const isFirstStep = step === 0;
  const currentValue = formData[currentStep.key] ?? '';
  const canProceed =
    !currentStep.required || currentValue.trim().length >= (currentStep.key === 'username' ? USERNAME_MIN_LENGTH : 1);

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
      onCreated(newProfile);
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

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Welcome to Monolenz</h1>
        <p className="text-muted-foreground text-sm">Let&apos;s set up your professional profile</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-0 mb-8">
        {ONBOARDING_STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center">
            <button
              type="button"
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
      <Card className="w-full max-w-md">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              {currentStep.icon}
            </div>
            {!currentStep.required && (
              <Badge variant="outline" className="text-[10px]">
                Optional
              </Badge>
            )}
          </div>
          <CardTitle className="text-lg mt-3">{currentStep.title}</CardTitle>
          <CardDescription>{currentStep.description}</CardDescription>
        </CardHeader>

        <CardContent className="pb-4">
          <Label htmlFor={`onboarding-${currentStep.key}`} className="sr-only">
            {currentStep.title}
          </Label>
          {currentStep.multiline ? (
            <textarea
              id={`onboarding-${currentStep.key}`}
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm shadow-xs transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring resize-y font-[inherit]"
              value={currentValue}
              onChange={(e) => setFormData((prev) => ({ ...prev, [currentStep.key]: e.target.value }))}
              placeholder={currentStep.placeholder}
              autoFocus
            />
          ) : (
            <Input
              id={`onboarding-${currentStep.key}`}
              type={currentStep.type ?? 'text'}
              value={currentValue}
              onChange={(e) => setFormData((prev) => ({ ...prev, [currentStep.key]: e.target.value }))}
              placeholder={currentStep.placeholder}
              onKeyDown={handleKeyDown}
              className="h-10"
              autoFocus
            />
          )}

          {currentStep.key === 'username' && currentValue.length > 0 && !meetsMinimumLength(currentValue) && (
            <p className="text-xs text-muted-foreground mt-2">
              Username must be at least {USERNAME_MIN_LENGTH} characters
            </p>
          )}

          {error && (
            <div className="mt-4 px-3 py-2.5 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-sm">
              {error}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStep((s) => s - 1);
              setError(null);
            }}
            disabled={isFirstStep}
          >
            ← Back
          </Button>

          <div className="flex gap-2">
            {!currentStep.required && !isLastStep && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStep((s) => s + 1);
                  setError(null);
                }}
              >
                Skip
              </Button>
            )}
            <Button size="sm" onClick={handleNext} disabled={!canProceed || isSubmitting}>
              {isSubmitting ? 'Creating...' : isLastStep ? 'Create Profile' : 'Next →'}
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Progress bar */}
      <div className="w-full max-w-md mt-6">
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / ONBOARDING_STEPS.length) * 100}%` }}
          />
        </div>
        <p className="text-[11px] text-muted-foreground text-center mt-2">
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
  return (
    <div className="min-h-full">
      {/* Hero header */}
      <header className="relative border-b bg-card overflow-hidden">
        {/* Subtle gradient accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent" />

        <div className="relative max-w-5xl mx-auto px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div className="flex items-start gap-5">
              {/* Avatar */}
              {profile.profile_picture_url ? (
                <img
                  src={profile.profile_picture_url}
                  alt={profile.username}
                  className="size-20 rounded-2xl object-cover border-2 border-border shadow-sm shrink-0"
                />
              ) : (
                <div className="size-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold shrink-0">
                  {profile.username.charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <h1 className="text-2xl font-bold tracking-tight">{profile.username}</h1>
                {profile.bio && (
                  <p className="text-sm text-muted-foreground mt-1.5 max-w-lg leading-relaxed">{profile.bio}</p>
                )}
                <ProfileLinks profile={profile} />
              </div>
            </div>

            <Button asChild className="shrink-0">
              <Link href="/dashboard/profile/edit">
                <EditIcon className="size-4" />
                Edit Profile
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 lg:px-8 py-8">
        {blocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 max-w-md mx-auto">
            <div className="size-24 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-8">
              <PlusIcon className="size-10 text-primary/40" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Your profile is empty</h2>
            <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
              Start building your professional profile by adding your experience, skills, education, and more.
            </p>
            <Button size="lg" asChild>
              <Link href="/dashboard/profile/edit">
                <PlusIcon className="size-4" />
                Add Your Content
              </Link>
            </Button>
          </div>
        ) : (
          <BlocksGrid blocks={blocks} />
        )}
      </main>
    </div>
  );
}

// ============================================================================
// Profile Links
// ============================================================================

function ProfileLinks({ profile }: { profile: Profile }) {
  const links = [
    { url: profile.linkedin_url, label: 'LinkedIn', icon: 'in' },
    { url: profile.github_url, label: 'GitHub', icon: '</>' },
    { url: profile.portfolio_url, label: 'Portfolio', icon: 'www' },
  ].filter((l) => l.url);

  if (links.length === 0) return null;

  return (
    <div className="flex gap-2 mt-3">
      {links.map((link) => (
        <a
          key={link.label}
          href={link.url!}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1.5 rounded-md hover:text-foreground hover:bg-accent transition-colors"
        >
          <span className="text-[10px] font-bold">{link.icon}</span>
          {link.label}
        </a>
      ))}
    </div>
  );
}

// ============================================================================
// Blocks Grid
// ============================================================================

const BLOCK_TYPE_META: Record<string, { label: string; accent: string }> = {
  work_experience: { label: 'Experience', accent: 'border-l-blue-400' },
  education: { label: 'Education', accent: 'border-l-purple-400' },
  skill: { label: 'Skills', accent: 'border-l-amber-400' },
  project: { label: 'Projects', accent: 'border-l-emerald-400' },
  certification: { label: 'Certifications', accent: 'border-l-orange-400' },
  language: { label: 'Languages', accent: 'border-l-cyan-400' },
  volunteer: { label: 'Volunteer', accent: 'border-l-pink-400' },
  award: { label: 'Awards', accent: 'border-l-yellow-400' },
};

function BlocksGrid({ blocks }: { blocks: VersionBlockDetail[] }) {
  const byCategory = new Map<string, VersionBlockDetail[]>();

  for (const block of blocks) {
    const meta = BLOCK_TYPE_META[block.block_type as string];
    const category = meta?.label ?? 'Other';
    if (!byCategory.has(category)) byCategory.set(category, []);
    byCategory.get(category)!.push(block);
  }

  return (
    <div className="space-y-10">
      {Array.from(byCategory.entries()).map(([category, categoryBlocks]) => {
        const firstBlock = categoryBlocks[0];
        const meta = firstBlock ? BLOCK_TYPE_META[firstBlock.block_type as string] : null;

        return (
          <section key={category}>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">{category}</h2>
              <Badge variant="secondary" className="text-[10px] ml-1">
                {categoryBlocks.length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categoryBlocks.map((block) => (
                <BlockPreview key={block.id} block={block} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

// ============================================================================
// Block Preview Card
// ============================================================================

function BlockPreview({ block }: { block: VersionBlockDetail }) {
  const title = getBlockTitle(block);
  const subtitle = getBlockSubtitle(block);
  const dates = getBlockDates(block);
  const meta = BLOCK_TYPE_META[block.block_type as string];

  return (
    <article
      className={cn(
        'bg-card border rounded-xl p-5 transition-all hover:shadow-md border-l-[3px]',
        meta?.accent ?? 'border-l-muted'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-[15px] truncate">{title}</h3>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5 truncate">{subtitle}</p>}
        </div>
        {!block.is_visible && (
          <Badge variant="outline" className="text-[10px] shrink-0">
            Hidden
          </Badge>
        )}
      </div>
      {dates && <p className="text-xs text-muted-foreground mt-3">{dates}</p>}
    </article>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function getBlockTitle(block: VersionBlockDetail): string {
  const data = block.data as unknown as Record<string, unknown>;
  return String(
    data.title ||
      data.name ||
      data.company_name ||
      data.institution_name ||
      data.organization_name ||
      data.language ||
      data.position_title ||
      data.degree_name ||
      formatBlockType(block.block_type)
  );
}

function getBlockSubtitle(block: VersionBlockDetail): string | null {
  const data = block.data as unknown as Record<string, unknown>;
  return (data.position_title ||
    data.degree_name ||
    data.issuing_organization ||
    data.role ||
    data.proficiency ||
    data.proficiency_level ||
    data.category ||
    null) as string | null;
}

function getBlockDates(block: VersionBlockDetail): string | null {
  const data = block.data as unknown as Record<string, unknown>;
  const start = data.start_date || data.issue_date || data.date_received;
  const end = data.end_date || data.expiration_date;
  const current = data.is_current || data.is_ongoing;

  if (!start) return null;
  const startStr = formatDate(start as string);
  if (current) return `${startStr} → Present`;
  if (end) return `${startStr} → ${formatDate(end as string)}`;
  return startStr;
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function formatBlockType(blockType: string): string {
  return blockType
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// ============================================================================
// Icons
// ============================================================================

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}
