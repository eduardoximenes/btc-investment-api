import type { PublicUser, User } from '../../entities/models/user.entity.ts';
import type { CreateUserRecordDTO } from '../dtos/auth/create-user.dto.ts';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserRecordDTO): Promise<PublicUser>;
}

export const USER_REPOSITORY = 'IUserRepository';
