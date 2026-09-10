import type { User } from '../../entities/models/user.entity.ts';

export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
}

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
}

export const USER_REPOSITORY = 'IUserRepository';
