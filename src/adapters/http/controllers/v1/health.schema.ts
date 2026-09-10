import { z } from 'zod';

// Demonstrates the validation convention (docs/agents/validation.md) on a
// real, permanent endpoint: an invalid `verbose` value produces a 400
// through the shared error handler; omitting it keeps the health check's
// original behavior.
export const healthQuerySchema = z.object({
  verbose: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => value === 'true'),
});

export type HealthQuery = z.infer<typeof healthQuerySchema>;
