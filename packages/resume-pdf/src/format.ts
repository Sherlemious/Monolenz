import type { VersionBlockDetail } from '@monolenz/types/entities';

export const SECTION_LABELS: Record<string, string> = {
  work_experience: 'Experience',
  education: 'Education',
  skill: 'Skills',
  project: 'Projects',
  certification: 'Certifications',
  language: 'Languages',
  volunteer: 'Volunteer',
  award: 'Awards',
};

export function dataOf(block: VersionBlockDetail): Record<string, unknown> {
  return (block.data ?? {}) as unknown as Record<string, unknown>;
}

export function asString(value: unknown): string {
  if (value == null) return '';
  return String(value).trim();
}

export function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => asString(item)).filter(Boolean);
}

export function formatMonthYear(value: unknown): string {
  if (value == null || value === '') return '';
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return asString(value);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function formatDateRange(start: unknown, end: unknown, isCurrent?: unknown): string {
  const startStr = formatMonthYear(start);
  if (!startStr) return formatMonthYear(end);
  if (isCurrent) return `${startStr} – Present`;
  const endStr = formatMonthYear(end);
  return endStr ? `${startStr} – ${endStr}` : startStr;
}

export function displayUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.host}${parsed.pathname}`.replace(/\/$/, '');
  } catch {
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }
}

export interface BlockSection {
  type: string;
  label: string;
  blocks: VersionBlockDetail[];
}

export function groupBlocksByType(blocks: VersionBlockDetail[]): BlockSection[] {
  const order: string[] = [];
  const groups = new Map<string, VersionBlockDetail[]>();

  for (const block of blocks) {
    const type = String(block.block_type);
    if (!groups.has(type)) {
      order.push(type);
      groups.set(type, []);
    }
    groups.get(type)!.push(block);
  }

  return order.map((type) => ({
    type,
    label: SECTION_LABELS[type] ?? type.replace(/_/g, ' '),
    blocks: groups.get(type)!,
  }));
}

export function skillLines(blocks: VersionBlockDetail[]): string[] {
  const byCategory = new Map<string, string[]>();
  for (const block of blocks) {
    const data = dataOf(block);
    const name = asString(data.name);
    if (!name) continue;
    const category = asString(data.category) || 'Skills';
    const list = byCategory.get(category) ?? [];
    list.push(name);
    byCategory.set(category, list);
  }
  return Array.from(byCategory.entries()).map(([category, names]) => `${category}: ${names.join(', ')}`);
}

export function languageLine(blocks: VersionBlockDetail[]): string {
  return blocks
    .map((block) => {
      const data = dataOf(block);
      const language = asString(data.language);
      const proficiency = asString(data.proficiency);
      if (!language) return '';
      return proficiency ? `${language} (${proficiency})` : language;
    })
    .filter(Boolean)
    .join(' · ');
}
