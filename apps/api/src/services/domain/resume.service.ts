import { PrismaClient } from '@prisma/client';
import { HTTP_STATUS_CODES } from '@monolenz/types/api';
import type {
  Resume,
  ResumeDetail,
  ResumeHeader,
  ResumeTemplateId,
  TailorProposal,
  VersionBlockDetail,
} from '@monolenz/types/entities';
import type {
  ResumeCreateInput,
  ResumeTailorApplyInput,
  ResumeTailorInput,
  ResumeUpdateInput,
} from '@monolenz/types/validation/resume-schemas';
import { renderResumePdf } from '@monolenz/resume-pdf/server';
import { completeJson, isLlmConfigured } from '../external/llm.client';
import { ServiceContext, ServiceError } from '../base.service';
import { ProfileBlockService } from './profile-block.service';
import {
  TAILOR_SYSTEM_PROMPT,
  bulletListField,
  cloneBlockData,
  compactResumeForLlm,
  reconcileProposal,
} from './resume-tailor';
import { VersionsRepository } from '../../repositories/profile/versions.repository';
import { VersionBlocksRepository } from '../../repositories/profile/version-blocks.repository';
import { ResumeRepository, ResumeBlockRecord, ResumeRecord } from '../../repositories/profile/resume.repository';

function toIso(value: Date | string | null | undefined): string {
  if (!value) return new Date().toISOString();
  if (value instanceof Date) return value.toISOString();
  return value;
}

function serializeResume(record: ResumeRecord): Resume {
  return {
    id: record.id,
    profile_id: record.profile_id,
    name: record.name,
    template_id: record.template_id as ResumeTemplateId,
    source_version_id: record.source_version_id,
    created_at: toIso(record.created_at),
    updated_at: toIso(record.updated_at),
  };
}

function linkLabel(link: {
  url: string;
  label?: string | null;
  link_platforms?: { display_name?: string | null } | null;
}): string {
  if (link.label?.trim()) return link.label.trim();
  if (link.link_platforms?.display_name) return link.link_platforms.display_name;
  try {
    return new URL(link.url).hostname.replace(/^www\./, '');
  } catch {
    return link.url;
  }
}

export class ResumeService {
  constructor(
    private readonly resumeRepo: ResumeRepository,
    private readonly blockService: ProfileBlockService,
    private readonly versionsRepo: VersionsRepository,
    private readonly versionBlocksRepo: VersionBlocksRepository,
    private readonly prisma: PrismaClient
  ) {}

  async listMine(context: ServiceContext): Promise<Resume[]> {
    const profileId = this.requireUser(context);
    await this.assertProfileExists(profileId);
    const rows = await this.resumeRepo.listByProfileId(profileId);
    return rows.map(serializeResume);
  }

  async getMine(id: string, context: ServiceContext): Promise<ResumeDetail> {
    const profileId = this.requireUser(context);
    const record = await this.requireOwnedResume(id, profileId);
    return this.toDetail(record);
  }

  async createMine(input: ResumeCreateInput, context: ServiceContext): Promise<ResumeDetail> {
    const profileId = this.requireUser(context);
    await this.assertProfileExists(profileId);

    const latest = await this.versionsRepo.getLatestVersionForProfile(profileId);
    if (!latest) {
      throw new ServiceError(
        'Add some profile content before creating a resume',
        null,
        HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY
      );
    }

    const versionBlocks = await this.versionBlocksRepo.listVersionBlocks(latest.id);
    const composition = this.resolveCreateBlocks(input.block_ids, versionBlocks);

    const record = await this.resumeRepo.create({
      profile_id: profileId,
      name: input.name?.trim() || 'Untitled resume',
      template_id: input.template_id ?? 'professional',
      source_version_id: latest.id,
      blocks: composition,
    });

    return this.toDetail(record);
  }

