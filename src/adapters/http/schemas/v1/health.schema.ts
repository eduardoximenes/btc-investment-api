import { z } from 'zod';

// Demonstrates the validation convention (docs/agents/validation.md) on a
// real, permanent endpoint: an invalid `verbose` value produces a 400
// through the shared error handler; omitting it keeps the health check's
// original behavior. Health has no use case behind it, so there's no
// application/dtos counterpart here — see the doc for when one applies.
export const healthQuerySchema = z.object({
  verbose: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => value === 'true'),
});

export type HealthQuery = z.infer<typeof healthQuerySchema>;
