import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    setupFiles: ['test/setup.ts'],
    // HTTP-level tests hit a real Dockerized Postgres/Redis (no mocking at
    // this layer, per issue #1's testing decision) — a bit more headroom
    // than vitest's default for the odd slow connection.
    testTimeout: 15_000,
  },
});
