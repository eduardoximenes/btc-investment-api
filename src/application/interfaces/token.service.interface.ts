import type { AccessTokenPayloadDTO } from '../dtos/auth/access-token-payload.dto.ts';

export interface ITokenService {
  signAccessToken(payload: AccessTokenPayloadDTO): string;
  verifyAccessToken(token: string): AccessTokenPayloadDTO;
  generateRefreshToken(): string;
}

export const TOKEN_SERVICE = 'ITokenService';
