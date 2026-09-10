import type { Response } from 'express';

/**
 * The project-wide success-response convention, mirroring the error shape
 * error-handler.middleware.ts already renders: `{ statusCode, message, data }`.
 * One envelope for the whole API — a client checks `data` for the payload
 * and `message` for what happened, regardless of success or failure.
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  options?: { statusCode?: number; message?: string },
): void {
  const statusCode = options?.statusCode ?? 200;
  const message = options?.message ?? 'ok';
  res.status(statusCode).json({ statusCode, message, data });
}
