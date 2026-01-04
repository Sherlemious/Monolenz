/**
 * Repository for language blocks
 */

import { PrismaClient } from '@prisma/client';
import { BlockType, LanguageData } from '@monolenz/types/entities/blocks';
import { BaseTypedBlockRepository } from './base-typed-block.repository';

export class LanguageRepository extends BaseTypedBlockRepository<LanguageData> {
  protected readonly tableName = 'block_languages';
  protected readonly blockType = BlockType.LANGUAGE;

  constructor(prisma: PrismaClient) {
    super(prisma);
  }
}
