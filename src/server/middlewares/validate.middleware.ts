import type { NextFunction, Request, Response } from 'express';
import { z, type ZodType } from 'zod';
import { HttpError } from '../../application/errors/http-error.ts';

type ValidationSource = 'body' | 'query' | 'params';

/**
 * The project-wide Zod validation convention (see docs/agents/validation.md):
 * parse `req[source]` against `schema` at the route boundary, before the
 * controller runs. On failure, raises the same error shape
 * error-handler.middleware.ts already renders as a 400 — no new
 * error-handling path. On success, the parsed (and any Zod-coerced/
 * defaulted) value is available to the controller via `res.locals.validated`.
 */
export function validateRequest(schema: ZodType, source: ValidationSource = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      next(new HttpError(400, z.prettifyError(result.error)));
      return;
    }

    res.locals.validated = result.data;
    next();
  };
}

/**
 * Reads the value `validateRequest` stashed on `res.locals`, typed as `T`.
 * Throws loudly (a controlled 500, not a raw destructure crash) if a
 * controller ever runs without `validateRequest` having run first — a
 * wiring mistake, not something to silently default around.
 */
export function getValidated<T>(res: Response): T {
  if (!('validated' in res.locals)) {
    throw new HttpError(500, 'validateRequest middleware did not run before this handler');
  }
  return res.locals.validated as T;
}
