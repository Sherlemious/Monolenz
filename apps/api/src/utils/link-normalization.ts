export const ALLOWED_LINK_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);

function hasExplicitProtocol(value: string): boolean {
  return /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(value);
}

function buildPrimaryPlatformPath(value: string, platformName: string): string {
  const cleaned = value.replace(/^\/+|\/+$/g, '');
  const bare = cleaned.replace(/^@/, '');

  if (!cleaned) {
    return cleaned;
  }

  if (cleaned.includes('/')) {
    return cleaned;
  }

  switch (platformName) {
    case 'linkedin':
      return `in/${bare}`;
    case 'tiktok':
    case 'youtube':
    case 'medium':
      return `@${bare}`;
    default:
      return cleaned;
  }
}

export function normalizeLinkInput(rawValue: string, platform?: { name: string; base_url: string | null }): string {
  const value = rawValue.trim();
  if (!value) {
    return value;
  }

  if (hasExplicitProtocol(value)) {
    return value;
  }

  if ((platform?.name === 'email' || !platform?.base_url) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return `mailto:${value}`;
  }

  if (platform?.base_url) {
    const baseUrl = new URL(platform.base_url);
    const candidate = value.startsWith('/')
      ? `${baseUrl.origin}${value}`
      : value.includes('.') || value.startsWith('www.')
        ? `https://${value.replace(/^\/+/, '')}`
        : null;

    if (candidate) {
      try {
        const parsed = new URL(candidate);
        if (parsed.hostname === baseUrl.hostname || parsed.hostname.endsWith(`.${baseUrl.hostname}`)) {
          const path = `${parsed.pathname}${parsed.search}${parsed.hash}`.replace(/^\/+/, '');
          return path ? `${baseUrl.origin}/${path}` : baseUrl.origin;
        }
        return parsed.toString();
      } catch {
        // Fall through to handle-style normalization.
      }
    }

    const normalizedPath = buildPrimaryPlatformPath(value, platform.name);
    return `${baseUrl.origin}/${normalizedPath}`;
  }

  return `https://${value.replace(/^\/+/, '')}`;
}
