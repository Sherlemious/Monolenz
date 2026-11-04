import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import type { Profile, VersionBlockDetail } from '@monolenz/types/entities';
import { createServerApiClient } from '@/lib/api/server';
import { createProfileApi } from '@/lib/api/profile';
import { getTheme } from '@/lib/themes';
import { ProfileToolbar } from './ProfileToolbar';
import { ProfileHeader, ProfileSections } from '@/app/components/profile/ProfileDocument';

function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://monolenz.sherlemious.com').replace(/\/$/, '');
}

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

  const title = `${profile.username} | Monolenz`;
  const description = profile.bio ?? `${profile.username}'s professional profile on Monolenz`;
  const siteUrl = getSiteUrl();
  const url = siteUrl ? `${siteUrl}/${profile.username}` : undefined;

  return {
    title,
    description,
    alternates: url ? { canonical: url } : undefined,
    openGraph: {
      title,
      description,
      url,
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
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
// Public Profile View
// ============================================================================

function PublicProfileView({ profile, blocks }: { profile: Profile; blocks: VersionBlockDetail[] }) {
  const theme = getTheme(profile.theme);
  return (
    <div
      className='min-h-screen bg-background text-foreground print:bg-white'
      style={theme.cssVars as React.CSSProperties}
    >
      <ProfileToolbar username={profile.username} />

      <main className='mx-auto max-w-3xl px-5 sm:px-8 pt-10 sm:pt-16 pb-20 print:p-0 print:max-w-none'>
        <ProfileHeader profile={profile} />
        <div className='mt-14 print:mt-8'>
          <ProfileSections blocks={blocks} emptyMessage='This profile doesn\u2019t have any public entries yet.' />
        </div>
      </main>

      <footer className='print:hidden border-t'>
        <div className='mx-auto max-w-3xl px-5 sm:px-8 py-6 flex items-center justify-between text-xs text-muted-foreground'>
          <span>/{profile.username}</span>
          <Link href='/' className='inline-flex items-center gap-1.5 hover:text-foreground transition-colors'>
            <span className='size-1.5 rounded-full bg-brand' aria-hidden />
            Made with Monolenz
          </Link>
        </div>
      </footer>
    </div>
  );
}
