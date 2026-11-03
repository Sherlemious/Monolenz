/**
 * Shared display helpers for rendering profile entries (read-only views).
 */

import type { VersionBlockDetail } from '@monolenz/types/entities';

export const BLOCK_TYPE_META: Record<string, { label: string; accent: string }> = {
  work_experience: { label: 'Experience', accent: 'border-l-blue-400' },
  education: { label: 'Education', accent: 'border-l-purple-400' },
  skill: { label: 'Skills', accent: 'border-l-amber-400' },
  project: { label: 'Projects', accent: 'border-l-emerald-400' },
  certification: { label: 'Certifications', accent: 'border-l-orange-400' },
  language: { label: 'Languages', accent: 'border-l-cyan-400' },
  volunteer: { label: 'Volunteer', accent: 'border-l-pink-400' },
  award: { label: 'Awards', accent: 'border-l-yellow-400' },
};

export function groupBlocksByCategory(blocks: VersionBlockDetail[]): Map<string, VersionBlockDetail[]> {
  const byCategory = new Map<string, VersionBlockDetail[]>();
  for (const block of blocks) {
    const category = BLOCK_TYPE_META[block.block_type as string]?.label ?? 'Other';
    if (!byCategory.has(category)) byCategory.set(category, []);
    byCategory.get(category)!.push(block);
  }
  return byCategory;
}

export function getBlockTitle(block: VersionBlockDetail): string {
  const data = (block.data ?? {}) as unknown as Record<string, unknown>;
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

export function getBlockSubtitle(block: VersionBlockDetail): string | null {
  const data = (block.data ?? {}) as unknown as Record<string, unknown>;
  return (data.position_title ||
    data.degree_name ||
    data.issuing_organization ||
    data.role ||
    data.proficiency ||
    data.proficiency_level ||
    data.category ||
    null) as string | null;
}

export function getBlockDates(block: VersionBlockDetail): string | null {
  const data = (block.data ?? {}) as unknown as Record<string, unknown>;
  const start = data.start_date || data.issue_date || data.date_received;
  const end = data.end_date || data.expiration_date;
  const current = data.is_current || data.is_ongoing;

  if (!start) return null;
  const startStr = formatMonthYear(start as string);
  if (current) return `${startStr} → Present`;
  if (end) return `${startStr} → ${formatMonthYear(end as string)}`;
  return startStr;
}

export function formatMonthYear(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function formatBlockType(blockType: string): string {
  return blockType
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
