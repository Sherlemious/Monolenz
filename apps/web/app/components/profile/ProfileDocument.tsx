/**
 * ProfileDocument — the single, résumé-style rendering of a profile.
 *
 * Used by the public page (/{username}), the dashboard overview and the
 * history preview so all three always look the same. Server-safe: no hooks.
 */

import type { Profile, VersionBlockDetail } from '@monolenz/types/entities';
import { cn } from '@/lib/utils';
import { formatMonthYear } from './block-display';

type Data = Record<string, unknown>;

// Display order and labels for each category
const SECTIONS: { type: string; label: string }[] = [
  { type: 'work_experience', label: 'Experience' },
  { type: 'project', label: 'Projects' },
  { type: 'education', label: 'Education' },
  { type: 'skill', label: 'Skills' },
  { type: 'certification', label: 'Certifications' },
  { type: 'award', label: 'Awards' },
  { type: 'volunteer', label: 'Volunteering' },
  { type: 'language', label: 'Languages' },
];

// ============================================================================
// Header
// ============================================================================

export function ProfileHeader({
  profile,
  children,
  className,
}: {
  profile: Profile;
  /** Actions rendered under the bio (e.g. copy link / print) */
  children?: React.ReactNode;
  className?: string;
}) {
  const links = getPublicLinks(profile);

  return (
    <header className={cn('flex flex-col sm:flex-row sm:items-start gap-5 sm:gap-6', className)}>
      <Avatar profile={profile} />
      <div className='min-w-0 flex-1'>
        <h1 className='font-serif text-[40px] print:text-[32px] leading-[1.05] tracking-[-0.01em] text-foreground break-words'>
          {profile.username}
        </h1>
        {profile.bio && (
          <p className='mt-3 text-[15px] leading-relaxed text-muted-foreground max-w-xl text-pretty'>{profile.bio}</p>
        )}
        {links.length > 0 && (
          <ul className='mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-[13px]'>
            {links.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-foreground underline decoration-border-strong underline-offset-4 hover:decoration-foreground transition-colors'
                >
                  {link.label}
                </a>
                {link.label !== prettyHost(link.url) && (
                  <span className='hidden print:inline text-muted-foreground'> ({prettyHost(link.url)})</span>
                )}
              </li>
            ))}
          </ul>
        )}
        {children}
      </div>
    </header>
  );
}

function Avatar({ profile }: { profile: Profile }) {
  if (profile.profile_picture_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- arbitrary user-supplied host
      <img
        src={profile.profile_picture_url}
        alt=''
        className='size-[72px] rounded-full object-cover ring-1 ring-border shrink-0'
      />
    );
  }
  return (
    <div
      aria-hidden
      className='size-[72px] rounded-full bg-secondary ring-1 ring-border flex items-center justify-center font-serif text-[32px] text-foreground shrink-0'
    >
      {profile.username.charAt(0).toUpperCase()}
    </div>
  );
}

// ============================================================================
// Sections
// ============================================================================

export function ProfileSections({
  blocks,
  showHidden = false,
  emptyMessage = 'Nothing here yet.',
}: {
  blocks: VersionBlockDetail[];
  /** Owner views: show hidden entries with a marker instead of dropping them */
  showHidden?: boolean;
  emptyMessage?: string;
}) {
  const visible = showHidden ? blocks : blocks.filter((b) => b.is_visible !== false);
  const byType = new Map<string, VersionBlockDetail[]>();
  for (const block of visible) {
    const list = byType.get(block.block_type as string) ?? [];
    list.push(block);
    byType.set(block.block_type as string, list);
  }

  const sections = SECTIONS.filter((s) => byType.has(s.type));
  if (sections.length === 0) {
    return <p className='py-16 text-center text-sm text-muted-foreground'>{emptyMessage}</p>;
  }

  return (
    <div className='space-y-12 print:space-y-7'>
      {sections.map(({ type, label }) => {
        const items = sortByDate(byType.get(type)!);
        return (
          <section key={type} className='break-inside-avoid-page'>
            <h2 className='mb-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
              {label}
              <span className='h-px flex-1 bg-border' />
            </h2>
            <SectionBody type={type} items={items} showHidden={showHidden} />
          </section>
        );
      })}
    </div>
  );
}

function SectionBody({ type, items, showHidden }: { type: string; items: VersionBlockDetail[]; showHidden: boolean }) {
  if (type === 'skill') return <SkillsList items={items} showHidden={showHidden} />;
  if (type === 'language') return <LanguagesList items={items} showHidden={showHidden} />;

  return (
    <ol className='space-y-8 print:space-y-4'>
      {items.map((block) => (
        <li key={block.id}>
          <Entry block={block} showHidden={showHidden} />
        </li>
      ))}
    </ol>
  );
}

// ============================================================================
// Timeline entry (experience, projects, education, certs, awards, volunteer)
// ============================================================================

