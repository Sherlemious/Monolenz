import { PrismaClient } from '@prisma/client';
import { PaginationParams, SearchParams } from '@athaar/types/api';

export interface BaseEntity {
  id: string | number;
  created_at?: Date;
  updated_at?: Date;
}

export interface RepositoryOptions {
  include?: Record<string, any>;
  select?: Record<string, any>;
  orderBy?: Record<string, any>;
}

export abstract class BaseRepository<T extends BaseEntity> {
  protected abstract tableName: string;
  protected prisma: PrismaClient;

  constructor(protected readonly db: PrismaClient) {
    this.prisma = db;
  }

  async findById(id: string | number, options?: RepositoryOptions): Promise<T | null> {
    try {
      const result = await (this.prisma as any)[this.tableName].findUnique({
        where: { id },
        ...options,
      });
      return result;
    } catch (error) {
      throw new RepositoryError(`Failed to find ${this.tableName} by id: ${id}`, error);
    }
  }

  async findMany(options?: RepositoryOptions): Promise<T[]> {
    try {
      return await (this.prisma as any)[this.tableName].findMany(options);
    } catch (error) {
      throw new RepositoryError(`Failed to find many ${this.tableName}`, error);
    }
  }

  async findWithPagination(
    pagination: PaginationParams,
    filters?: Record<string, any>,
    options?: RepositoryOptions
  ): Promise<{ data: T[]; total: number }> {
    try {
      const { page = 1, limit = 10, sort, order = 'asc' } = pagination;
      const skip = (page - 1) * limit;

      const where = filters || {};
      const orderBy = sort ? { [sort]: order } : { created_at: 'desc' };

      const [data, total] = await Promise.all([
        (this.prisma as any)[this.tableName].findMany({
          where,
          skip,
          take: limit,
          orderBy,
          ...options,
        }),
        (this.prisma as any)[this.tableName].count({ where }),
      ]);

      return { data, total };
    } catch (error) {
      throw new RepositoryError(`Failed to paginate ${this.tableName}`, error);
    }
  }

  async create(data: Partial<T>, options?: RepositoryOptions): Promise<T> {
    try {
      return await (this.prisma as any)[this.tableName].create({
        data,
        ...options,
      });
    } catch (error) {
      throw new RepositoryError(`Failed to create ${this.tableName}`, error);
    }
  }

  async update(id: string | number, data: Partial<T>, options?: RepositoryOptions): Promise<T> {
    try {
      return await (this.prisma as any)[this.tableName].update({
        where: { id },
        data: {
          ...data,
          updated_at: new Date(),
        },
        ...options,
      });
    } catch (error) {
      throw new RepositoryError(`Failed to update ${this.tableName} with id: ${id}`, error);
    }
  }

  async delete(id: string | number): Promise<T> {
    try {
      return await (this.prisma as any)[this.tableName].delete({
        where: { id },
      });
    } catch (error) {
      throw new RepositoryError(`Failed to delete ${this.tableName} with id: ${id}`, error);
    }
  }

  async softDelete(id: string | number): Promise<T> {
    try {
      return await (this.prisma as any)[this.tableName].update({
        where: { id },
        data: {
          deleted_at: new Date(),
          updated_at: new Date(),
        },
      });
    } catch (error) {
      throw new RepositoryError(`Failed to soft delete ${this.tableName} with id: ${id}`, error);
    }
  }

  async exists(id: string | number): Promise<boolean> {
    try {
      const count = await (this.prisma as any)[this.tableName].count({
        where: { id },
      });
      return count > 0;
    } catch (error) {
      throw new RepositoryError(`Failed to check existence of ${this.tableName} with id: ${id}`, error);
    }
  }

  async count(filters?: Record<string, any>): Promise<number> {
    try {
      return await (this.prisma as any)[this.tableName].count({
        where: filters || {},
      });
    } catch (error) {
      throw new RepositoryError(`Failed to count ${this.tableName}`, error);
    }
  }

  async transaction<R>(callback: (tx: PrismaClient) => Promise<R>): Promise<R> {
    try {
      return await this.prisma.$transaction(callback);
    } catch (error) {
      throw new RepositoryError('Transaction failed', error);
    }
  }

  // Bulk operations
  async createMany(data: Partial<T>[]): Promise<{ count: number }> {
    try {
      return await (this.prisma as any)[this.tableName].createMany({
        data,
        skipDuplicates: true,
      });
    } catch (error) {
      throw new RepositoryError(`Failed to create many ${this.tableName}`, error);
    }
  }

  async updateMany(filters: Record<string, any>, data: Partial<T>): Promise<{ count: number }> {
    try {
      return await (this.prisma as any)[this.tableName].updateMany({
        where: filters,
        data: {
          ...data,
          updated_at: new Date(),
        },
      });
    } catch (error) {
      throw new RepositoryError(`Failed to update many ${this.tableName}`, error);
    }
  }

  async deleteMany(filters: Record<string, any>): Promise<{ count: number }> {
    try {
      return await (this.prisma as any)[this.tableName].deleteMany({
        where: filters,
      });
    } catch (error) {
      throw new RepositoryError(`Failed to delete many ${this.tableName}`, error);
    }
  }

  // Search functionality
  async search(searchParams: SearchParams, options?: RepositoryOptions): Promise<{ data: T[]; total: number }> {
    const { query, filters, ...pagination } = searchParams;

    let searchFilters = filters || {};

    if (query) {
      searchFilters = {
        ...searchFilters,
        OR: this.buildSearchConditions(query),
      };
    }

    return this.findWithPagination(pagination, searchFilters, options);
  }

  // Abstract method for search conditions - override in child classes
  protected abstract buildSearchConditions(query: string): Record<string, any>[];
}

export class RepositoryError extends Error {
  constructor(
    message: string,
    public readonly cause?: any
  ) {
    super(message);
    this.name = 'RepositoryError';
  }
}
