import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import type { Profile, VersionBlockDetail } from '@monolenz/types/entities';
import { createServerApiClient } from '@/lib/api/server';
import { createProfileApi } from '@/lib/api/profile';

// ============================================================================
// Metadata
// ============================================================================

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const client = await createServerApiClient();
  const profileApi = createProfileApi(client);
  const profile = await profileApi.getPublicProfile(username);

  if (!profile) {
    return { title: 'Profile Not Found | Monolenz' };
  }

  return {
    title: `${profile.username} | Monolenz`,
    description: profile.bio ?? `${profile.username}'s professional profile on Monolenz`,
  };
}

// ============================================================================
// Page
// ============================================================================

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params;
  const client = await createServerApiClient();
  const profileApi = createProfileApi(client);

  const [profile, latestVersion] = await Promise.all([
    profileApi.getPublicProfile(username),
    profileApi.getLatestVersion(username),
  ]);

  if (!profile) {
    notFound();
  }

  const blocks = (latestVersion?.blocks ?? []).filter((b) => b.is_visible !== false);

  return <PublicProfileView profile={profile} blocks={blocks} />;
}

// ============================================================================
// Block Type Metadata
// ============================================================================

const BLOCK_TYPE_META: Record<string, { label: string; accent: string; bgAccent: string }> = {
  work_experience: { label: 'Experience', accent: 'border-l-blue-400', bgAccent: 'bg-blue-500/10' },
  education: { label: 'Education', accent: 'border-l-purple-400', bgAccent: 'bg-purple-500/10' },
  skill: { label: 'Skills', accent: 'border-l-amber-400', bgAccent: 'bg-amber-500/10' },
  project: { label: 'Projects', accent: 'border-l-emerald-400', bgAccent: 'bg-emerald-500/10' },
  certification: { label: 'Certifications', accent: 'border-l-orange-400', bgAccent: 'bg-orange-500/10' },
  language: { label: 'Languages', accent: 'border-l-cyan-400', bgAccent: 'bg-cyan-500/10' },
  volunteer: { label: 'Volunteer', accent: 'border-l-pink-400', bgAccent: 'bg-pink-500/10' },
  award: { label: 'Awards', accent: 'border-l-yellow-400', bgAccent: 'bg-yellow-500/10' },
};

// ============================================================================
// Public Profile View
// ============================================================================

function PublicProfileView({ profile, blocks }: { profile: Profile; blocks: VersionBlockDetail[] }) {
  return (
    <div className='min-h-screen bg-background'>
      {/* Hero */}
      <header className='border-b bg-card'>
        <div className='max-w-3xl mx-auto px-6 py-12'>
          <div className='flex items-start gap-5'>
            {profile.profile_picture_url ? (
              <img
                src={profile.profile_picture_url}
                alt={profile.username}
                className='size-20 rounded-2xl object-cover border-2 border-border shadow-sm shrink-0'
              />
            ) : (
              <div className='size-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold shrink-0'>
                {profile.username.charAt(0).toUpperCase()}
              </div>
            )}

            <div className='min-w-0'>
              <h1 className='text-2xl font-bold tracking-tight'>@{profile.username}</h1>
              {profile.bio && (
                <p className='text-sm text-muted-foreground mt-1.5 max-w-lg leading-relaxed'>{profile.bio}</p>
              )}
              <ProfileLinks profile={profile} />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className='max-w-3xl mx-auto px-6 py-10'>
        {blocks.length === 0 ? (
          <div className='flex flex-col items-center justify-center text-center py-20'>
            <p className='text-muted-foreground text-sm'>This profile doesn&apos;t have any content yet.</p>
          </div>
        ) : (
          <ContentSections blocks={blocks} />
        )}
      </main>

      {/* Footer */}
      <footer className='border-t py-6 text-center'>
        <Link
          href='/'
          className='text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors'
        >
          Built with Monolenz
        </Link>
      </footer>
    </div>
  );
}

// ============================================================================
// Profile Links
// ============================================================================

