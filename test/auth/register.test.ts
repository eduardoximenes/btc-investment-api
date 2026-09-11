import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server/app.ts';
import { prismaClient } from '../../src/infrastructure/database/prisma.client.ts';

describe('POST /v1/account', () => {
  const email = 'registration-test@example.com';

  beforeAll(async () => {
    await prismaClient.user.deleteMany({ where: { email } });
  });

  afterAll(async () => {
    await prismaClient.user.deleteMany({ where: { email } });
  });

  it('registers a new account and hashes the password', async () => {
    const response = await request(app)
      .post('/v1/account')
      .send({ name: 'Ada Lovelace', email, password: 'correct-horse-battery-staple' });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      statusCode: 201,
      message: 'account created',
      data: {
        id: expect.any(Number),
        name: 'Ada Lovelace',
        email,
        createdAt: expect.any(String),
      },
    });
    expect(response.body.data.password).toBeUndefined();
    expect(response.body.data.passwordHash).toBeUndefined();

    const stored = await prismaClient.user.findUniqueOrThrow({ where: { email } });
    expect(stored.passwordHash).not.toBe('correct-horse-battery-staple');
    expect(stored.passwordHash).toMatch(/^\$2[aby]\$/); // bcrypt hash format
  });

  it('rejects a duplicate email with the reference API error shape', async () => {
    await request(app)
      .post('/v1/account')
      .send({ name: 'Ada Lovelace', email, password: 'correct-horse-battery-staple' });

    const response = await request(app)
      .post('/v1/account')
      .send({ name: 'Someone Else', email, password: 'another-password-1234' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      statusCode: 400,
      message: 'account already exists',
      data: null,
    });

    const count = await prismaClient.user.count({ where: { email } });
    expect(count).toBe(1);
  });

  it('rejects a malformed email', async () => {
    const response = await request(app)
      .post('/v1/account')
      .send({ name: 'Ada Lovelace', email: 'not-an-email', password: 'correct-horse-battery' });

    expect(response.status).toBe(400);
    expect(response.body.data).toBeNull();
  });

  it('rejects concurrent registrations for the same email with 400, not a raw 500', async () => {
    const concurrentEmail = 'concurrent-registration@example.com';
    await prismaClient.user.deleteMany({ where: { email: concurrentEmail } });

    const [first, second] = await Promise.all([
      request(app)
        .post('/v1/account')
        .send({ name: 'Racer One', email: concurrentEmail, password: 'first-password-123' }),
      request(app)
        .post('/v1/account')
        .send({ name: 'Racer Two', email: concurrentEmail, password: 'second-password-123' }),
    ]);

    const statuses = [first.status, second.status].sort();
    expect(statuses).toEqual([201, 400]);

    const loser = first.status === 400 ? first : second;
    expect(loser.body).toEqual({
      statusCode: 400,
      message: 'account already exists',
      data: null,
    });

    const count = await prismaClient.user.count({ where: { email: concurrentEmail } });
    expect(count).toBe(1);

    await prismaClient.user.deleteMany({ where: { email: concurrentEmail } });
  });

  it('rejects a password longer than 72 bytes instead of letting bcrypt truncate it', async () => {
    const response = await request(app)
      .post('/v1/account')
      .send({
        name: 'Ada Lovelace',
        email: 'too-long-password@example.com',
        password: 'a'.repeat(73),
      });

    expect(response.status).toBe(400);
    expect(response.body.data).toBeNull();

    const count = await prismaClient.user.count({
      where: { email: 'too-long-password@example.com' },
    });
    expect(count).toBe(0);
  });
});
