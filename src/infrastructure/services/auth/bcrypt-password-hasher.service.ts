import bcrypt from 'bcrypt';
import { Service } from 'typedi';
import type { IPasswordHasher } from '../../../application/interfaces/password-hasher.interface.ts';

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