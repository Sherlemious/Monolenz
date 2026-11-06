import { z } from 'zod';

/**
 * Profile validation schemas - shared between frontend and backend
 */

export const PROFILE_THEME_IDS = ['default', 'midnight', 'ocean', 'forest', 'sunset'] as const;
export type ProfileThemeId = (typeof PROFILE_THEME_IDS)[number];

export const RESERVED_USERNAMES = [
  'login',
  'signup',
  'dashboard',
  'health',
  'ping',
  'api',
  'auth',
  'error',
  'admin',
  'settings',
  'forgot-password',
  'reset-password',
  'pricing',
  'features',
  'about',
  'me',
  'public',
  'search',
  'username',
  'platforms',
  'app',
  'static',
  'favicon',
  'robots',
  'sitemap',
  'resumes',
] as const;

export function isReservedUsername(username: string): boolean {
  return (RESERVED_USERNAMES as readonly string[]).includes(username.toLowerCase());
}

export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(50, 'Username must be less than 50 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
  .refine((val) => !isReservedUsername(val), 'This username is reserved');

// ----------------------------------------------------------------------------
// URL normalisation
// GitHub and LinkedIn are entered as a username only; we store the canonical
// profile URL. Pasting a full profile link still works (the handle is pulled
// out). Other links accept "www.site.com" and get https:// added.
// ----------------------------------------------------------------------------

export type ProfileUrlKind = 'linkedin' | 'github' | 'portfolio' | 'image';
export type SocialKind = 'linkedin' | 'github';

export const SOCIAL_PROFILES: Record<
  SocialKind,
  { base: string; prefix: string; hosts: string[]; pathPrefix: string; pattern: RegExp; hint: string }
> = {
  github: {
    base: 'https://github.com/',
    prefix: 'github.com/',
    hosts: ['github.com'],
    pathPrefix: '',
    // GitHub: alphanumerics and single hyphens, max 39 chars
    pattern: /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/,
    hint: 'Letters, numbers and hyphens',
  },
  linkedin: {
    base: 'https://www.linkedin.com/in/',
    prefix: 'linkedin.com/in/',
    hosts: ['linkedin.com'],
    pathPrefix: 'in/',
    // LinkedIn custom URLs: 3–100 letters, numbers, hyphens (older ones may have underscores / encoded chars)
    pattern: /^[A-Za-z0-9][A-Za-z0-9_%-]{2,99}$/,
    hint: 'Letters, numbers and hyphens',
  },
};

export function isSocialKind(kind: ProfileUrlKind): kind is SocialKind {
  return kind === 'github' || kind === 'linkedin';
}

/**
 * Pull the username out of whatever was typed: "me", "@me", "github.com/me",
 * "https://www.linkedin.com/in/me/?trk=x". Returns '' for blank input and null
 * when it isn't a valid username / profile link for that network.
 */
export function extractSocialHandle(input: string, kind: SocialKind): string | null {
  const value = input.trim();
  if (!value) return '';
  const cfg = SOCIAL_PROFILES[kind];

  let handle = value.replace(/^@/, '');
  if (/[/.:]/.test(handle)) {
    try {
      const url = new URL(/^https?:\/\//i.test(handle) ? handle : `https://${handle.replace(/^\/+/, '')}`);
      const host = url.hostname.toLowerCase().replace(/^(www|[a-z]{2})\./, '');
      if (!cfg.hosts.includes(host)) return null;
      let path = url.pathname.replace(/^\/+/, '');
      if (cfg.pathPrefix) {
        if (!path.toLowerCase().startsWith(cfg.pathPrefix)) return null;
        path = path.slice(cfg.pathPrefix.length);
      }
      handle = path.split('/')[0] ?? '';
    } catch {
      return null;
    }
  }
  return cfg.pattern.test(handle) ? handle : null;
}

export function buildSocialUrl(handle: string, kind: SocialKind): string {
  return handle ? `${SOCIAL_PROFILES[kind].base}${handle}` : '';
}

/**
 * Turn whatever the user typed into a full URL. Returns '' for blank input and
 * returns the input unchanged (trimmed) when it can't be made sensible, so the
 * validator can report it.
 */
export function normalizeProfileUrl(input: string, kind: ProfileUrlKind = 'portfolio'): string {
  const value = input.trim();
  if (!value) return '';

  if (isSocialKind(kind)) {
    const handle = extractSocialHandle(value, kind);
    return handle ? buildSocialUrl(handle, kind) : value;
  }

  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('//')) return `https:${value}`;
  // Some other explicit scheme (mailto:, ftp:, javascript:) — leave for the validator to reject
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) return value;
  return `https://${value}`;
}

