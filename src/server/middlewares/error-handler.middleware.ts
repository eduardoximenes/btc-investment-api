import type { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import {
  LOGGER_SERVICE,
  type ILoggerService,
} from '../../application/interfaces/logger.service.interface.ts';

function statusFrom(err: unknown): number {
  if (
    err !== null &&
    typeof err === 'object' &&
    'status' in err &&
    typeof err.status === 'number'
  ) {
    return err.status;
  }
  return 500;
}

export function errorHandlerMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    next(err);
    return;
  }

  const logger = Container.get<ILoggerService>(LOGGER_SERVICE);
  const status = statusFrom(err);
  const message = err instanceof Error ? err.message : 'Internal Server Error';

  logger.error(message, {
    statusCode: status,
    stack: err instanceof Error ? err.stack : undefined,
  });

  const publicMessage =
    status >= 500 && process.env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : message;

  res.status(status).json({ statusCode: status, message: publicMessage, data: null });
}
