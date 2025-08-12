import { BaseRepository, BaseEntity } from '../repositories/base.repository';
import { HTTP_STATUS_CODES, PaginationParams } from '@athaar/types/api';
import { Logger } from '../utils/logger';
import { MetricsCollector } from '../utils/metrics';

export interface ServiceOptions {
  skipCache?: boolean;
  skipValidation?: boolean;
  auditLog?: boolean;
}

export interface ServiceContext {
  userId?: string;
  userRole?: string;
  requestId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export abstract class BaseService<T extends BaseEntity> {
  protected serviceName: string;
  protected logger: Logger;
  protected metrics: MetricsCollector;

  constructor(
    serviceName: string,
    protected readonly repository: BaseRepository<T>,
    logger?: Logger,
    metrics?: MetricsCollector
  ) {
    this.serviceName = serviceName;
    this.logger = logger || new Logger(serviceName);
    this.metrics = metrics || new MetricsCollector();
  }

  async findById(id: string | number, context?: ServiceContext, options?: ServiceOptions): Promise<T | null> {
    const operation = 'findById';
    const startTime = Date.now();

    try {
      this.logger.info(`${operation} started`, { id, context });
      this.metrics.incrementCounter(`${this.serviceName}.${operation}.attempts`);

      // Validate access
      await this.validateAccess(operation, { id }, context);

      const result = await this.repository.findById(id);

      this.metrics.recordDuration(`${this.serviceName}.${operation}.duration`, Date.now() - startTime);
      this.metrics.incrementCounter(`${this.serviceName}.${operation}.success`);

      this.logger.info(`${operation} completed`, { id, found: !!result });
      return result;
    } catch (error) {
      this.metrics.incrementCounter(`${this.serviceName}.${operation}.errors`);
      this.logger.error(`${operation} failed`, { id, error: error as Error, context });
      throw new ServiceError(`Failed to find ${this.serviceName} by id`, error);
    }
  }

  async findMany(
    pagination: PaginationParams,
    filters?: Record<string, any>,
    context?: ServiceContext,
    options?: ServiceOptions
  ): Promise<{ data: T[]; total: number; meta: any }> {
    const operation = 'findMany';
    const startTime = Date.now();

    try {
      this.logger.info(`${operation} started`, { pagination, filters, context });
      this.metrics.incrementCounter(`${this.serviceName}.${operation}.attempts`);

      // Validate access
      await this.validateAccess(operation, { filters }, context);

      // Apply service-level filters
      const serviceFilters = await this.applyServiceFilters(filters, context);

      const result = await this.repository.findWithPagination(pagination, serviceFilters);

      // Calculate pagination meta
      const { page = 1, limit = 10 } = pagination;
      const totalPages = Math.ceil(result.total / limit);

      const response = {
        data: result.data,
        total: result.total,
        meta: {
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrevious: page > 1,
        },
      };

      this.metrics.recordDuration(`${this.serviceName}.${operation}.duration`, Date.now() - startTime);
      this.metrics.incrementCounter(`${this.serviceName}.${operation}.success`);

      this.logger.info(`${operation} completed`, {
        total: result.total,
        returned: result.data.length,
      });

      return response;
    } catch (error) {
      this.metrics.incrementCounter(`${this.serviceName}.${operation}.errors`);
      this.logger.error(`${operation} failed`, { pagination, filters, error: error as Error });
      throw new ServiceError(`Failed to find ${this.serviceName} records`, error);
    }
  }

  async create(data: Partial<T>, context?: ServiceContext, options?: ServiceOptions): Promise<T> {
    const operation = 'create';
    const startTime = Date.now();

    try {
      this.logger.info(`${operation} started`, { context });
      this.metrics.incrementCounter(`${this.serviceName}.${operation}.attempts`);

      // Validate access
      await this.validateAccess(operation, { data }, context);

      // Validate data
      if (!options?.skipValidation) {
        await this.validateData(data, 'create');
      }

      // Apply business rules
      const processedData = await this.applyBusinessRules(data, 'create', context);

      const result = await this.repository.create(processedData);

      // Audit log
      if (options?.auditLog !== false) {
        await this.logAuditEvent('create', result, context);
      }

      this.metrics.recordDuration(`${this.serviceName}.${operation}.duration`, Date.now() - startTime);
      this.metrics.incrementCounter(`${this.serviceName}.${operation}.success`);

      this.logger.info(`${operation} completed`, { id: result.id });
      return result;
    } catch (error) {
      this.metrics.incrementCounter(`${this.serviceName}.${operation}.errors`);
      this.logger.error(`${operation} failed`, { error: error as Error, context });
      throw new ServiceError(`Failed to create, ${this.serviceName}`, error);
    }
  }

  async update(id: string | number, data: Partial<T>, context?: ServiceContext, options?: ServiceOptions): Promise<T> {
    const operation = 'update';
    const startTime = Date.now();

    try {
      this.logger.info(`${operation} started`, { id, context });
      this.metrics.incrementCounter(`${this.serviceName}.${operation}.attempts`);

      // Check if record exists and validate access
      const existing = await this.repository.findById(id);
      if (!existing) {
        throw new ServiceError(`${this.serviceName} not found`, null, HTTP_STATUS_CODES.NOT_FOUND);
      }

      await this.validateAccess(operation, { id, existing }, context);

      // Validate data
      if (!options?.skipValidation) {
        await this.validateData(data, 'update');
      }

      // Apply business rules
      const processedData = await this.applyBusinessRules(data, 'update', context, existing);

      const result = await this.repository.update(id, processedData);

      // Audit log
      if (options?.auditLog !== false) {
        await this.logAuditEvent('update', { before: existing, after: result }, context);
      }

      this.metrics.recordDuration(`${this.serviceName}.${operation}.duration`, Date.now() - startTime);
      this.metrics.incrementCounter(`${this.serviceName}.${operation}.success`);

      this.logger.info(`${operation} completed`, { id });
      return result;
    } catch (error) {
      this.metrics.incrementCounter(`${this.serviceName}.${operation}.errors`);
      this.logger.error(`${operation} failed`, { id, error: error as Error });
      throw new ServiceError(`Failed to update ${this.serviceName}`, error);
    }
  }

  async delete(
    id: string | number,
    context?: ServiceContext,
    options?: ServiceOptions & { soft?: boolean }
  ): Promise<T> {
    const operation = 'delete';
    const startTime = Date.now();

    try {
      this.logger.info(`${operation} started`, { id, soft: options?.soft, context });
      this.metrics.incrementCounter(`${this.serviceName}.${operation}.attempts`);

      // Check if record exists and validate access
      const existing = await this.repository.findById(id);
      if (!existing) {
        throw new ServiceError(`${this.serviceName} not found`, null, HTTP_STATUS_CODES.NOT_FOUND);
      }

      await this.validateAccess(operation, { id, existing }, context);

      // Check for dependencies
      await this.validateDeletion(existing, context);

      const result = options?.soft ? await this.repository.softDelete(id) : await this.repository.delete(id);

      // Audit log
      if (options?.auditLog !== false) {
        await this.logAuditEvent(options?.soft ? 'soft_delete' : 'delete', existing, context);
      }

      this.metrics.recordDuration(`${this.serviceName}.${operation}.duration`, Date.now() - startTime);
      this.metrics.incrementCounter(`${this.serviceName}.${operation}.success`);

      this.logger.info(`${operation} completed`, { id, soft: options?.soft });
      return result;
    } catch (error) {
      this.metrics.incrementCounter(`${this.serviceName}.${operation}.errors`);
      this.logger.error(`${operation} failed`, { id, error: error as Error });
      throw new ServiceError(`Failed to delete ${this.serviceName}`, error);
    }
  }

  // Abstract methods to be implemented by child classes
  protected abstract validateAccess(operation: string, data: any, context?: ServiceContext): Promise<void>;

  protected abstract validateData(data: Partial<T>, operation: 'create' | 'update'): Promise<void>;

  protected abstract applyBusinessRules(
    data: Partial<T>,
    operation: 'create' | 'update',
    context?: ServiceContext,
    existing?: T
  ): Promise<Partial<T>>;

  protected abstract applyServiceFilters(
    filters?: Record<string, any>,
    context?: ServiceContext
  ): Promise<Record<string, any>>;

  // Optional hooks
  protected async validateDeletion(entity: T, context?: ServiceContext): Promise<void> {
    // Override in child classes if needed
  }

  protected async logAuditEvent(action: string, data: any, context?: ServiceContext): Promise<void> {
    this.logger.info('Audit event', {
      action,
      service: this.serviceName,
      data,
      context,
      timestamp: new Date().toISOString(),
    });
  }

  protected buildCacheKey(...parts: string[]): string {
    return `${this.serviceName}:${parts.join(':')}`;
  }
}

export class ServiceError extends Error {
  constructor(
    message: string,
    public readonly cause?: any,
    public readonly statusCode: number = HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}
