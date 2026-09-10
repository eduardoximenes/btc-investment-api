export interface AccessTokenPayload {
  userId: number;
}

export interface ITokenService {
  signAccessToken(payload: AccessTokenPayload): string;
  verifyAccessToken(token: string): AccessTokenPayload;
  generateRefreshToken(): string;
}

export const TOKEN_SERVICE = 'ITokenService';
