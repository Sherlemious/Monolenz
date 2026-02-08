'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { Profile } from '@monolenz/types/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/input';
import { useProfileApi } from '@/lib/hooks/useProfile';

type OnboardingField = 'username' | 'bio' | 'linkedin_url' | 'github_url' | 'portfolio_url';

const ONBOARDING_STEPS: Array<{
  key: OnboardingField;
  title: string;
  description: string;
  placeholder: string;
  multiline?: boolean;
}> = [
  {
    key: 'username',
    title: 'Choose a username',
    description: 'This will be your public profile handle.',
    placeholder: 'e.g. youssef',
  },
  {
    key: 'bio',
    title: 'Add a short bio',
    description: 'Tell people what you do and what you care about.',
    placeholder: 'Frontend engineer interested in UI systems...',
    multiline: true,
  },
  {
    key: 'linkedin_url',
    title: 'LinkedIn URL',
    description: 'Add your LinkedIn profile link.',
    placeholder: 'https://linkedin.com/in/yourname',
  },
  {
    key: 'github_url',
    title: 'GitHub URL',
    description: 'Add your GitHub profile link.',
    placeholder: 'https://github.com/yourname',
  },
  {
    key: 'portfolio_url',
    title: 'Portfolio URL',
    description: 'Add your personal or portfolio site.',
    placeholder: 'https://yourportfolio.dev',
  },
];

const emptyForm = {
  username: '',
  bio: '',
  linkedin_url: '',
  github_url: '',
  portfolio_url: '',
};

export default function ProfileEditPage() {
  const api = useProfileApi();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    let isMounted = true;

    api
      .getMyProfile()
      .then((data) => {
        if (!isMounted) return;
        setProfile(data);
        if (data) {
          setFormData({
            username: data.username ?? '',
            bio: data.bio ?? '',
            linkedin_url: data.linkedin_url ?? '',
            github_url: data.github_url ?? '',
            portfolio_url: data.portfolio_url ?? '',
          });
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [api]);

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const isFirstStep = currentStep === 0;
  const isCreateMode = profile === null;
  const pageTitle = useMemo(() => (isCreateMode ? 'Profile Onboarding' : 'Edit Profile'), [isCreateMode]);

  const handleFieldChange = (key: OnboardingField, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        username: formData.username.trim(),
        bio: formData.bio.trim(),
        linkedin_url: formData.linkedin_url.trim(),
        github_url: formData.github_url.trim(),
        portfolio_url: formData.portfolio_url.trim(),
      };

      const savedProfile = isCreateMode
        ? await api.createProfile(payload)
        : await api.updateMyProfile(payload);

      setProfile(savedProfile ?? profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className='px-6 py-10'>
        <nav className='mb-6'>
          <Link href='/dashboard/profile' className='text-sm text-neutral-400 hover:text-neutral-200'>
            Back to Profile
          </Link>
        </nav>
        <div className='text-sm text-neutral-400'>Loading profile...</div>
      </div>
    );
  }

  return (
    <div className='px-6 py-10'>
      <nav className='mb-6'>
        <Link href='/dashboard/profile' className='text-sm text-neutral-400 hover:text-neutral-200'>
          Back to Profile
        </Link>
      </nav>

      <div className='mx-auto max-w-2xl'>
        <Card className='border-neutral-800 bg-neutral-900 text-neutral-100'>
          <CardHeader>
            <CardTitle className='text-lg'>{pageTitle}</CardTitle>
            <CardDescription className='text-neutral-400'>{step.description}</CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            <Label htmlFor={step.key} className='text-neutral-300'>
              {step.title}
            </Label>
            {step.multiline ? (
              <textarea
                id={step.key}
                value={formData[step.key]}
                onChange={(event) => handleFieldChange(step.key, event.target.value)}
                placeholder={step.placeholder}
                className='min-h-[140px] w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500'
              />
            ) : (
              <Input
                id={step.key}
                value={formData[step.key]}
                onChange={(event) => handleFieldChange(step.key, event.target.value)}
                placeholder={step.placeholder}
                className='border-neutral-700 bg-neutral-950 text-neutral-100 placeholder:text-neutral-500 focus-visible:ring-neutral-500'
              />
            )}
            {error ? <p className='text-sm text-red-400'>{error}</p> : null}
          </CardContent>
          <CardFooter className='flex items-center justify-between'>
            <Button type='button' variant='outline' onClick={handleBack} disabled={isFirstStep || isSaving}>
              Back
            </Button>
            {isLastStep ? (
              <Button type='button' onClick={handleSave} disabled={isSaving || !formData.username.trim()}>
                {isSaving ? 'Saving...' : isCreateMode ? 'Create Profile' : 'Save Changes'}
              </Button>
            ) : (
              <Button type='button' onClick={handleNext} disabled={isSaving}>
                Next
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
