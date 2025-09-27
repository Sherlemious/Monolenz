import { NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '../../../../packages/types/src/api/responses';

export async function GET() {
  try {
    // Basic health check - can be expanded to check dependencies
    const healthCheck = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      checks: {
        memory: process.memoryUsage(),
      },
    };

    return NextResponse.json(healthCheck, { status: HTTP_STATUS_CODES.OK });
  } catch (error) {
    const errorCheck = {
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };

    return NextResponse.json(errorCheck, { status: HTTP_STATUS_CODES.SERVICE_UNAVAILABLE });
  }
}