/** True if the value (after normalisation) is a valid link for that field. */
export function isValidProfileUrl(value: string, kind: ProfileUrlKind = 'portfolio'): boolean {
  if (isSocialKind(kind)) {
    const handle = extractSocialHandle(value, kind);
    return !!handle && value === buildSocialUrl(handle, kind);
  }
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    const host = url.hostname;
    return host === 'localhost' || /^[^.\s]+(\.[^.\s]+)+$/.test(host);
  } catch {
    return false;
  }
}

const URL_LABELS: Record<ProfileUrlKind, string> = {
  linkedin: 'LinkedIn username',
  github: 'GitHub username',
  portfolio: 'portfolio URL',
  image: 'profile picture URL',
};

/**
 * Optional URL field. Blank stays '' (the API turns '' into null, which is how
 * a link gets cleared); anything else is normalised then validated.
 */
const profileUrlField = (kind: ProfileUrlKind) =>
  z.preprocess(
    (val) => (typeof val === 'string' ? normalizeProfileUrl(val, kind) : val),
    z
      .string()
      .max(2048, 'URL is too long')
      .refine((val) => val === '' || isValidProfileUrl(val, kind), `Invalid ${URL_LABELS[kind]}`)
      .optional()
  );

/** Same as profileUrlField but blank becomes undefined (for create-style forms). */
const profileUrlFormField = (kind: ProfileUrlKind) => profileUrlField(kind).transform((val) => (val ? val : undefined));

// Base profile data validation
const optionalTrimmedText = (max: number, label: string) =>
  z
    .string()
    .max(max, `${label} must be less than ${max} characters`)
    .transform((val) => val.trim() || undefined)
    .optional();

export const profileDataSchema = z.object({
  username: usernameSchema,
  display_name: z.string().max(255, 'Display name must be less than 255 characters').optional(),
  phone: z.string().max(50, 'Phone must be less than 50 characters').optional(),
  location: z.string().max(255, 'Location must be less than 255 characters').optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  profile_picture_url: profileUrlField('image'),
  linkedin_url: profileUrlField('linkedin'),
  github_url: profileUrlField('github'),
  portfolio_url: profileUrlField('portfolio'),
  theme: z.enum(PROFILE_THEME_IDS).optional(),
});

// Profile schemas for different use cases
export const profileSchemas = {
  // For creating a new profile (all fields required except optional ones)
  create: profileDataSchema.required({
    username: true,
  }),

  // For updating a profile (all fields optional)
  update: profileDataSchema.partial(),

  // For frontend forms - with better UX (empty strings transformed to undefined)
  createForm: profileDataSchema
    .extend({
      display_name: optionalTrimmedText(255, 'Display name'),
      phone: optionalTrimmedText(50, 'Phone'),
      location: optionalTrimmedText(255, 'Location'),
      bio: z
        .string()
        .transform((val) => val.trim() || undefined)
        .optional(),
      profile_picture_url: profileUrlFormField('image'),
      linkedin_url: profileUrlFormField('linkedin'),
      github_url: profileUrlFormField('github'),
      portfolio_url: profileUrlFormField('portfolio'),
    })
    .required({
      username: true,
    }),

  updateForm: profileDataSchema
    .extend({
      display_name: optionalTrimmedText(255, 'Display name'),
      phone: optionalTrimmedText(50, 'Phone'),
      location: optionalTrimmedText(255, 'Location'),
      bio: z
        .string()
        .transform((val) => val.trim() || undefined)
        .optional(),
      profile_picture_url: profileUrlFormField('image'),
      linkedin_url: profileUrlFormField('linkedin'),
      github_url: profileUrlFormField('github'),
      portfolio_url: profileUrlFormField('portfolio'),
    })
    .partial(),

  // For API responses (includes metadata)
  response: profileDataSchema.extend({
    id: z.string().uuid(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
  }),

  // Public profile (subset of fields)
  public: profileDataSchema.pick({
    username: true,
    display_name: true,
    location: true,
    bio: true,
    portfolio_url: true,
  }),
};

// Profile search and filtering
export const profileFilterSchemas = {
  // API query filters
  query: z.object({
    username: z.string().optional(),
    has_bio: z.enum(['true', 'false']).optional(),
    verified: z.enum(['true', 'false']).optional(),
  }),

  // Frontend filter form
  form: z.object({
    search: z.string().optional(),
    hasPortfolio: z.boolean().optional(),
    verified: z.boolean().optional(),
  }),
};
