'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Profile } from '@monolenz/types/entities';
import MasterProfileCard from '@/app/components/profile/MasterProfileCard';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/input';
import { useProfileApi } from '@/lib/hooks/useProfile';



const sharedIdentity = {
  name: 'Jake Williams',
  contact: 'jake@email.com · github.com/jake · +1 (555) 555-5555',
};

const profiles = [
  {
    ...sharedIdentity,
    headline: 'SWE Google',
    role: 'SWE · Google',
    sections: [
      {
        title: 'Experience',
        items: [
          {
            heading: 'Software Engineer — Google',
            meta: 'Mountain View, CA · Jun 2022 – Present',
            bullets: [
              'Built scalable front-end systems for internal tools serving 50k+ users.',
              'Improved page performance by 30% through bundle optimization.',
            ],
          },
          {
            heading: 'Frontend Engineer — Monolenz',
            meta: 'Remote · Jan 2021 – May 2022',
            bullets: [
              'Led UI revamp and implemented component library with design tokens.',
              'Collaborated with product to ship 8+ features in 2 quarters.',
            ],
          },
        ],
      },
      {
        title: 'Education',
        items: [
          {
            heading: 'BSc Computer Science — University',
            meta: '2017 – 2021',
            bullets: ['Graduated with honors · GPA 3.8/4.0'],
          },
        ],
      },
      {
        title: 'Skills',
        items: [
          {
            heading: 'Languages & Frameworks',
            meta: 'React, TypeScript, Next.js, Node.js',
            bullets: ['Testing: Vitest, Playwright', 'Styling: Tailwind, CSS Modules'],
          },
        ],
      },
    ],
  },
  {
    ...sharedIdentity,
    headline: 'Product Designer Figma',
    role: 'Product Designer · Figma',
    sections: [
      {
        title: 'Experience',
        items: [
          {
            heading: 'Product Designer — Stripe',
            meta: 'San Francisco, CA · 2021 – Present',
            bullets: [
              'Designed onboarding flows that increased activation by 18%.',
              'Built design system components across 6 product teams.',
            ],
          },
          {
            heading: 'UX Designer — Airbnb',
            meta: 'San Francisco, CA · 2019 – 2021',
            bullets: [
              'Led research studies across 5 product areas.',
              'Improved booking flow completion by 12%.',
            ],
          },
        ],
      },
      {
        title: 'Education',
        items: [
          {
            heading: 'BA Visual Communication — Art Institute',
            meta: '2015 – 2019',
            bullets: ['Focus on interaction design and typography'],
          },
        ],
      },
      {
        title: 'Skills',
        items: [
          {
            heading: 'Design & Research',
            meta: 'Figma, Prototyping, User Research',
            bullets: ['Systems: Tokens, Component Libraries'],
          },
        ],
      },
    ],
  },
  {
    ...sharedIdentity,
    headline: 'Data Scientist Airbnb',
    role: 'Data Scientist · Airbnb',
    sections: [
      {
        title: 'Experience',
        items: [
          {
            heading: 'Data Scientist — Airbnb',
            meta: 'Remote · 2020 – Present',
            bullets: [
              'Built churn prediction model with 0.82 AUC.',
              'Improved experimentation pipeline reliability by 25%.',
            ],
          },
          {
            heading: 'Data Analyst — Spotify',
            meta: 'New York, NY · 2018 – 2020',
            bullets: [
              'Automated KPI reporting, reducing weekly manual work by 6 hours.',
              'Partnered with PMs to define north-star metrics.',
            ],
          },
        ],
      },
      {
        title: 'Education',
        items: [
          {
            heading: 'MSc Data Science — Columbia University',
            meta: '2016 – 2018',
            bullets: ['Thesis on causal inference in recommender systems'],
          },
        ],
      },
      {
        title: 'Skills',
        items: [
          {
            heading: 'ML & Analytics',
            meta: 'Python, SQL, PyTorch, scikit-learn',
            bullets: ['Visualization: Metabase, Superset'],
          },
        ],
      },
    ],
  },
];

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

export default function ProfilePage() {
  const pathname = usePathname();
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

  const step =
    ONBOARDING_STEPS[currentStep] ??
    ONBOARDING_STEPS[0] ?? {
      key: 'username',
      title: 'Profile',
      description: 'Complete your profile details.',
      placeholder: '',
    };
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const isFirstStep = currentStep === 0;
  const isCreateMode = profile === null;
  const pageTitle = useMemo(() => (isCreateMode ? 'Profile Onboarding' : 'Profile'), [isCreateMode]);

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

  return (
    <SidebarProvider defaultOpen>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === '/dashboard'}>
                    <Link href='/dashboard'>Overview</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname?.startsWith('/dashboard/profile')}>
                    <Link href='/dashboard/profile'>Profile</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname?.startsWith('/dashboard/applications')}>
                    <Link href='/dashboard/applications'>Applications</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Resume</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <button
                    type='button'
                    className='w-full rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2 text-left text-sm font-medium text-neutral-100 hover:bg-neutral-800'
                  >
                    Add new Resume
                  </button>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <div className='mt-[5vh] flex justify-center px-6'>
          {loading ? (
            <div className='text-sm text-neutral-400'>Loading profile...</div>
          ) : !profile ? (
            <div className='w-full max-w-[720px]'>
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
                      {isSaving ? 'Saving...' : 'Create Profile'}
                    </Button>
                  ) : (
                    <Button type='button' onClick={handleNext} disabled={isSaving}>
                      Next
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>
          ) : (
            <Carousel opts={{ align: 'start' }} className='w-full max-w-[820px]'>
              <CarouselContent>
                {profiles.map((profileItem) => (
                  <CarouselItem key={profileItem.name} className='flex justify-center'>
                    <MasterProfileCard {...profileItem} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