  async updateMine(id: string, input: ResumeUpdateInput, context: ServiceContext): Promise<ResumeDetail> {
    const profileId = this.requireUser(context);
    const existing = await this.requireOwnedResume(id, profileId);

    let blocks: { block_id: number; sort_order: number; section_name?: string | null }[] | undefined;
    let sourceVersionId = existing.source_version_id;

    if (input.block_ids) {
      const latest = await this.versionsRepo.getLatestVersionForProfile(profileId);
      const versionBlocks = latest ? await this.versionBlocksRepo.listVersionBlocks(latest.id) : [];
      const pinnedIds = new Set(existing.resume_blocks.map((row) => row.block_id));
      blocks = this.resolveUpdateBlocks(input.block_ids, versionBlocks, pinnedIds);
      sourceVersionId = latest?.id ?? existing.source_version_id;
    }

    const record = await this.resumeRepo.update(id, {
      name: input.name,
      template_id: input.template_id,
      source_version_id: sourceVersionId,
      blocks,
    });

    return this.toDetail(record);
  }

  async deleteMine(id: string, context: ServiceContext): Promise<void> {
    const profileId = this.requireUser(context);
    await this.requireOwnedResume(id, profileId);
    await this.resumeRepo.delete(id);
  }

  async proposeTailor(id: string, input: ResumeTailorInput, context: ServiceContext): Promise<TailorProposal> {
    if (!isLlmConfigured()) {
      throw new ServiceError(
        'AI is not configured. Set AI_API_KEY (and optionally AI_BASE_URL and AI_MODEL).',
        null,
        HTTP_STATUS_CODES.SERVICE_UNAVAILABLE
      );
    }

    const detail = await this.getMine(id, context);
    if (detail.blocks.length === 0) {
      throw new ServiceError(
        'Add at least one entry to this resume before tailoring',
        null,
        HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY
      );
    }

    const raw = await completeJson({
      system: TAILOR_SYSTEM_PROMPT,
      user: JSON.stringify({
        job_description: input.job_description,
        resume: compactResumeForLlm(detail),
      }),
      schemaName: 'tailor_proposal',
    });

    return reconcileProposal(raw, detail.blocks);
  }

  async applyTailor(id: string, input: ResumeTailorApplyInput, context: ServiceContext): Promise<ResumeDetail> {
    const profileId = this.requireUser(context);
    const existing = await this.requireOwnedResume(id, profileId);
    const detail = await this.toDetail(existing);
    const sourceIds = new Set(existing.resume_blocks.map((row) => row.block_id));
    const byId = new Map(detail.blocks.map((block) => [block.id, block]));

    const composition: { block_id: number; sort_order: number; section_name?: string | null }[] = [];

    for (const [index, selection] of input.selections.entries()) {
      if (!sourceIds.has(selection.source_block_id)) {
        throw new ServiceError(
          `Block ${selection.source_block_id} is not on this resume`,
          null,
          HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY
        );
      }

      const block = byId.get(selection.source_block_id);
      if (!block) {
        throw new ServiceError(
          `Block ${selection.source_block_id} could not be loaded`,
          null,
          HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY
        );
      }

      const field = bulletListField(String(block.block_type));
      let blockId = block.id;

      if (field && selection.bullets) {
        const data = cloneBlockData(block.data);
        data[field] = selection.bullets;
        const ensured = await this.blockService.ensureTypedBlock(block.block_type, data);
        blockId = ensured.blockId;
      }

      composition.push({
        block_id: blockId,
        sort_order: index,
        section_name: block.section_name ?? null,
      });
    }

    if (composition.length === 0) {
      throw new ServiceError(
        'Select at least one entry to create a tailored resume',
        null,
        HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY
      );
    }

    const record = await this.resumeRepo.create({
      profile_id: profileId,
      name: input.name?.trim() || `${detail.name} — tailored`,
      template_id: input.template_id ?? existing.template_id,
      source_version_id: existing.source_version_id,
      blocks: composition,
    });

    return this.toDetail(record);
  }

  async renderPdf(id: string, context: ServiceContext): Promise<{ buffer: Buffer; filename: string }> {
    const detail = await this.getMine(id, context);
    const buffer = Buffer.from(
      await renderResumePdf({
        templateId: detail.template_id,
        header: detail.header,
        blocks: detail.blocks,
      })
    );
    return { buffer, filename: this.pdfFilename(detail.header.display_name, detail.name) };
  }

  private async toDetail(record: ResumeRecord & { resume_blocks: ResumeBlockRecord[] }): Promise<ResumeDetail> {
    const blocks = (await this.blockService.listBlocksByIds(
      record.resume_blocks.map((row) => ({
        blockId: row.block_id,
        sectionName: row.section_name,
        sortOrder: row.sort_order,
      })),
      record.source_version_id
    )) as VersionBlockDetail[];

    const header = await this.buildHeader(record.profile_id);

    return {
      ...serializeResume(record),
      blocks,
      header,
    };
  }

