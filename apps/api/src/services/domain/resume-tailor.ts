import { HTTP_STATUS_CODES } from '@monolenz/types/api';
import type { ResumeDetail, TailorProposal, VersionBlockDetail } from '@monolenz/types/entities';
import { tailorProposalSchema } from '@monolenz/types/validation/resume-schemas';
import { ServiceError } from '../base.service';

export const BULLET_FIELDS = {
  work_experience: 'achievements',
  project: 'highlights',
  volunteer: 'highlights',
} as const;

export type BulletBlockType = keyof typeof BULLET_FIELDS;

export const TAILOR_SYSTEM_PROMPT = `You tailor resumes for applicant tracking systems.
Be truthful: never invent employers, dates, titles, skills, or outcomes the candidate did not provide.
Prefer selecting and shortening the strongest existing bullets; rewrite them to echo the job description's language.
Keep each bullet a single line. Do not use first-person pronouns.
Respond with JSON only in this shape:
{"suggested_name": string, "entries": [{"source_block_id": number, "include": boolean, "reason": string, "bullets": [{"text": string, "recommended": boolean}]}]}
Return one entry for every source_block_id you were given.
Only populate bullets for work_experience (achievements), project, and volunteer (highlights). Other types: include or drop only, with an empty bullets array.
Include an entry when it is relevant to the job. Drop unrelated entries and explain why in reason.
suggested_name should be short, like "Backend intern — Acme".`;

export function bulletListField(blockType: string): (typeof BULLET_FIELDS)[BulletBlockType] | null {
  return blockType in BULLET_FIELDS ? BULLET_FIELDS[blockType as BulletBlockType] : null;
}

export function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function toDateOnly(value: unknown): string | null {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === 'string' && value.trim()) {
    return value.slice(0, 10);
  }
  return null;
}

function titleFromData(blockType: string, data: Record<string, unknown>): string {
  const value =
    data.position_title ||
    data.name ||
    data.title ||
    data.language ||
    data.degree_name ||
    data.institution_name ||
    blockType;
  return String(value);
}

function organizationFromData(data: Record<string, unknown>): string | null {
  const value =
    data.company_name || data.institution_name || data.issuing_organization || data.organization_name || data.issuer;
  return value ? String(value) : null;
}

export function compactResumeForLlm(detail: ResumeDetail) {
  return {
    resume_name: detail.name,
    header: {
      display_name: detail.header.display_name,
      location: detail.header.location ?? null,
    },
    entries: detail.blocks.map((block) => {
      const data = (block.data ?? {}) as unknown as Record<string, unknown>;
      const blockType = String(block.block_type);
      const field = bulletListField(blockType);
      return {
        source_block_id: block.id,
        block_type: blockType,
        title: titleFromData(blockType, data),
        organization: organizationFromData(data),
        dates: {
          start: toDateOnly(data.start_date ?? data.issue_date ?? data.date_received),
          end: toDateOnly(data.end_date ?? data.expiration_date),
          current: Boolean(data.is_current ?? data.is_ongoing ?? data.does_not_expire),
        },
        bullets: field ? asStringArray(data[field]) : undefined,
      };
    }),
  };
}

export function cloneBlockData(data: unknown): Record<string, unknown> {
  const raw = { ...((data ?? {}) as Record<string, unknown>) };
  delete raw.block_id;
  delete raw.blocks;
  return raw;
}

export function reconcileProposal(raw: unknown, sourceBlocks: VersionBlockDetail[]): TailorProposal {
  const parsed = tailorProposalSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ServiceError('AI returned an unexpected proposal shape', parsed.error, HTTP_STATUS_CODES.BAD_GATEWAY);
  }

  const byId = new Map(parsed.data.entries.map((entry) => [entry.source_block_id, entry]));
  const entries = sourceBlocks.map((block) => {
    const blockType = String(block.block_type);
    const field = bulletListField(blockType);
    const originalBullets = field
      ? asStringArray(((block.data ?? {}) as unknown as Record<string, unknown>)[field])
      : [];
    const model = byId.get(block.id);

    if (!model) {
      return {
        source_block_id: block.id,
        include: false,
        reason: 'Not selected for this job',
        bullets: field ? originalBullets.map((text) => ({ text, recommended: false })) : [],
      };
    }

    let bullets = field ? model.bullets.filter((bullet) => bullet.text.trim().length > 0) : [];
    if (field && model.include && bullets.length === 0) {
      bullets = originalBullets.map((text) => ({ text, recommended: true }));
    }
    if (!field) bullets = [];

    return {
      source_block_id: block.id,
      include: model.include,
      reason: model.reason ?? null,
      bullets,
    };
  });

  if (!entries.some((entry) => entry.include)) {
    throw new ServiceError(
      'The model dropped every entry. Try a different job description.',
      null,
      HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY
    );
  }

  return {
    suggested_name: parsed.data.suggested_name,
    entries,
  };
}
