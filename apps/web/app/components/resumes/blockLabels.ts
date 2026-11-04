import type { VersionBlockDetail } from '@monolenz/types/entities';

const SECTION_LABELS: Record<string, string> = {
  work_experience: 'Experience',
  education: 'Education',
  skill: 'Skills',
  project: 'Projects',
  certification: 'Certifications',
  language: 'Languages',
  volunteer: 'Volunteer',
  award: 'Awards',
};

export function formatBlockType(blockType: string): string {
  return SECTION_LABELS[blockType] ?? blockType.replace(/_/g, ' ');
}

export function getBlockTitle(block: VersionBlockDetail): string {
  const data = block.data as unknown as Record<string, unknown>;
  return String(
    data.title ||
      data.name ||
      data.position_title ||
      data.company_name ||
      data.institution_name ||
      data.organization_name ||
      data.language ||
      data.degree_name ||
      formatBlockType(String(block.block_type))
  );
}

export function getBlockSubtitle(block: VersionBlockDetail): string | null {
  const data = block.data as unknown as Record<string, unknown>;
  switch (String(block.block_type)) {
    case 'work_experience':
      return [data.company_name, data.location].filter(Boolean).join(' · ') || null;
    case 'education':
      return [data.degree_name, data.field_of_study].filter(Boolean).join(' · ') || null;
    case 'skill':
      return (data.category as string) || null;
    case 'certification':
      return (data.issuing_organization as string) || null;
    case 'language':
      return (data.proficiency as string) || null;
    case 'volunteer':
      return (data.organization_name as string) || null;
    case 'award':
      return (data.issuer as string) || null;
    default:
      return null;
  }
}

export function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
