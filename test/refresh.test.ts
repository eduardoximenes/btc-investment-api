import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { app } from '../src/server/app.ts';
import { env } from '../src/server/config/env.ts';
import { prismaClient } from '../src/infrastructure/database/prisma.client.ts';
import { redisClient } from '../src/infrastructure/cache/redis.client.ts';
import { REFRESH_TOKEN_TTL_SECONDS } from '../src/application/constants/token-ttl.constants.ts';

describe('POST /v1/refresh', () => {
  const email = 'refresh-test@example.com';
  let userId: number;
  let refreshToken: string;

  beforeAll(async () => {
    await prismaClient.user.deleteMany({ where: { email } });
    const passwordHash = await bcrypt.hash('correct-horse-battery-staple', 10);
    const user = await prismaClient.user.create({
      data: { name: 'Refresh Tester', email, passwordHash },
    });
    userId = user.id;
    refreshToken = 'refresh-test-token';
    await redisClient.set(`refresh:${refreshToken}`, String(userId), 'EX', REFRESH_TOKEN_TTL_SECONDS);
  });

  afterAll(async () => {
    await redisClient.del(`refresh:${refreshToken}`);
    await prismaClient.user.deleteMany({ where: { email } });
  });

  it('exchanges a valid refresh token for a new access token', async () => {
    const response = await request(app).post('/v1/refresh').send({ refreshToken });

    expect(response.status).toBe(200);
    expect(typeof response.body.data.token).toBe('string');

    const decoded = jwt.verify(response.body.data.token, env.JWT_SECRET) as { userId: number };
    expect(decoded.userId).toBe(userId);
  });

  it('does not rotate or invalidate the refresh token used', async () => {
    const first = await request(app).post('/v1/refresh').send({ refreshToken });
    expect(first.status).toBe(200);

    const stillStored = await redisClient.get(`refresh:${refreshToken}`);
    expect(stillStored).toBe(String(userId));

    const second = await request(app).post('/v1/refresh').send({ refreshToken });
    expect(second.status).toBe(200);
  });

  it('rejects an unknown/invalid refresh token with 401', async () => {
    const response = await request(app)
      .post('/v1/refresh')
      .send({ refreshToken: 'this-token-does-not-exist' });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      statusCode: 401,
      message: 'invalid refresh token',
      data: null,
    });
  });

  it('rejects a malformed body', async () => {
    const response = await request(app).post('/v1/refresh').send({});

    expect(response.status).toBe(400);
    expect(response.body.data).toBeNull();
  });
});
