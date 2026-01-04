/**
 * Repository for work experience blocks
 */

import { PrismaClient } from '@prisma/client';
import { BlockType, WorkExperienceData } from '@monolenz/types/entities/blocks';
import { BaseTypedBlockRepository } from './base-typed-block.repository';

export class WorkExperienceRepository extends BaseTypedBlockRepository<WorkExperienceData> {
  protected readonly tableName = 'block_work_experiences';
  protected readonly blockType = BlockType.WORK_EXPERIENCE;

  constructor(prisma: PrismaClient) {
    super(prisma);
  }
}
