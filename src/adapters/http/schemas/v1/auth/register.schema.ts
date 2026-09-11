import { z } from 'zod';

const MAX_PASSWORD_BYTES = 64;

export const registerSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z
    .string()
    .min(8)
    .refine((value) => new TextEncoder().encode(value).length <= MAX_PASSWORD_BYTES, {
      message: `password must not exceed ${MAX_PASSWORD_BYTES} bytes`,
    }),
});

export type RegisterBody = z.infer<typeof registerSchema>;
