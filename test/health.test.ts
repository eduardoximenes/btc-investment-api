import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../src/server/app.ts';
import { API_VERSION } from '../src/server/config/api-version.ts';

describe('GET /v1/health', () => {
  it('returns a successful response', async () => {
    const response = await request(app).get('/v1/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      statusCode: 200,
      message: 'ok',
      data: { status: 'ok', version: API_VERSION },
    });
  });

  it('rejects a malformed ?verbose value with the shared error shape', async () => {
    const response = await request(app).get('/v1/health').query({ verbose: 'banana' });

    expect(response.status).toBe(400);
    expect(response.body.statusCode).toBe(400);
    expect(response.body.data).toBeNull();
  });
});
