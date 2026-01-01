import { BaseService, ServiceContext, ServiceError } from '../base.service';
import { Prisma, PrismaClient } from '@prisma/client';
import { BlocksRepository, BlockEntity } from '../../repositories/profile/blocks.repository';
import { BlockCatalogRepository, BlockPropertyEntity } from '../../repositories/profile/block-catalog.repository';
import { VersionsRepository } from '../../repositories/profile/versions.repository';
import { VersionBlocksRepository } from '../../repositories/profile/version-blocks.repository';
import { HTTP_STATUS_CODES, PaginationParams } from '@monolenz/types/api';

export interface CreateAndAttachBlockInput {
  profileId: string;
  versionId?: number;
  blockTypeId?: number;
  blockTypeName?: string;
  data: Record<string, unknown>;
  sectionName?: string | null;
  sortOrder?: number | null;
  propertyVisibility?: Record<string, boolean>; // key by property_name
  previousBlockId?: number | null; // if editing an existing block from previous version
}

export interface BatchVersionUpdateInput {
  profileId: string;
  creations: Array<{
    blockTypeId?: number;
    blockTypeName?: string;
    data: Record<string, unknown>;
    sectionName?: string | null;
    sortOrder?: number | null;
  }>;
  updates: Array<{
    parentBlockId: number;
    blockTypeId?: number;
    blockTypeName?: string;
    data: Record<string, unknown>;
    sectionName?: string | null;
    sortOrder?: number | null;
  }>;
  deletions: number[];
}

export class ProfileBlockService extends BaseService<BlockEntity> {
  constructor(
    private readonly blocksRepository: BlocksRepository,
    private readonly catalogRepository: BlockCatalogRepository,
    private readonly versionsRepository: VersionsRepository,
    private readonly versionBlocksRepository: VersionBlocksRepository
  ) {
    super('ProfileBlockService', blocksRepository);
  }

  // Catalog
  async listBlockTypes() {
    return this.catalogRepository.listBlockTypes(true);
  }

