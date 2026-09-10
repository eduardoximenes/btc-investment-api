import { randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { Service } from 'typedi';
import { ACCESS_TOKEN_TTL_SECONDS } from '../../application/constants/token-ttl.constants.ts';
import type {
  AccessTokenPayload,
  ITokenService,
} from '../../application/interfaces/token.service.interface.ts';
import { env } from '../../server/config/env.ts';

@Service()
export class JwtTokenService implements ITokenService {
  signAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL_SECONDS });
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
  }

  generateRefreshToken(): string {
    return randomBytes(32).toString('hex');
  }
}