function Entry({ block, showHidden }: { block: VersionBlockDetail; showHidden: boolean }) {
  const d = dataOf(block);
  const { title, subtitle, meta, href } = describe(block.block_type as string, d);
  const dates = dateRange(d);
  const description = str(d.description);
  const bullets = [...arr(d.achievements), ...arr(d.highlights)];
  const tags = arr(d.technologies);
  const hidden = block.is_visible === false;

  return (
    <article className={cn('grid gap-x-8 gap-y-1 sm:grid-cols-[9rem_1fr]', hidden && showHidden && 'opacity-55')}>
      <p className='hidden sm:block text-[13px] tabular-nums text-muted-foreground pt-[3px]'>{dates}</p>
      <div className='min-w-0'>
        <div className='flex flex-wrap items-baseline gap-x-2'>
          <h3 className='text-[15px] font-semibold text-foreground'>
            {href ? (
              <a
                href={href}
                target='_blank'
                rel='noopener noreferrer'
                className='hover:underline underline-offset-4 decoration-border-strong'
              >
                {title}
              </a>
            ) : (
              title
            )}
          </h3>
          {hidden && showHidden && <HiddenTag />}
        </div>
        {subtitle && <p className='text-[14px] text-foreground/80'>{subtitle}</p>}
        {dates && <p className='sm:hidden text-[13px] tabular-nums text-muted-foreground'>{dates}</p>}
        {meta && <p className='text-[13px] text-muted-foreground'>{meta}</p>}
        {description && (
          <p className='mt-2 text-[14px] leading-relaxed text-muted-foreground text-pretty whitespace-pre-line'>
            {description}
          </p>
        )}
        {bullets.length > 0 && (
          <ul className='mt-2 space-y-1 text-[14px] leading-relaxed text-muted-foreground print:list-disc print:pl-4 print:space-y-0.5'>
            {bullets.map((b, i) => (
              <li
                key={i}
                className='relative pl-4 before:absolute before:left-0 before:top-[0.7em] before:size-1 before:rounded-full before:bg-border-strong print:pl-0 print:before:hidden'
              >
                {b}
              </li>
            ))}
          </ul>
        )}
        {tags.length > 0 && (
          <ul className='mt-3 flex flex-wrap gap-1.5'>
            {tags.map((t) => (
              <li
                key={t}
                className='rounded-full border border-border px-2 py-0.5 text-[12px] text-muted-foreground print:border-0 print:px-0 print:after:content-[","] last:print:after:content-none'
              >
                {t}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

function describe(type: string, d: Data): { title: string; subtitle?: string; meta?: string; href?: string } {
  switch (type) {
    case 'work_experience':
      return {
        title: str(d.position_title) || str(d.company_name) || 'Role',
        subtitle: str(d.position_title) ? str(d.company_name) : undefined,
        meta: join([str(d.location), label(str(d.location_type)), label(str(d.employment_type))]),
        href: safeUrl(d.company_url),
      };
    case 'education':
      return {
        title: str(d.institution_name) || 'Education',
        subtitle: join([str(d.degree_name), str(d.field_of_study)], ', '),
        meta: join([str(d.location), d.gpa ? `GPA ${d.gpa}${d.gpa_scale ? ` / ${d.gpa_scale}` : ''}` : undefined]),
        href: safeUrl(d.institution_url),
      };
    case 'project':
      return {
        title: str(d.name) || 'Project',
        href: safeUrl(d.url) || safeUrl(d.repository_url),
      };
    case 'certification':
      return {
        title: str(d.name) || 'Certification',
        subtitle: str(d.issuing_organization),
        meta: str(d.credential_id) ? `Credential ${str(d.credential_id)}` : undefined,
        href: safeUrl(d.credential_url),
      };
    case 'award':
      return { title: str(d.title) || 'Award', subtitle: str(d.issuer), href: safeUrl(d.url) };
    case 'volunteer':
      return { title: str(d.role) || 'Volunteer', subtitle: str(d.organization_name), meta: str(d.cause) };
    default:
      return { title: str(d.title) || str(d.name) || 'Entry' };
  }
}

// ============================================================================
// Skills & languages (compact)
// ============================================================================

function SkillsList({ items, showHidden }: { items: VersionBlockDetail[]; showHidden: boolean }) {
  const groups = new Map<string, VersionBlockDetail[]>();
  for (const b of items) {
    const cat = str(dataOf(b).category) || 'Other';
    groups.set(cat, [...(groups.get(cat) ?? []), b]);
  }
  return (
    <dl className='space-y-3'>
      {Array.from(groups.entries()).map(([cat, skills]) => (
        <div key={cat} className='grid gap-x-8 gap-y-1.5 sm:grid-cols-[9rem_1fr]'>
          <dt className='text-[13px] text-muted-foreground sm:pt-[3px]'>{cat}</dt>
          <dd className='flex flex-wrap gap-1.5'>
            {skills.map((b) => {
              const d = dataOf(b);
              const hidden = b.is_visible === false;
              return (
                <span
                  key={b.id}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-0.5 text-[13px] text-foreground',
                    hidden && showHidden && 'border-dashed opacity-55'
                  )}
                  title={hidden && showHidden ? 'Hidden from your public page' : undefined}
                >
                  {str(d.name)}
                  {str(d.proficiency_level) && (
                    <span className='text-[11px] text-muted-foreground'>{label(str(d.proficiency_level))}</span>
                  )}
                </span>
              );
            })}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function LanguagesList({ items, showHidden }: { items: VersionBlockDetail[]; showHidden: boolean }) {
  return (
    <ul className='grid gap-x-8 gap-y-2 sm:grid-cols-2'>
      {items.map((b) => {
        const d = dataOf(b);
        const hidden = b.is_visible === false;
        return (
          <li
            key={b.id}
            className={cn(
              'flex items-baseline justify-between gap-3 border-b border-dashed border-border pb-2',
              hidden && showHidden && 'opacity-55'
            )}
          >
            <span className='text-[14px] font-medium text-foreground'>
              {str(d.language)} {hidden && showHidden && <HiddenTag />}
            </span>
            <span className='text-[13px] text-muted-foreground'>{label(str(d.proficiency))}</span>
          </li>
        );
      })}
    </ul>
  );
}

function HiddenTag() {
  return (
    <span className='inline-flex items-center rounded-full bg-secondary px-1.5 text-[10.5px] font-medium text-muted-foreground align-middle'>
      Hidden
    </span>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function dataOf(block: VersionBlockDetail): Data {
  return (block.data ?? {}) as unknown as Data;
}

function str(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim() ? v.trim() : undefined;
}

function arr(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.trim() !== '') : [];
}

function join(parts: (string | undefined)[], sep = ' · '): string | undefined {
  const out = parts.filter(Boolean).join(sep);
  return out || undefined;
}

function label(v?: string): string | undefined {
  if (!v) return undefined;
  const pretty = v.replace(/[-_]/g, ' ');
  return pretty.charAt(0).toUpperCase() + pretty.slice(1);
}

function safeUrl(v: unknown): string | undefined {
  const s = str(v);
  if (!s) return undefined;
  try {
    const { protocol } = new URL(s);
    return protocol === 'http:' || protocol === 'https:' ? s : undefined;
  } catch {
    return undefined;
  }
}

function dateRange(d: Data): string {
  const start = str(d.start_date) || str(d.issue_date) || str(d.date_received);
  const end = str(d.end_date) || str(d.expiration_date);
  const current = d.is_current === true || d.is_ongoing === true;
  if (!start) return end ? formatMonthYear(end) : '';
  const s = formatMonthYear(start);
  if (current) return `${s} — Present`;
  if (end) return `${s} — ${formatMonthYear(end)}`;
  return s;
}

function sortKey(b: VersionBlockDetail): number {
  const d = dataOf(b);
  if (d.is_current === true || d.is_ongoing === true) return Number.MAX_SAFE_INTEGER;
  const raw = str(d.end_date) || str(d.start_date) || str(d.issue_date) || str(d.date_received);
  const t = raw ? new Date(raw).getTime() : NaN;
  return Number.isNaN(t) ? -1 : t;
}

/** Newest first; entries without dates keep their saved order at the end */
function sortByDate(items: VersionBlockDetail[]): VersionBlockDetail[] {
  return items
    .map((b, i) => ({ b, i, k: sortKey(b) }))
    .sort((x, y) => y.k - x.k || (x.b.sort_order ?? 0) - (y.b.sort_order ?? 0) || x.i - y.i)
    .map((x) => x.b);
}

function getPublicLinks(profile: Profile): { url: string; label: string }[] {
  if (profile.profile_links && profile.profile_links.length > 0) {
    return profile.profile_links
      .filter((l) => l.is_public !== false && safeUrlOrMail(l.url))
      .map((l) => ({ url: l.url, label: l.label || l.link_platforms?.display_name || prettyHost(l.url) }));
  }
  return [
    { url: profile.linkedin_url, label: 'LinkedIn' },
    { url: profile.github_url, label: 'GitHub' },
    { url: profile.portfolio_url, label: profile.portfolio_url ? prettyHost(profile.portfolio_url) : 'Website' },
  ].filter((l): l is { url: string; label: string } => Boolean(l.url && safeUrlOrMail(l.url)));
}

function safeUrlOrMail(v: string): boolean {
  try {
    const { protocol } = new URL(v);
    return protocol === 'http:' || protocol === 'https:' || protocol === 'mailto:';
  } catch {
    return false;
  }
}

function prettyHost(v: string): string {
  try {
    const u = new URL(v);
    if (u.protocol === 'mailto:') return u.pathname;
    return u.hostname.replace(/^www\./, '');
  } catch {
    return v;
  }
}
