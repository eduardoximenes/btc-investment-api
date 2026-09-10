export interface IRefreshTokenRepository {
  save(token: string, userId: number): Promise<void>;
}

export const REFRESH_TOKEN_REPOSITORY = 'IRefreshTokenRepository';
