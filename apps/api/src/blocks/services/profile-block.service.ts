/**
 * ProfileBlockService - Handles block versioning, creation, and immutability
 * Extends BaseService but adapted for immutable block semantics
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { BaseService } from '../../services/base.service';
import { ServiceError } from '../../services/base.service';
import { BlockEntity, BlockType, TypedBlock, Version } from '@monolenz/types/entities/blocks';
import { BLOCK_SCHEMAS } from '@monolenz/types/validation/block-schemas';
import { BlocksRepository } from '../repositories/blocks.repository';
import { VersionsRepository } from '../../repositories/profile/versions.repository';
import { VersionBlocksRepository } from '../../repositories/profile/version-blocks.repository';
import { TypedBlockRepositoryFactory } from '../repositories/repository-factory';
import { ServiceContext } from '../../services/base.service';

interface CreateBlockInput {
  blockType: BlockType;
  data: Record<string, unknown>;
  sectionName?: string | null;
  sortOrder?: number;
}

interface UpdateBlockInput {
  parentBlockId: number;
  blockType: BlockType;
  data: Record<string, unknown>;
  sectionName?: string | null;
  sortOrder?: number;
}

interface ApplyVersionUpdateInput {
  profileId: string;
  creations: CreateBlockInput[];
  updates: UpdateBlockInput[];
  deletions: number[];
}

interface ProcessedBlock {
  blockId: number;
  previousBlockId?: number | null;
  sectionName?: string | null;
  sortOrder?: number;
}

interface BlockToAttach extends ProcessedBlock {
  previousVersionId?: number | null;
}

export class ProfileBlockService extends BaseService<BlockEntity> {
  private typedBlockFactory: TypedBlockRepositoryFactory;
  private versionsRepo: VersionsRepository;
  private versionBlocksRepo: VersionBlocksRepository;
  private prisma: PrismaClient;

  constructor(
    blocksRepo: BlocksRepository,
    versionsRepo: VersionsRepository,
    versionBlocksRepo: VersionBlocksRepository,
    prisma: PrismaClient,
  ) {
    super('ProfileBlockService', blocksRepo);
    this.versionsRepo = versionsRepo;
    this.versionBlocksRepo = versionBlocksRepo;
    this.typedBlockFactory = new TypedBlockRepositoryFactory(prisma);
    this.prisma = prisma;
  }

  // ========================================================================
  // BaseService Abstract Methods
  // ========================================================================

  protected async validateAccess(operation: string, data: any, context?: ServiceContext): Promise<void> {
    // For blocks, access control is at profile level
    // This is validated at the service method level
  }

  protected async validateData(data: any, operation: 'create' | 'update'): Promise<void> {
    // Validation done via Zod in middleware, not here
  }

  protected async applyBusinessRules(
    data: any,
    operation: 'create' | 'update',
    context?: ServiceContext,
  ): Promise<any> {
    // Blocks are immutable - no business rules to apply
    return data;
  }

  protected async applyServiceFilters(
    filters?: Record<string, any>,
    context?: ServiceContext,
  ): Promise<Record<string, any>> {
    // Filter by profile_id if context provided
    if (context?.userId) {
      return { ...filters, profile_id: context.userId };
    }
    return filters || {};
  }

  // ========================================================================
  // Public API Methods
  // ========================================================================

  /**
   * Apply batch version update (creations, updates, deletions)
   * Creates new immutable version with all changes
   */
  async applyVersionUpdate(input: ApplyVersionUpdateInput, context?: ServiceContext): Promise<{ versionId: number }> {
    // Validate profile ownership
    if (context?.userId !== input.profileId) {
      throw new ServiceError('Unauthorized', null, 403);
    }

    return (this.repository as BlocksRepository).withTransaction(async (tx) => {
      // 1. Validate profile exists
      const profileExists = await this.versionsRepo.profileExists(input.profileId, tx);
      if (!profileExists) {
        throw new ServiceError('Profile not found', null, 404);
      }

      // 2. Get latest version and current block IDs
      const latestVersion = await this.versionsRepo.getLatestVersionForProfile(input.profileId, tx);
      const currentBlockIds = latestVersion ? await this.versionsRepo.listVersionBlockIds(latestVersion.id, tx) : [];

      // 3. Validate update parent blocks exist in current version
      for (const update of input.updates) {
        if (!currentBlockIds.includes(update.parentBlockId)) {
          throw new ServiceError(
            `Parent block ${update.parentBlockId} not found in current version`,
            null,
            400,
          );
        }
      }

      // 4. Process creations and updates (both create new immutable blocks)
      const processedCreations = await this.processBlockCreations(input.creations, tx);
      const processedUpdates = await this.processBlockUpdates(input.updates, tx);

      // 5. Create new version
      const newVersion = await this.versionsRepo.createVersion(
        {
          profile_id: input.profileId,
          parent_version_id: latestVersion?.id ?? null,
          name: null,
          description: null,
        },
        tx,
      );

      // 6. Compute blocks to attach (carry-forward + new/updated, excluding deleted)
      const blocksToAttach = this.computeBlocksToAttach(
        currentBlockIds,
        processedCreations,
        processedUpdates,
        input.deletions,
        latestVersion?.id,
      );

      // 7. Attach blocks to new version
      for (const block of blocksToAttach) {
        await this.versionBlocksRepo.attachBlockToVersion(
          {
            version_id: newVersion.id,
            block_id: block.blockId,
            previous_block_id: block.previousBlockId ?? null,
            previous_version_id: block.previousVersionId ?? null,
            section_name: block.sectionName ?? null,
            sort_order: block.sortOrder ?? 0,
            is_visible: true,
          },
          tx,
        );
      }

      return { versionId: newVersion.id };
    });
  }

  /**
   * Get all blocks for a version with typed data
   */
  async listBlocksForVersion(
    versionId: number,
    options?: { sectionName?: string; blockType?: BlockType },
  ): Promise<TypedBlock[]> {
    return (this.repository as BlocksRepository).withTransaction(async (tx) => {
      // 1. Get version_blocks with base block info
      const versionBlocks = await this.versionBlocksRepo.listVersionBlocks(versionId, options, tx);

      // 2. Group by block_type for batch fetching
      const blocksByType = new Map<BlockType, number[]>();
      for (const vb of versionBlocks) {
        const blockType = vb.block_type as BlockType;
        const ids = blocksByType.get(blockType) || [];
        ids.push(vb.block_id);
        blocksByType.set(blockType, ids);
      }

      // 3. Batch fetch typed data for each block type in parallel
      const typedDataPromises = Array.from(blocksByType.entries()).map(async ([blockType, blockIds]) => {
        const repo = this.typedBlockFactory.getRepository(blockType);
        const typedBlocks = await repo.findManyByBlockIds(blockIds, tx);
        return { blockType, typedBlocks };
      });

      const typedDataResults = await Promise.all(typedDataPromises);

      // 4. Build map of block_id -> typed data
      const typedDataMap = new Map<number, any>();
      for (const result of typedDataResults) {
        for (const typedBlock of result.typedBlocks) {
          typedDataMap.set((typedBlock as any).block_id, typedBlock);
        }
      }

      // 5. Combine base + typed data into TypedBlock[]
      return versionBlocks.map((vb) => {
        const blockType = vb.block_type as BlockType;
        const typedData = typedDataMap.get(vb.block_id);

        return {
          id: vb.block_id,
          block_type: blockType,
          content_hash: vb.content_hash,
          created_at: vb.created_at,
          data: typedData,
          section_name: vb.section_name,
          sort_order: vb.sort_order,
        } as TypedBlock;
      });
    });
  }

  /**
   * Get latest version for profile
   */
  async getLatestVersion(profileId: string): Promise<Version | null> {
    return this.versionsRepo.getLatestVersionForProfile(profileId);
  }

  // ========================================================================
  // Private Helper Methods
  // ========================================================================

  private async processBlockCreations(
    creations: CreateBlockInput[],
    tx: Prisma.TransactionClient,
  ): Promise<ProcessedBlock[]> {
    const results: ProcessedBlock[] = [];

    for (const creation of creations) {
      // Validate data against schema
      const schema = BLOCK_SCHEMAS[creation.blockType];
      if (!schema) {
        throw new ServiceError(`Unknown block type: ${creation.blockType}`, null, 400);
      }

      const validatedData = schema.parse(creation.data);

      // Compute content hash (includes block_type)
      const hash = (this.repository as BlocksRepository).computeContentHash(creation.blockType, validatedData);

      // Check for existing block (deduplication)
      let baseBlock = await (this.repository as BlocksRepository).findBlockByHash(hash, tx);

      if (!baseBlock) {
        // Create base block
        baseBlock = await (this.repository as BlocksRepository).createBaseBlock(
          {
            block_type: creation.blockType,
            content_hash: hash,
          },
          tx,
        );

        // Create typed block data
        const typedRepo = this.typedBlockFactory.getRepository(creation.blockType);
        await typedRepo.create(baseBlock.id, validatedData, tx);
      }

      results.push({
        blockId: baseBlock.id,
        sectionName: creation.sectionName,
        sortOrder: creation.sortOrder,
      });
    }

    return results;
  }

  private async processBlockUpdates(
    updates: UpdateBlockInput[],
    tx: Prisma.TransactionClient,
  ): Promise<ProcessedBlock[]> {
    const results: ProcessedBlock[] = [];

    for (const update of updates) {
      // Validate data against schema
      const schema = BLOCK_SCHEMAS[update.blockType];
      if (!schema) {
        throw new ServiceError(`Unknown block type: ${update.blockType}`, null, 400);
      }

      const validatedData = schema.parse(update.data);

      // Compute content hash
      const hash = (this.repository as BlocksRepository).computeContentHash(update.blockType, validatedData);

      // Check for existing block (deduplication)
      let baseBlock = await (this.repository as BlocksRepository).findBlockByHash(hash, tx);

      if (!baseBlock) {
        // Create new base block (immutable update)
        baseBlock = await (this.repository as BlocksRepository).createBaseBlock(
          {
            block_type: update.blockType,
            content_hash: hash,
          },
          tx,
        );

        // Create typed block data
        const typedRepo = this.typedBlockFactory.getRepository(update.blockType);
        await typedRepo.create(baseBlock.id, validatedData, tx);
      }

      results.push({
        blockId: baseBlock.id,
        previousBlockId: update.parentBlockId,
        sectionName: update.sectionName,
        sortOrder: update.sortOrder,
      });
    }

    return results;
  }

  private computeBlocksToAttach(
    currentBlockIds: number[],
    processedCreations: ProcessedBlock[],
    processedUpdates: ProcessedBlock[],
    deletions: number[],
    latestVersionId?: number,
  ): BlockToAttach[] {
    const deletionSet = new Set(deletions);
    const updatedBlockMap = new Map(processedUpdates.map((u) => [u.previousBlockId!, u]));

    const blocksToAttach: BlockToAttach[] = [];

    // 1. Carry forward blocks from current version that aren't being updated/deleted
    for (const blockId of currentBlockIds) {
      if (!deletionSet.has(blockId) && !updatedBlockMap.has(blockId)) {
        // Carry forward unchanged block
        blocksToAttach.push({
          blockId,
          previousVersionId: latestVersionId,
        });
      }
    }

    // 2. Add new creations
    for (const creation of processedCreations) {
      blocksToAttach.push({
        blockId: creation.blockId,
        sectionName: creation.sectionName,
        sortOrder: creation.sortOrder,
        previousVersionId: latestVersionId,
      });
    }

    // 3. Add updates (new blocks with lineage)
    for (const update of processedUpdates) {
      blocksToAttach.push({
        blockId: update.blockId,
        previousBlockId: update.previousBlockId,
        sectionName: update.sectionName,
        sortOrder: update.sortOrder,
        previousVersionId: latestVersionId,
      });
    }

    return blocksToAttach;
  }
}
