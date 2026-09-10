import bcrypt from 'bcrypt';
import { Service } from 'typedi';
import type { IPasswordHasher } from '../../application/interfaces/password-hasher.interface.ts';

// bcrypt silently truncates input past 72 bytes rather than erroring — the
// Zod schema (adapters/http/schemas/v1/account.schema.ts) rejects
// oversized passwords with a 400 before they ever reach this service, per
// issue #19's Implementation Decisions.
const SALT_ROUNDS = 10;

@Service()
export class BcryptPasswordHasherService implements IPasswordHasher {
  async hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, SALT_ROUNDS);
  }

  async compare(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
  }
}
