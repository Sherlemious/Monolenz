import winston from 'winston';
import newrelic from 'newrelic';

interface LogContext {
  requestId?: string;
  userId?: string;
  operation?: string;
  duration?: number;
  [key: string]: any;
}

export class Logger {
  private logger: winston.Logger;

  constructor(private service: string) {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
          return JSON.stringify({
            timestamp,
            level,
            message,
            service: service || this.service,
            ...meta,
          });
        })
      ),
      defaultMeta: { service: this.service },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        }),
      ],
    });

    // Add file transport in production
    if (process.env.NODE_ENV === 'production') {
      this.logger.add(
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
        })
      );
      this.logger.add(
        new winston.transports.File({
          filename: 'logs/combined.log',
        })
      );
    }
  }

  info(message: string, context?: LogContext) {
    this.logger.info(message, context);
    if (context) {
      newrelic.addCustomAttributes(context);
    }
  }

  error(message: string, context?: LogContext & { error?: Error }) {
    this.logger.error(message, context);
    if (context?.error) {
      newrelic.noticeError(context.error, context);
    }
    if (context) {
      newrelic.addCustomAttributes(context);
    }
  }

  warn(message: string, context?: LogContext) {
    this.logger.warn(message, context);
    if (context) {
      newrelic.addCustomAttributes(context);
    }
  }

  debug(message: string, context?: LogContext) {
    this.logger.debug(message, context);
  }
}

// apps/api/src/utils/metrics.ts
