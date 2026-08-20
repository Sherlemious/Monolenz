import winston from 'winston';
import { getNewRelic } from './newrelic-optional';

interface LogContext {
  requestId?: string;
  userId?: string;
  operation?: string;
  duration?: number;
  [key: string]: unknown;
}

const isServerless = Boolean(process.env.VERCEL);

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

    if (process.env.NODE_ENV === 'production' && !isServerless) {
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
    const newrelic = getNewRelic();
    if (context && newrelic) {
      newrelic.addCustomAttributes(context as Record<string, string | number | boolean>);
    }
  }

  error(message: string, context?: LogContext & { error?: Error }) {
    this.logger.error(message, context);
    const newrelic = getNewRelic();
    if (newrelic && context?.error) {
      newrelic.noticeError(context.error, context as Record<string, string | number | boolean>);
    }
    if (newrelic && context) {
      newrelic.addCustomAttributes(context as Record<string, string | number | boolean>);
    }
  }

  warn(message: string, context?: LogContext) {
    this.logger.warn(message, context);
    const newrelic = getNewRelic();
    if (context && newrelic) {
      newrelic.addCustomAttributes(context as Record<string, string | number | boolean>);
    }
  }

  debug(message: string, context?: LogContext) {
    this.logger.debug(message, context);
  }
}
