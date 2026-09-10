import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { app } from '../src/server/app.ts';
import { env } from '../src/server/config/env.ts';
import { prismaClient } from '../src/infrastructure/database/prisma.client.ts';
import { redisClient } from '../src/infrastructure/cache/redis.client.ts';
import { REFRESH_TOKEN_TTL_SECONDS } from '../src/application/constants/token-ttl.constants.ts';

describe('POST /v1/login', () => {
  const email = 'login-test@example.com';
  const password = 'correct-horse-battery-staple';
  let userId: number;

  beforeAll(async () => {
    await prismaClient.user.deleteMany({ where: { email } });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prismaClient.user.create({
      data: { name: 'Login Tester', email, passwordHash },
    });
    userId = user.id;
  });

  afterAll(async () => {
    await prismaClient.user.deleteMany({ where: { email } });
  });

  it('logs in with correct credentials and returns an access token + refresh token', async () => {
    const response = await request(app).post('/v1/login').send({ email, password });

    expect(response.status).toBe(200);
    expect(typeof response.body.data.token).toBe('string');
    expect(typeof response.body.data.refreshToken).toBe('string');

    const decoded = jwt.verify(response.body.data.token, env.JWT_SECRET) as {
      userId: number;
      iat: number;
      exp: number;
    };
    expect(decoded.userId).toBe(userId);
    expect(decoded.exp - decoded.iat).toBe(60 * 60); // ACCESS_TOKEN_TTL_SECONDS

    const key = `refresh:${response.body.data.refreshToken}`;
    const storedUserId = await redisClient.get(key);
    expect(storedUserId).toBe(String(userId));

    const ttl = await redisClient.ttl(key);
    expect(ttl).toBeGreaterThan(0);
    expect(ttl).toBeLessThanOrEqual(REFRESH_TOKEN_TTL_SECONDS);

    await redisClient.del(key);
  });

  it('issues a distinct refresh token per login without invalidating the previous one (multi-session)', async () => {
    const first = await request(app).post('/v1/login').send({ email, password });
    const second = await request(app).post('/v1/login').send({ email, password });

    expect(first.body.data.refreshToken).not.toBe(second.body.data.refreshToken);

    const firstStillValid = await redisClient.get(`refresh:${first.body.data.refreshToken}`);
    const secondStillValid = await redisClient.get(`refresh:${second.body.data.refreshToken}`);
    expect(firstStillValid).toBe(String(userId));
    expect(secondStillValid).toBe(String(userId));

    await redisClient.del(`refresh:${first.body.data.refreshToken}`);
    await redisClient.del(`refresh:${second.body.data.refreshToken}`);
  });

  it('rejects a wrong password with 401 "invalid password"', async () => {
    const response = await request(app)
      .post('/v1/login')
      .send({ email, password: 'not-the-right-password' });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      statusCode: 401,
      message: 'invalid password',
      data: null,
    });
  });

  it('rejects an unknown email with the same 401 shape as a wrong password (no enumeration)', async () => {
    const response = await request(app)
      .post('/v1/login')
      .send({ email: 'nobody-registered@example.com', password: 'whatever-password' });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      statusCode: 401,
      message: 'invalid password',
      data: null,
    });
  });

  it('rejects a malformed login body', async () => {
    const response = await request(app).post('/v1/login').send({ email: 'not-an-email' });

    expect(response.status).toBe(400);
    expect(response.body.data).toBeNull();
  });
});
