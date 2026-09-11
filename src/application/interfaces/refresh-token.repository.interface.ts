export interface IRefreshTokenRepository {
  save(token: string, userId: number): Promise<void>;
  find(token: string): Promise<number | null>;
  delete(token: string): Promise<void>;
}

export const REFRESH_TOKEN_REPOSITORY = 'IRefreshTokenRepository';