function ProfileLinks({ profile }: { profile: Profile }) {
  // Prefer the new profile_links array when available
  if (profile.profile_links && profile.profile_links.length > 0) {
    const links = profile.profile_links.filter((l) => l.is_public !== false);
    if (links.length === 0) return null;
    return (
      <div className='flex flex-wrap gap-2 mt-3'>
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1.5 rounded-md hover:text-foreground hover:bg-accent transition-colors'
          >
            {link.label || link.link_platforms?.display_name || 'Link'}
          </a>
        ))}
      </div>
    );
  }

  // Fall back to legacy hard-coded fields
  const links = [
    { url: profile.linkedin_url, label: 'LinkedIn' },
    { url: profile.github_url, label: 'GitHub' },
    { url: profile.portfolio_url, label: 'Portfolio' },
  ].filter((l) => l.url);

  if (links.length === 0) return null;

  return (
    <div className='flex gap-2 mt-3'>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.url!}
          target='_blank'
          rel='noopener noreferrer'
          className='inline-flex items-center text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1.5 rounded-md hover:text-foreground hover:bg-accent transition-colors'
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}

// ============================================================================
// Content Sections
// ============================================================================

function ContentSections({ blocks }: { blocks: VersionBlockDetail[] }) {
  const byCategory = new Map<string, VersionBlockDetail[]>();

  for (const block of blocks) {
    const type = block.block_type as string;
    const meta = BLOCK_TYPE_META[type];
    const category = meta?.label ?? 'Other';
    if (!byCategory.has(category)) byCategory.set(category, []);
    byCategory.get(category)!.push(block);
  }

  return (
    <div className='space-y-10'>
      {Array.from(byCategory.entries()).map(([category, categoryBlocks]) => (
        <section key={category}>
          <h2 className='text-sm font-semibold text-foreground uppercase tracking-wider mb-4 pb-3 border-b'>
            {category}
          </h2>
          <div className='space-y-3'>
            {categoryBlocks.map((block) => (
              <BlockCard key={block.id} block={block} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

// ============================================================================
// Block Card
// ============================================================================

function BlockCard({ block }: { block: VersionBlockDetail }) {
  const title = getBlockTitle(block);
  const subtitle = getBlockSubtitle(block);
  const dates = getBlockDates(block);
  const description = getBlockDescription(block);
  const meta = BLOCK_TYPE_META[block.block_type as string];

  return (
    <article
      className={`bg-card border rounded-xl p-5 border-l-[3px] ${meta?.accent ?? 'border-l-muted'}`}
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <h3 className='font-semibold text-[15px]'>{title}</h3>
          {subtitle && <p className='text-sm text-muted-foreground mt-0.5'>{subtitle}</p>}
        </div>
      </div>
      {dates && <p className='text-xs text-muted-foreground mt-2'>{dates}</p>}
      {description && (
        <p className='text-sm text-muted-foreground mt-3 leading-relaxed'>{description}</p>
      )}
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
  const bt = block.block_type as string;

  switch (bt) {
    case 'work_experience': {
      const parts: string[] = [];
      if (data.position_title && data.company_name)
        parts.push(`${data.position_title} at ${data.company_name}`);
      else if (data.position_title) parts.push(data.position_title as string);
      if (data.location) parts.push(data.location as string);
      return parts.length > 0 ? parts.join(' \u00b7 ') : null;
    }
    case 'education': {
      const parts: string[] = [];
      if (data.degree_name) parts.push(data.degree_name as string);
      if (data.field_of_study) parts.push(data.field_of_study as string);
      return parts.length > 0 ? parts.join(' - ') : null;
    }
    case 'skill':
      return [data.category, data.proficiency_level].filter(Boolean).join(' \u00b7 ') || null;
    case 'certification':
      return (data.issuing_organization as string) ?? null;
    case 'language':
      return (data.proficiency as string) ?? null;
    case 'volunteer': {
      const parts: string[] = [];
      if (data.role) parts.push(data.role as string);
      if (data.cause) parts.push(data.cause as string);
      return parts.length > 0 ? parts.join(' \u00b7 ') : null;
    }
    case 'award':
      return (data.issuer as string) ?? null;
    default:
      return null;
  }
}

function getBlockDates(block: VersionBlockDetail): string | null {
  const data = block.data as unknown as Record<string, unknown>;
  const start = data.start_date || data.issue_date || data.date_received;
  const end = data.end_date || data.expiration_date;
  const current = data.is_current || data.is_ongoing;

  if (!start) return null;
  const startStr = formatDate(start as string);
  if (current) return `${startStr} \u2192 Present`;
  if (end) return `${startStr} \u2192 ${formatDate(end as string)}`;
  return startStr;
}

function getBlockDescription(block: VersionBlockDetail): string | null {
  const data = block.data as unknown as Record<string, unknown>;
  const desc = data.description;
  if (desc && typeof desc === 'string') return desc;
  return null;
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
