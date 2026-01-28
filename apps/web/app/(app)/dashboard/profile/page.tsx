'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

export default function ProfilePage() {
  const pathname = usePathname();

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
          <Carousel opts={{ align: 'start' }} className='w-full max-w-[820px]'>
            <CarouselContent>
              {profiles.map((profile) => (
                <CarouselItem key={profile.name} className='flex justify-center'>
                  <MasterProfileCard {...profile} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
