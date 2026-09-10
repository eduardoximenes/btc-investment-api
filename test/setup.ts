import { afterAll } from 'vitest';
import { prismaClient } from '../src/infrastructure/database/prisma.client.ts';
import { redisClient } from '../src/infrastructure/cache/redis.client.ts';

// Importing src/server/app.ts wires up real Prisma/Redis connections (per
// issue #1's testing decision: no mocking at the HTTP-test layer). Close
// them once this test file's run is done so `vitest run` actually exits
// instead of hanging on open handles.
afterAll(async () => {
  await prismaClient.$disconnect();
  redisClient.disconnect();
});
