import { PrismaClient } from '@prisma/client';

export interface ResumeRecord {
  id: string;
  profile_id: string;
  name: string;
  template_id: string;
  source_version_id: number | null;
  created_at: Date | null;
  updated_at: Date | null;
}

export interface ResumeBlockRecord {
  resume_id: string;
  block_id: number;
  sort_order: number;
  section_name: string | null;
}

export interface CreateResumeRecordInput {
  profile_id: string;
  name: string;
  template_id: string;
  source_version_id?: number | null;
  blocks: { block_id: number; sort_order: number; section_name?: string | null }[];
}

export interface UpdateResumeRecordInput {
  name?: string;
  template_id?: string;
  source_version_id?: number | null;
  blocks?: { block_id: number; sort_order: number; section_name?: string | null }[];
}

export class ResumeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listByProfileId(profileId: string): Promise<ResumeRecord[]> {
    return this.prisma.resumes.findMany({
      where: { profile_id: profileId },
      orderBy: { updated_at: 'desc' },
    });
  }

  async findById(id: string): Promise<(ResumeRecord & { resume_blocks: ResumeBlockRecord[] }) | null> {
    return this.prisma.resumes.findUnique({
      where: { id },
      include: {
        resume_blocks: { orderBy: { sort_order: 'asc' } },
      },
    });
  }

  async create(input: CreateResumeRecordInput): Promise<ResumeRecord & { resume_blocks: ResumeBlockRecord[] }> {
    return this.prisma.resumes.create({
      data: {
        profile_id: input.profile_id,
        name: input.name,
        template_id: input.template_id,
        source_version_id: input.source_version_id ?? null,
        resume_blocks: {
          create: input.blocks.map((block) => ({
            block_id: block.block_id,
            sort_order: block.sort_order,
            section_name: block.section_name ?? null,
          })),
        },
      },
      include: {
        resume_blocks: { orderBy: { sort_order: 'asc' } },
      },
    });
  }

  async update(
    id: string,
    input: UpdateResumeRecordInput
  ): Promise<ResumeRecord & { resume_blocks: ResumeBlockRecord[] }> {
    return this.prisma.$transaction(async (tx) => {
      if (input.blocks) {
        await tx.resume_blocks.deleteMany({ where: { resume_id: id } });
        await tx.resume_blocks.createMany({
          data: input.blocks.map((block) => ({
            resume_id: id,
            block_id: block.block_id,
            sort_order: block.sort_order,
            section_name: block.section_name ?? null,
          })),
        });
      }

      return tx.resumes.update({
        where: { id },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.template_id !== undefined ? { template_id: input.template_id } : {}),
          ...(input.source_version_id !== undefined ? { source_version_id: input.source_version_id } : {}),
          updated_at: new Date(),
        },
        include: {
          resume_blocks: { orderBy: { sort_order: 'asc' } },
        },
      });
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.resumes.delete({ where: { id } });
  }
}
