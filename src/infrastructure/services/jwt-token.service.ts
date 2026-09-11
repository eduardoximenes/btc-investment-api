import { randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { Service } from 'typedi';
import { ACCESS_TOKEN_TTL_SECONDS } from '../../application/constants/token-ttl.constants.ts';
import type { AccessTokenPayloadDTO } from '../../application/dtos/access-token-payload.dto.ts';
import type { ITokenService } from '../../application/interfaces/token.service.interface.ts';
import { env } from '../../server/config/env.ts';

@Service()
export class JwtTokenService implements ITokenService {
  signAccessToken(payload: AccessTokenPayloadDTO): string {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL_SECONDS });
  }

  verifyAccessToken(token: string): AccessTokenPayloadDTO {
    return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayloadDTO;
  }

  generateRefreshToken(): string {
    return randomBytes(32).toString('hex');
  }
}