  // Apply batch version update: creations, updates, deletions -> new version
  async applyVersionUpdate(input: BatchVersionUpdateInput, context: ServiceContext) {
    const operation = 'applyVersionUpdate';
    try {
      await this.validateAccess(operation, { profileId: input.profileId }, context);

      return await this.blocksRepository.withTransaction(async (tx) => {
        const hasProfile = await this.versionsRepository.profileExists(input.profileId, tx);
        if (!hasProfile) {
          throw new ServiceError('Profile not found', null, HTTP_STATUS_CODES.NOT_FOUND);
        }
        const latest = await this.versionsRepository.getLatestVersionForProfile(input.profileId, tx);
        const currentBlockIds = latest ? await this.versionsRepository.listVersionBlockIds(latest.id, tx) : [];

        const parentsOfUpdates = new Set(input.updates.map((u) => u.parentBlockId));
        // Validate that update parents exist in current version (prevent FK errors and ensure lineage)
        const invalidParents = input.updates
          .map((u) => u.parentBlockId)
          .filter((pid) => !currentBlockIds.includes(pid));
        if (invalidParents.length > 0) {
          throw new ServiceError(
            'Validation failed',
            {
              errors: invalidParents.map((pid) => ({
                field: 'parentBlockId',
                code: 'not_in_latest_version',
                message: `parentBlockId ${pid} is not part of the latest version`,
              })),
            },
            HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY
          );
        }
        const deletions = new Set(input.deletions);
        const unmentioned = currentBlockIds.filter((id) => !parentsOfUpdates.has(id) && !deletions.has(id));

        // Prepare creations
        const createdBlocks: Array<{ id: number; sectionName?: string | null; sortOrder?: number | null }> = [];
        for (const c of input.creations) {
          const blockTypeId = await this.resolveBlockTypeId(
            { blockTypeId: c.blockTypeId!, blockTypeName: c.blockTypeName } as any,
            tx
          );
          const properties = await this.catalogRepository.listBlockProperties(blockTypeId, true, tx);
          this.validateBlockData(c.data, properties);
          const hash = this.blocksRepository.computeContentHash({ block_type_id: blockTypeId, data: c.data });
          const existing = await this.blocksRepository.findBlockByHash(hash, tx);
          const block =
            existing ??
            (await this.blocksRepository.createBlock(
              { block_type_id: blockTypeId, data: c.data, content_hash: hash },
              tx
            ));
          const values = this.mapDataToPropertyValues(c.data, properties, undefined);
          await this.blocksRepository.upsertBlockPropertyValues(block.id, values, tx);
          createdBlocks.push({ id: block.id, sectionName: c.sectionName ?? null, sortOrder: c.sortOrder ?? null });
        }

        // Prepare updates -> new immutable blocks with lineage
        const updatedBlocks: Array<{
          newId: number;
          parentId: number;
          sectionName?: string | null;
          sortOrder?: number | null;
        }> = [];
        for (const u of input.updates) {
          const blockTypeId = await this.resolveBlockTypeId(
            { blockTypeId: u.blockTypeId!, blockTypeName: u.blockTypeName } as any,
            tx
          );
          const properties = await this.catalogRepository.listBlockProperties(blockTypeId, true, tx);
          this.validateBlockData(u.data, properties);
          const hash = this.blocksRepository.computeContentHash({ block_type_id: blockTypeId, data: u.data });
          const existing = await this.blocksRepository.findBlockByHash(hash, tx);
          const block =
            existing ??
            (await this.blocksRepository.createBlock(
              { block_type_id: blockTypeId, data: u.data, content_hash: hash },
              tx
            ));
          const values = this.mapDataToPropertyValues(u.data, properties, undefined);
          await this.blocksRepository.upsertBlockPropertyValues(block.id, values, tx);
          updatedBlocks.push({
            newId: block.id,
            parentId: u.parentBlockId,
            sectionName: u.sectionName ?? null,
            sortOrder: u.sortOrder ?? null,
          });
        }

        // Create new version inheriting from current
        const newVersion = await this.versionsRepository.createVersion(
          { profile_id: input.profileId, parent_version_id: latest?.id ?? null },
          tx
        );

        // Attach unmentioned (carry-forward)
        let order = 0;
        for (const bid of unmentioned) {
          await this.versionBlocksRepository.attachBlockToVersion(
            { version_id: newVersion.id, block_id: bid, is_visible: true, sort_order: order++ },
            tx
          );
        }

        // Attach creations (append after unmentioned)
        for (const c of createdBlocks) {
          await this.versionBlocksRepository.attachBlockToVersion(
            {
              version_id: newVersion.id,
              block_id: c.id,
              is_visible: true,
              section_name: c.sectionName ?? null,
              sort_order: order++,
            },
            tx
          );
        }

        // Attach updates with lineage (append after creations)
        for (const u of updatedBlocks) {
          await this.versionBlocksRepository.attachBlockToVersion(
            {
              version_id: newVersion.id,
              block_id: u.newId,
              previous_block_id: u.parentId,
              is_visible: true,
              section_name: u.sectionName ?? null,
              sort_order: order++,
            },
            tx
          );
        }

        return { versionId: newVersion.id };
      });
    } catch (error) {
      this.logger.error(`${operation} failed`, { error: error as Error, input });
      const err: any = error;
      throw new ServiceError(
        'Failed to apply version update',
        err?.cause ?? err,
        typeof err?.statusCode === 'number' ? err.statusCode : undefined
      );
    }
  }

  async listBlockProperties(blockTypeId: number) {
    return this.catalogRepository.listBlockProperties(blockTypeId, true);
  }

  // Core create-and-attach (immutable visibility per version)
  async createAndAttachBlock(input: CreateAndAttachBlockInput, context: ServiceContext) {
    const operation = 'createAndAttachBlock';
    try {
      await this.validateAccess(operation, { profileId: input.profileId }, context);

      return await this.blocksRepository.withTransaction(async (tx) => {
        // Resolve block type
        const blockTypeId = await this.resolveBlockTypeId(input, tx);

        // Validate data against block properties
        const properties = await this.catalogRepository.listBlockProperties(blockTypeId, true, tx);
        this.validateBlockData(input.data, properties);

        // Compute content hash and deduplicate
        const content_hash = this.blocksRepository.computeContentHash({ block_type_id: blockTypeId, data: input.data });
        const existing = await this.blocksRepository.findBlockByHash(content_hash, tx);
        const block =
          existing ??
          (await this.blocksRepository.createBlock({ block_type_id: blockTypeId, data: input.data, content_hash }, tx));

        // Upsert property values
        const values = this.mapDataToPropertyValues(input.data, properties, input.propertyVisibility);
        await this.blocksRepository.upsertBlockPropertyValues(block.id, values, tx);

        // Resolve target version (latest if none)
        const version = input.versionId
          ? await this.versionsRepository.getVersionById(input.versionId, tx)
          : await this.versionsRepository.getLatestVersionForProfile(input.profileId, tx);

        if (!version) {
          // Create a new version if none exists
          const created = await this.versionsRepository.createVersion({ profile_id: input.profileId }, tx);
          // Attach block to new version
          await this.versionBlocksRepository.attachBlockToVersion(
            {
              version_id: created.id,
              block_id: block.id,
              is_visible: true,
              section_name: input.sectionName ?? null,
              sort_order: input.sortOrder ?? 0,
            },
            tx
          );
          return { versionId: created.id, block };
        }

        // Attach block to existing version
        await this.versionBlocksRepository.attachBlockToVersion(
          {
            version_id: version.id,
            block_id: block.id,
            previous_block_id: input.previousBlockId ?? null,
            is_visible: true,
            section_name: input.sectionName ?? null,
            sort_order: input.sortOrder ?? 0,
          },
          tx
        );

        return { versionId: version.id, block };
      });
    } catch (error) {
      this.logger.error(`${operation} failed`, { error: error as Error, input });
      throw new ServiceError('Failed to create and attach block', error);
    }
  }

