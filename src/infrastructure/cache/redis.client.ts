import { Redis } from 'ioredis';
import { requestLogger } from '../logging/pino.ts';
import { env } from '../../server/config/env.ts';

export const REDIS_CLIENT = 'RedisClient';

// One shared connection for every Redis-backed concern (see issue #1).
// Namespace your keys by prefix so they don't collide:
//   cache:*   - cached reads (e.g. the current Quote)
//   refresh:* - refresh tokens (refresh:{token} -> userId)
//   bull:*    - BullMQ's own prefix for queues/jobs; it manages this itself,
//               no manual prefixing needed when passing this client as a
//               queue/worker's `connection`.
export const redisClient: Redis = new Redis(env.REDIS_URL);

// ioredis connects eagerly and emits 'error' on connection failures; an
// unhandled 'error' event crashes the process, so it needs a listener even
// though ioredis itself already retries with backoff.
redisClient.on('error', (err: unknown) => {
  requestLogger.error({ err }, 'redis_connection_error');
});
