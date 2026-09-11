import { describe, expect, it } from 'vitest';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { app } from '../src/server/app.ts';
import { env } from '../src/server/config/env.ts';

const PROTECTED_PATH = '/v1/__test/protected';

describe('global auth middleware', () => {
  it('rejects a request with no Authorization header', async () => {
    const response = await request(app).get(PROTECTED_PATH);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ statusCode: 401, message: 'unauthorized', data: null });
  });

  it('rejects a malformed/invalid token', async () => {
    const response = await request(app)
      .get(PROTECTED_PATH)
      .set('Authorization', 'Bearer not-a-real-jwt');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ statusCode: 401, message: 'unauthorized', data: null });
  });

  it('rejects an expired token', async () => {
    const expiredToken = jwt.sign({ userId: 1 }, env.JWT_SECRET, { expiresIn: -10 });

    const response = await request(app)
      .get(PROTECTED_PATH)
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ statusCode: 401, message: 'unauthorized', data: null });
  });

  it('accepts a valid token and exposes the authenticated user id to the handler', async () => {
    const token = jwt.sign({ userId: 42 }, env.JWT_SECRET, { expiresIn: 3600 });

    const response = await request(app).get(PROTECTED_PATH).set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ statusCode: 200, message: 'ok', data: { userId: 42 } });
  });

  it('rejects a non-Bearer Authorization scheme', async () => {
    const response = await request(app).get(PROTECTED_PATH).set('Authorization', 'Basic whatever');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ statusCode: 401, message: 'unauthorized', data: null });
  });
});
