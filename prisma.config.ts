import { defineConfig, env } from 'prisma/config';

// Reads the same DATABASE_URL variable the app's own validated env config
// (ticket #10) requires — kept independent of that module on purpose so
// running `prisma generate`/`migrate` doesn't also demand REDIS_URL, which
// has nothing to do with Prisma.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
