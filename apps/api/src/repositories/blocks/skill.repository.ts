/**
 * Repository for skill blocks
 */

import { PrismaClient } from '@prisma/client';
import { BlockType, SkillData } from '@monolenz/types/entities/blocks';
import { BaseTypedBlockRepository } from './base-typed-block.repository';

export class SkillRepository extends BaseTypedBlockRepository<SkillData> {
  protected readonly tableName = 'block_skills';
  protected readonly blockType = BlockType.SKILL;

  constructor(prisma: PrismaClient) {
    super(prisma);
  }
}
