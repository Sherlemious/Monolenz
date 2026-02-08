type ProfileSectionItem = {
  heading: string;
  meta: string;
  bullets: string[];
};

type ProfileSection = {
  title: string;
  items: ProfileSectionItem[];
};

type ProfileLinks = {
  email?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
};

type MasterProfileCardProps = {
  name?: string;
  headline?: string;
  role?: string;
  contact?: string;
  links?: ProfileLinks;
  sections?: ProfileSection[];
};

const DEFAULT_SECTIONS: ProfileSection[] = [
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
];

const defaultProfile: MasterProfileCardProps = {
  name: 'Jake Williams',
  headline: 'SWE Google',
  role: 'SWE · Google',
  contact: 'jake@email.com · github.com/jake · +1 (555) 555-5555',
  links: {
    email: 'jake@email.com',
    linkedin_url: 'https://linkedin.com/in/jake',
    github_url: 'https://github.com/jake',
    portfolio_url: 'https://jake.dev',
  },
  sections: DEFAULT_SECTIONS,
};

function LinkItem({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      className='text-neutral-400 hover:text-neutral-200 transition-colors'
    >
      {label}
    </a>
  );
}

export default function MasterProfileCard({
  name = defaultProfile.name,
  headline = defaultProfile.headline,
  role = defaultProfile.role,
  contact = defaultProfile.contact,
  links = defaultProfile.links,
  sections = defaultProfile.sections,
}: MasterProfileCardProps) {
  const safeSections = sections ?? DEFAULT_SECTIONS;
  const safeLinks = links ?? defaultProfile.links;

  const linkItems = [
    safeLinks?.email && { href: `mailto:${safeLinks.email}`, label: safeLinks.email },
    safeLinks?.linkedin_url && { href: safeLinks.linkedin_url, label: 'LinkedIn' },
    safeLinks?.github_url && { href: safeLinks.github_url, label: 'GitHub' },
    safeLinks?.portfolio_url && { href: safeLinks.portfolio_url, label: 'Portfolio' },
  ].filter(Boolean) as Array<{ href: string; label: string }>;

  return (
    <div className='flex flex-col items-center'>
      <div className='mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-neutral-400'>
        {headline}
      </div>
      <div className='bg-neutral-900 text-neutral-100 border border-neutral-800 rounded-lg shadow-xl p-10 w-[600px] sm:w-[680px] md:w-[760px]'>
        <div className='mb-6 text-center'>
          <h2 className='text-2xl font-semibold tracking-tight'>{name}</h2>
          <p className='text-sm text-neutral-400'>{role}</p>
          {linkItems.length > 0 ? (
            <div className='mt-2 flex flex-wrap justify-center gap-3 text-xs'>
              {linkItems.map((item) => (
                <LinkItem key={item.href} href={item.href} label={item.label} />
              ))}
            </div>
          ) : contact ? (
            <p className='text-xs text-neutral-500 mt-1'>{contact}</p>
          ) : null}
        </div>

        <div className='space-y-6'>
          {safeSections.map((section) => (
            <div key={section.title} className='space-y-3'>
              <div className='flex items-center gap-3'>
                <h3 className='text-[11px] font-mono uppercase tracking-[0.18em] text-neutral-400'>
                  {section.title}
                </h3>1
                <div className='h-px flex-1 bg-neutral-800' />
                <button
                  type='button'
                  className='rounded-md border border-neutral-700 bg-neutral-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-100 hover:bg-neutral-800'
                >
                  Edit
                </button>
              </div>

              <div className='space-y-4'>
                {section.items.map((item) => (
                  <div key={item.heading} className='space-y-1'>
                    <div className='flex items-baseline justify-between gap-4'>
                      <span className='text-sm font-semibold text-neutral-100'>{item.heading}</span>
                      <span className='text-[11px] text-neutral-500 whitespace-nowrap'>{item.meta}</span>
                    </div>
                    <ul className='list-disc list-inside text-[12px] text-neutral-400 space-y-1'>
                      {item.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className='mt-8 flex justify-end'>
          <button
            type='button'
            className='rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-100 hover:bg-neutral-800'
          >
            Add Section
          </button>
        </div>
      </div>
    </div>
  );
}
