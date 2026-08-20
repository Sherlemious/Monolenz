/**
 * Factory for getting typed block repositories by block type
 */

import { PrismaClient } from '@prisma/client';
import { BlockType } from '@monolenz/types/entities/blocks';
import { BaseTypedBlockRepository } from './base-typed-block.repository';
import { WorkExperienceRepository } from './work-experience.repository';
import { EducationRepository } from './education.repository';
import { SkillRepository } from './skill.repository';
import { ProjectRepository } from './project.repository';
import { CertificationRepository } from './certification.repository';
import { LanguageRepository } from './language.repository';
import { VolunteerRepository } from './volunteer.repository';
import { AwardRepository } from './award.repository';

export class TypedBlockRepositoryFactory {
  private repositories: Map<BlockType, BaseTypedBlockRepository<Record<string, unknown>>>;

  constructor(prisma: PrismaClient) {
    this.repositories = new Map(
      [
        [BlockType.WORK_EXPERIENCE, new WorkExperienceRepository(prisma)],
        [BlockType.EDUCATION, new EducationRepository(prisma)],
        [BlockType.SKILL, new SkillRepository(prisma)],
        [BlockType.PROJECT, new ProjectRepository(prisma)],
        [BlockType.CERTIFICATION, new CertificationRepository(prisma)],
        [BlockType.LANGUAGE, new LanguageRepository(prisma)],
        [BlockType.VOLUNTEER, new VolunteerRepository(prisma)],
        [BlockType.AWARD, new AwardRepository(prisma)],
      ] as unknown as Array<[BlockType, BaseTypedBlockRepository<Record<string, unknown>>]>
    );
  }

  getRepository<T extends Record<string, unknown>>(blockType: BlockType): BaseTypedBlockRepository<T> {
    const repo = this.repositories.get(blockType);
    if (!repo) {
      throw new Error(`Unknown block type: ${blockType}`);
    }
    return repo as BaseTypedBlockRepository<T>;
  }
}
