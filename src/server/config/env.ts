import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().min(1).default('0.0.0.0'),
  DATABASE_URL: z.url({
    protocol: /^postgres(ql)?$/,
    error: 'must be a valid postgres(ql):// connection URL',
  }),
  REDIS_URL: z.url({
    protocol: /^rediss?$/,
    error: 'must be a valid redis(s):// connection URL',
  }),
});

export type Env = z.infer<typeof envSchema>;

function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n');
}

function parseEnv(source: NodeJS.ProcessEnv): Env {
  const result = envSchema.safeParse(source);

  if (!result.success) {
    console.error(
      `Invalid environment configuration. Fix the following variable(s):\n${formatIssues(result.error)}`,
    );
    process.exit(1);
  }

  return result.data;
}

export const env: Env = parseEnv(process.env);
