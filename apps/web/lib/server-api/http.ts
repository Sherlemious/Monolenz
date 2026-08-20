import { NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@monolenz/types/api';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ZodError } from 'zod';
import { AuthError, ServiceError } from 'api/core';

type JsonBody = Record<string, unknown>;

function meta() {
  return {
    timestamp: new Date().toISOString(),
    requestId: crypto.randomUUID(),
    version: '1.0.0',
  };
}

export function jsonSuccess<T>(data: T, message = 'Success', status: number = HTTP_STATUS_CODES.OK) {
  return NextResponse.json({ success: true, message, data, meta: meta() }, { status });
}

export function jsonError(
  message: string,
  status: number = HTTP_STATUS_CODES.BAD_REQUEST,
  errors?: Array<string | { field?: string; message?: string }>
) {
  const body: JsonBody = { success: false, message, meta: meta() };
  if (errors) body.errors = errors;
  return NextResponse.json(body, { status });
}

export function jsonFromError(error: unknown) {
  if (error instanceof AuthError || (error instanceof Error && error.name === 'AuthError')) {
    const status = error instanceof AuthError ? error.status : 400;
    return jsonError(error.message, status, [{ field: 'auth', message: error.message }]);
  }

  if (error instanceof ServiceError) {
    const errors = Array.isArray(error.cause) ? (error.cause as string[]) : undefined;
    return jsonError(error.message, error.statusCode, errors);
  }

  if (error instanceof ZodError) {
    const errors = error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return jsonError('Validation failed', HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY, errors);
  }

  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return jsonError('Duplicate entry', HTTP_STATUS_CODES.CONFLICT, ['Resource already exists']);
    }
    if (error.code === 'P2025') {
      return jsonError('Resource not found', HTTP_STATUS_CODES.NOT_FOUND);
    }
  }

  console.error('API route error', error);
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : error instanceof Error
        ? error.message
        : 'Unknown error occurred';
  return jsonError(message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
}
