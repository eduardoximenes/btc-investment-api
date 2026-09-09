import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { runWithCorrelationId } from '../../infrastructure/logging/correlation-id.store.ts';

export const CORRELATION_ID_HEADER = 'x-correlation-id';

/**
 * Generates a correlation id for this request and opens an AsyncLocalStorage
 * scope carrying it for the request's full lifetime, so every log line
 * emitted while handling it (however deep in the call stack) picks it up
 * automatically. Must run before any other middleware/route that logs.
 */
export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const correlationId = randomUUID();
  res.setHeader(CORRELATION_ID_HEADER, correlationId);
  runWithCorrelationId(correlationId, next);
}