  private async buildHeader(profileId: string): Promise<ResumeHeader> {
    const profile = await this.prisma.profiles.findFirst({
      where: { id: profileId, deleted_at: null },
      include: {
        users: { select: { email: true } },
        profile_links: {
          where: { is_public: true },
          include: { link_platforms: true },
          orderBy: { sort_order: 'asc' },
        },
      },
    });

    if (!profile) {
      throw new ServiceError('Profile not found', null, HTTP_STATUS_CODES.NOT_FOUND);
    }

    const links = (profile.profile_links ?? [])
      .filter((link) => link.url)
      .map((link) => ({ label: linkLabel(link), url: link.url }));

    const legacy = [
      profile.linkedin_url ? { label: 'LinkedIn', url: profile.linkedin_url } : null,
      profile.github_url ? { label: 'GitHub', url: profile.github_url } : null,
      profile.portfolio_url ? { label: 'Portfolio', url: profile.portfolio_url } : null,
    ].filter((item): item is { label: string; url: string } => Boolean(item));

    return {
      display_name: profile.display_name?.trim() || profile.username,
      username: profile.username,
      email: profile.users?.email ?? null,
      phone: profile.phone,
      location: profile.location,
      links: links.length > 0 ? links : legacy,
    };
  }

  private resolveCreateBlocks(
    blockIds: number[] | undefined,
    versionBlocks: Array<{
      block_id: number;
      is_visible?: boolean | null;
      section_name?: string | null;
      sort_order?: number | null;
    }>
  ): { block_id: number; sort_order: number; section_name?: string | null }[] {
    const byId = new Map(versionBlocks.map((row) => [row.block_id, row]));
    const selected = blockIds ?? versionBlocks.filter((row) => row.is_visible !== false).map((row) => row.block_id);

    if (selected.length === 0) {
      throw new ServiceError(
        'Select at least one profile entry to include in this resume',
        null,
        HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY
      );
    }

    return selected.map((blockId, index) => {
      const row = byId.get(blockId);
      if (!row) {
        throw new ServiceError(
          `Block ${blockId} is not in the current profile`,
          null,
          HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY
        );
      }
      return { block_id: blockId, sort_order: index, section_name: row.section_name ?? null };
    });
  }

  private resolveUpdateBlocks(
    blockIds: number[],
    versionBlocks: Array<{ block_id: number; section_name?: string | null }>,
    pinnedIds: Set<number>
  ): { block_id: number; sort_order: number; section_name?: string | null }[] {
    const byId = new Map(versionBlocks.map((row) => [row.block_id, row]));
    return blockIds.map((blockId, index) => {
      const fromLatest = byId.get(blockId);
      if (!fromLatest && !pinnedIds.has(blockId)) {
        throw new ServiceError(
          `Block ${blockId} is not available for this resume`,
          null,
          HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY
        );
      }
      return {
        block_id: blockId,
        sort_order: index,
        section_name: fromLatest?.section_name ?? null,
      };
    });
  }

  private pdfFilename(displayName: string, resumeName: string): string {
    const raw = `${displayName} - ${resumeName}`
      .replace(/[<>:"/\\|?*]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const ascii = raw.replace(/[^\x20-\x7E]/g, '').trim() || 'resume';
    return `${ascii}.pdf`;
  }

  private requireUser(context: ServiceContext): string {
    if (!context.userId) {
      throw new ServiceError('Authentication required', null, HTTP_STATUS_CODES.UNAUTHORIZED);
    }
    return context.userId;
  }

  private async assertProfileExists(profileId: string): Promise<void> {
    const exists = await this.versionsRepo.profileExists(profileId);
    if (!exists) {
      throw new ServiceError('Profile not found', null, HTTP_STATUS_CODES.NOT_FOUND);
    }
  }

  private async requireOwnedResume(id: string, profileId: string) {
    const record = await this.resumeRepo.findById(id);
    if (!record || record.profile_id !== profileId) {
      throw new ServiceError('Resume not found', null, HTTP_STATUS_CODES.NOT_FOUND);
    }
    return record;
  }
}
