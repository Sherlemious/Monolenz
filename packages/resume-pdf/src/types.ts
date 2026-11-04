import type { ResumeHeader, ResumeTemplateId, VersionBlockDetail } from '@monolenz/types/entities';

export interface ResumePdfInput {
  templateId: ResumeTemplateId;
  header: ResumeHeader;
  blocks: VersionBlockDetail[];
}
