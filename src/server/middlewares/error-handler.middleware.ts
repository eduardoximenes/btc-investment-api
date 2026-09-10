import type { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import {
  LOGGER_SERVICE,
  type ILoggerService,
} from '../../application/interfaces/logger.service.interface.ts';
import { env } from '../config/env.ts';

function statusFrom(err: unknown): number {
  if (
    err !== null &&
    typeof err === 'object' &&
    'status' in err &&
    typeof err.status === 'number' &&
    Number.isInteger(err.status) &&
    err.status >= 100 &&
    err.status <= 599
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

  logger.error(message, { statusCode: status, err });

  const publicMessage = (status >= 500 && env.NODE_ENV === 'production') ? 'Internal Server Error' : message;

  res.status(status).json({ statusCode: status, message: publicMessage, data: null });
}