  // Delete (immutable): create new version without the given block
  async deleteBlockFromVersion(profileId: string, versionId: number, blockId: number, context: ServiceContext) {
    const operation = 'deleteBlockFromVersion';
    try {
      await this.validateAccess(operation, { profileId }, context);

      return await this.blocksRepository.withTransaction(async (tx) => {
        const currentVersion = await this.versionsRepository.getVersionById(versionId, tx);
        if (!currentVersion) throw new ServiceError('Version not found', null, HTTP_STATUS_CODES.NOT_FOUND);

        // Create a new version
        const nextVersion = await this.versionsRepository.createVersion(
          { profile_id: profileId, parent_version_id: versionId },
          tx
        );

        // Reattach all blocks except the one being deleted
        const blockIds = await this.versionsRepository.listVersionBlockIds(versionId, tx);
        let sort = 0;
        for (const id of blockIds) {
          if (id === blockId) continue;
          await this.versionBlocksRepository.attachBlockToVersion(
            { version_id: nextVersion.id, block_id: id, is_visible: true, sort_order: sort++ },
            tx
          );
        }

        return { versionId: nextVersion.id };
      });
    } catch (error) {
      this.logger.error(`${operation} failed`, { error: error as Error, profileId, versionId, blockId });
      throw new ServiceError('Failed to delete block from version', error);
    }
  }

  // List blocks for a version (respecting publicOnly for unauthenticated)
  async listBlocksForVersion(
    versionId: number,
    options?: { sectionName?: string; publicOnly?: boolean },
    context?: ServiceContext
  ) {
    const publicOnly = options?.publicOnly ?? !context?.userId;
    return this.versionBlocksRepository.listVersionBlocks(versionId, { sectionName: options?.sectionName, publicOnly });
  }

  // Enforce access: write operations require owner/admin; reads are public
  protected async validateAccess(operation: string, data: any, context?: ServiceContext): Promise<void> {
    const isRead = operation.startsWith('find') || operation.startsWith('list');
    if (isRead) return;

    if (!context?.userId) {
      throw new ServiceError('Authentication required', null, HTTP_STATUS_CODES.UNAUTHORIZED);
    }

    // For now, allow owners or admins to mutate. Expect caller to pass profileId when needed
    if (data?.profileId && data.profileId !== context.userId && context.userRole !== 'admin') {
      throw new ServiceError('Access denied', null, HTTP_STATUS_CODES.FORBIDDEN);
    }
  }

  protected async validateData(): Promise<void> {
    // No generic schema at this layer; validation is done per block type in validateBlockData
  }

  protected async applyBusinessRules<T>(data: T): Promise<T> {
    return data;
  }

  protected async applyServiceFilters(filters?: Record<string, any>): Promise<Record<string, any>> {
    return filters || {};
  }

  private async resolveBlockTypeId(
    input: { blockTypeId?: number; blockTypeName?: string },
    tx: Prisma.TransactionClient
  ): Promise<number> {
    if (input.blockTypeId !== undefined) {
      const byId = await this.catalogRepository.getBlockTypeById(input.blockTypeId, tx);
      if (!byId) {
        throw new ServiceError('Invalid block type id', null, HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY);
      }
      return byId.id;
    }
    if (!input.blockTypeName) {
      throw new ServiceError('blockTypeId or blockTypeName is required', null, HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY);
    }
    const type = await this.catalogRepository.getBlockTypeByName(input.blockTypeName, tx);
    if (!type) throw new ServiceError('Block type not found', null, HTTP_STATUS_CODES.NOT_FOUND);
    return type.id;
  }

