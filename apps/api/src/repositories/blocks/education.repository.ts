/**
 * Repository for education blocks
 */

import { PrismaClient } from '@prisma/client';
import { BlockType, EducationData } from '@monolenz/types/entities/blocks';
import { BaseTypedBlockRepository } from './base-typed-block.repository';

export class EducationRepository extends BaseTypedBlockRepository<EducationData> {
  protected readonly tableName = 'block_educations';
  protected readonly blockType = BlockType.EDUCATION;

  constructor(prisma: PrismaClient) {
    super(prisma);
  }
}
