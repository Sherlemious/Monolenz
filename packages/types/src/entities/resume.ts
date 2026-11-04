import type { VersionBlockDetail } from './blocks';

export const RESUME_TEMPLATE_IDS = ['professional', 'jake'] as const;
export type ResumeTemplateId = (typeof RESUME_TEMPLATE_IDS)[number];

export interface Resume {
  id: string;
  profile_id: string;
  name: string;
  template_id: ResumeTemplateId;
  source_version_id?: number | null;
  created_at: string;
  updated_at: string;
}

export interface ResumeHeaderLink {
  label: string;
  url: string;
}

export interface ResumeHeader {
  display_name: string;
  username: string;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  links: ResumeHeaderLink[];
}

export interface ResumeDetail extends Resume {
  blocks: VersionBlockDetail[];
  header: ResumeHeader;
}

export interface TailorBullet {
  text: string;
  recommended: boolean;
}

export interface TailorProposalEntry {
  source_block_id: number;
  include: boolean;
  reason?: string | null;
  bullets: TailorBullet[];
}

export interface TailorProposal {
  suggested_name: string;
  entries: TailorProposalEntry[];
}

export interface TailorApplySelection {
  source_block_id: number;
  bullets?: string[];
}
