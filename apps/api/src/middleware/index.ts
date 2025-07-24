export interface RequestContext {
  requestId: string;
  startTime: Date;
  userId?: string;
  userRole?: string;
  metadata: Record<string, any>;
}

export interface CacheOptions {
  ttl: number;
  key?: string;
  tags?: string[];
}
