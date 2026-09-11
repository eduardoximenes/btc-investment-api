import type { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { HttpError } from '../../adapters/http/errors/http-error.ts';
import {
  TOKEN_SERVICE,
  type ITokenService,
} from '../../application/interfaces/token.service.interface.ts';

const BEARER_PREFIX = 'Bearer ';

const tokenService = Container.get<ITokenService>(TOKEN_SERVICE);

/**
 * Global gate for every route mounted after it (see app.ts): reads
 * `Authorization: Bearer <token>`, verifies it as a signed access token,
 * and stashes the authenticated User's id on res.locals for downstream
 * handlers — read it with getAuthenticatedUserId. Any failure (missing
 * header, malformed token, bad signature, expired token) collapses to
 * the same non-leaky 401; jwt.verify's own error message never reaches
 * the client.
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith(BEARER_PREFIX)) {
    next(new HttpError(401, 'unauthorized'));
    return;
  }

  try {
    const { userId } = tokenService.verifyAccessToken(header.slice(BEARER_PREFIX.length));
    res.locals.userId = userId;
    next();
  } catch {
    next(new HttpError(401, 'unauthorized'));
  }
}

/**
 * Reads the User id authMiddleware stashed on res.locals. Throws a
 * controlled 500 (not a raw destructure crash) if a handler ever runs
 * without authMiddleware having run first — mirrors getValidated in
 * validate.middleware.ts.
 */
export function getAuthenticatedUserId(res: Response): number {
  if (!('userId' in res.locals)) {
    throw new HttpError(500, 'authMiddleware did not run before this handler');
  }
  return res.locals.userId as number;
}
