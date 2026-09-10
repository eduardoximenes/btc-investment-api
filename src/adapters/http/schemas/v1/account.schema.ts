import { z } from 'zod';

// bcrypt truncates silently past 72 bytes — reject here instead (issue
// #19's Implementation Decisions), using byte length since a password can
// contain multi-byte characters.
const MAX_PASSWORD_BYTES = 72;

export const createAccountSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .refine((value) => new TextEncoder().encode(value).length <= MAX_PASSWORD_BYTES, {
      message: `password must not exceed ${MAX_PASSWORD_BYTES} bytes`,
    }),
});

export type CreateAccountBody = z.infer<typeof createAccountSchema>;
