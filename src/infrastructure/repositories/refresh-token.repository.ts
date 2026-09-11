import type { Redis } from 'ioredis';
import { Container, Service } from 'typedi';
import { REFRESH_TOKEN_TTL_SECONDS } from '../../application/constants/token-ttl.constants.ts';
import type { IRefreshTokenRepository } from '../../application/interfaces/refresh-token.repository.interface.ts';
import { REDIS_CLIENT } from '../cache/redis.client.ts';

// Key shape documented in redis.client.ts: refresh:{token} -> userId.
// Keyed by the token itself, not the user id, so logging in again doesn't
// invalidate a previous session's refresh token (ADR-0003).
const REFRESH_TOKEN_KEY_PREFIX = 'refresh:';

@Service()
export class RefreshTokenRepository implements IRefreshTokenRepository {
  private readonly redis: Redis;

  constructor() {
    this.redis = Container.get<Redis>(REDIS_CLIENT);
  }

  async save(token: string, userId: number): Promise<void> {
    await this.redis.set(
      `${REFRESH_TOKEN_KEY_PREFIX}${token}`,
      String(userId),
      'EX',
      REFRESH_TOKEN_TTL_SECONDS,
    );
  }

  async find(token: string): Promise<number | null> {
    const value = await this.redis.get(`${REFRESH_TOKEN_KEY_PREFIX}${token}`);
    return value === null ? null : Number(value);
  }

  async delete(token: string): Promise<void> {
    await this.redis.del(`${REFRESH_TOKEN_KEY_PREFIX}${token}`);
  }
}