  private validateBlockData(data: Record<string, unknown>, properties: BlockPropertyEntity[]) {
    const propByName = new Map(properties.map((p) => [p.property_name, p]));
    const errors: Array<{ field: string; code: string; message: string }> = [];

    // Required checks
    for (const p of properties) {
      const v = data[p.property_name];
      if (p.is_required && (v === undefined || v === null || v === '')) {
        errors.push({ field: p.property_name, code: 'required', message: `${p.property_name} is required` });
      }
    }

    // Type and rules checks
    for (const [key, value] of Object.entries(data)) {
      const def = propByName.get(key);
      if (!def) continue; // ignore unknowns
      if (value === null || value === undefined) continue;

      const expected = def.property_type;
      if (!this.isTypeValid(value, expected)) {
        errors.push({ field: key, code: 'type', message: `Invalid type: expected ${expected}` });
        continue;
      }

      // validation_rules stored as JSON
      const rules = (def.validation_rules || {}) as Record<string, any>;
      this.applyValidationRules(key, value, expected, rules, errors);
    }

    if (errors.length > 0) {
      throw new ServiceError('Validation failed', { errors }, HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY);
    }
  }

  private applyValidationRules(
    field: string,
    value: unknown,
    expectedType: string,
    rules: Record<string, any>,
    errors: Array<{ field: string; code: string; message: string }>
  ) {
    // String/array length and patterns
    if (typeof value === 'string') {
      if (typeof rules.minLength === 'number' && value.length < rules.minLength) {
        errors.push({ field, code: 'minLength', message: `Must be at least ${rules.minLength} characters` });
      }
      if (typeof rules.maxLength === 'number' && value.length > rules.maxLength) {
        errors.push({ field, code: 'maxLength', message: `Must be at most ${rules.maxLength} characters` });
      }
      if (typeof rules.pattern === 'string') {
        try {
          const re = new RegExp(rules.pattern);
          if (!re.test(value)) {
            errors.push({ field, code: 'pattern', message: 'Invalid format' });
          }
        } catch {
          // ignore invalid regex
        }
      }
      if (rules.format === 'uri') {
        try {
          // new URL will throw on invalid URLs
          // eslint-disable-next-line no-new
          new URL(value);
        } catch {
          errors.push({ field, code: 'format', message: 'Invalid URI format' });
        }
      }
    }

    // Enum
    if (Array.isArray(rules.enum)) {
      if (!rules.enum.includes(value)) {
        errors.push({ field, code: 'enum', message: `Must be one of: ${rules.enum.join(', ')}` });
      }
    }

    // Numeric bounds
    if (typeof value === 'number') {
      if (typeof rules.minimum === 'number' && value < rules.minimum) {
        errors.push({ field, code: 'minimum', message: `Must be >= ${rules.minimum}` });
      }
      if (typeof rules.maximum === 'number' && value > rules.maximum) {
        errors.push({ field, code: 'maximum', message: `Must be <= ${rules.maximum}` });
      }
    }

    // Date handling (expectedType === 'date')
    if (expectedType === 'date' && typeof value === 'string') {
      const isoDate = /^\d{4}-\d{2}-\d{2}$/;
      if (!isoDate.test(value) || Number.isNaN(Date.parse(value))) {
        errors.push({ field, code: 'date', message: 'Must be a valid ISO date (YYYY-MM-DD)' });
      }
    }

    // Array item type
    if (Array.isArray(value) && rules.items && typeof rules.items.type === 'string') {
      const t = rules.items.type as string;
      for (let i = 0; i < value.length; i++) {
        const ok = this.isTypeValid((value as unknown[])[i], t);
        if (!ok) {
          errors.push({ field, code: 'items', message: `Invalid item type at index ${i}: expected ${t}` });
          break;
        }
      }
    }
  }

  private isTypeValid(value: unknown, propertyType: string): boolean {
    switch (propertyType) {
      case 'string':
      case 'text':
        return typeof value === 'string';
      case 'integer':
        return Number.isInteger(value);
      case 'decimal':
        return typeof value === 'number' && !Number.isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'date':
        return typeof value === 'string' || value instanceof Date;
      case 'array':
        return Array.isArray(value);
      case 'object':
        return value !== null && typeof value === 'object' && !Array.isArray(value);
      default:
        return true;
    }
  }

  private mapDataToPropertyValues(
    data: Record<string, unknown>,
    properties: BlockPropertyEntity[],
    propertyVisibility?: Record<string, boolean>
  ) {
    const byName = new Map(properties.map((p) => [p.property_name, p]));
    const values: Array<{ property_id: number; value: any; is_public?: boolean; is_active?: boolean }> = [];

    for (const [name, def] of byName) {
      const v = data[name];
      if (v === undefined) continue;
      values.push({
        property_id: def.id,
        value: v as any,
        is_public: propertyVisibility?.[name] ?? true,
        is_active: true,
      });
    }

    return values;
  }
}
