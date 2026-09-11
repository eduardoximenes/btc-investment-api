import { afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server/app.ts';
import { redisClient } from '../../src/infrastructure/cache/redis.client.ts';
import { REFRESH_TOKEN_TTL_SECONDS } from '../../src/application/constants/token-ttl.constants.ts';

describe('POST /v1/logout', () => {
  afterAll(async () => {
    await redisClient.del('refresh:logout-test-token');
  });

  it('deletes the refresh token so a later refresh attempt with it is rejected', async () => {
    const token = 'logout-test-token';
    await redisClient.set(`refresh:${token}`, '1', 'EX', REFRESH_TOKEN_TTL_SECONDS);

    const logoutResponse = await request(app).post('/v1/logout').send({ refreshToken: token });
    expect(logoutResponse.status).toBe(200);

    const stored = await redisClient.get(`refresh:${token}`);
    expect(stored).toBeNull();

    const refreshResponse = await request(app).post('/v1/refresh').send({ refreshToken: token });
    expect(refreshResponse.status).toBe(401);
  });

  it('is idempotent: logging out an already-invalid/unknown token still succeeds', async () => {
    const response = await request(app)
      .post('/v1/logout')
      .send({ refreshToken: 'never-existed-token' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ statusCode: 200, message: 'ok', data: null });
  });

  it('rejects a malformed body', async () => {
    const response = await request(app).post('/v1/logout').send({});

    expect(response.status).toBe(400);
    expect(response.body.data).toBeNull();
  });
});
