import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';
import { MetricsCollector } from '../utils/metrics';

const logger = new Logger('ObservabilityMiddleware');
const metrics = new MetricsCollector();

export const observabilityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Track request metrics
  metrics.incrementCounter('http.requests.total', 1, {
    method: req.method,
    path: req.path,
  });

  // Override res.json to capture response metrics
  const originalJson = res.json;
  res.json = function (data) {
    const duration = Date.now() - startTime;

    // Record metrics
    metrics.recordDuration('http.request.duration', duration, {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
    });

    metrics.incrementCounter(`http.responses.${res.statusCode}`, 1, {
      method: req.method,
      path: req.path,
    });

    // Log request completion
    logger.info('Request completed', {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      userId: req.userId,
    });

    // Add custom event for slow requests
    if (duration > 1000) {
      metrics.addCustomEvent('SlowRequest', {
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        duration,
        userId: req.userId,
      });
    }

    return originalJson.call(this, data);
  };

  next();
};

// Health check middleware with detailed metrics
export const healthCheckMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (req.path === '/health') {
    const startTime = Date.now();

    try {
      // Check database connectivity
      const dbCheck = await checkDatabase();

      // Check cache connectivity
      const cacheCheck = await checkCache();

      // Check external dependencies
      const externalChecks = await checkExternalDependencies();

      const duration = Date.now() - startTime;

      const health = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.APP_VERSION || '1.0.0',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        checks: {
          database: dbCheck,
          cache: cacheCheck,
          ...externalChecks,
        },
        responseTime: duration,
      };

      // Record health check metrics
      metrics.recordDuration('health.check.duration', duration);
      metrics.incrementCounter('health.checks.total');

      res.status(200).json(health);
    } catch (error) {
      logger.error('Health check failed', { error: error instanceof Error ? error : new Error(String(error)) });
      metrics.incrementCounter('health.checks.failed');

      res.status(503).json({
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Health check failed',
      });
    }
  } else {
    next();
  }
};

async function checkDatabase(): Promise<{ status: string; responseTime: number }> {
  const startTime = Date.now();
  try {
    // Add actual database check here
    // For example, a simple query to check connectivity
    return {
      status: 'OK',
      responseTime: Date.now() - startTime,
    };
  } catch (_error) {
    return {
      status: 'ERROR',
      responseTime: Date.now() - startTime,
    };
  }
}

async function checkCache(): Promise<{ status: string; responseTime: number }> {
  const startTime = Date.now();
  try {
    // Add actual cache check here
    return {
      status: 'OK',
      responseTime: Date.now() - startTime,
    };
  } catch (_error) {
    return {
      status: 'ERROR',
      responseTime: Date.now() - startTime,
    };
  }
}

async function checkExternalDependencies(): Promise<Record<string, any>> {
  return {
    neon: { status: 'OK', responseTime: 0 },
    // Add other external service checks
  };
}

// Performance monitoring decorator
export function Monitor(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;
  const className = target.constructor.name;

  descriptor.value = async function (...args: any[]) {
    const startTime = Date.now();
    const methodName = `${className}.${propertyName}`;

    try {
      const result = await method.apply(this, args);
      const duration = Date.now() - startTime;

      metrics.recordDuration(`method.${methodName}.duration`, duration);
      metrics.incrementCounter(`method.${methodName}.success`);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      metrics.recordDuration(`method.${methodName}.duration`, duration);
      metrics.incrementCounter(`method.${methodName}.errors`);

      throw error;
    }
  };
}
