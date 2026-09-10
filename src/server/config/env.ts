import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().min(1).default('0.0.0.0'),
  // z.url({ protocol }) only checks the scheme via regex — a host-less value
  // like "postgresql:oops" still passes (WHATWG URL parsing doesn't require
  // "//" + a host for non-special schemes). Require it explicitly instead.
  DATABASE_URL: z
    .string()
    .regex(/^postgres(ql)?:\/\/[^\s/]+/, 'must be a valid postgres(ql):// connection URL'),
  REDIS_URL: z
    .string()
    .regex(/^rediss?:\/\/[^\s/]+/, 'must be a valid redis(s):// connection URL'),
  JWT_SECRET: z.string().min(32, 'must be at least 32 characters'),
});

export type Env = z.infer<typeof envSchema>;

function parseEnv(source: NodeJS.ProcessEnv): Env {
  const result = envSchema.safeParse(source);

  if (!result.success) {
    console.error(`Invalid environment configuration:\n${z.prettifyError(result.error)}`);
    process.exit(1);
  }

  return result.data;
}

export const env: Env = parseEnv(process.env);
