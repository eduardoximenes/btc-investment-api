import { Prisma, type PrismaClient } from '@prisma/client';
import { Container, Service } from 'typedi';
import { AccountAlreadyExistsError } from '../../../entities/errors/auth/account-already-exists.error.ts';
import type { PublicUser, User } from '../../../entities/models/user.entity.ts';
import type { CreateUserRecordDTO } from '../../../application/dtos/auth/create-user.dto.ts';
import type { IUserRepository } from '../../../application/interfaces/user.repository.interface.ts';
import { PRISMA_CLIENT } from '../../database/prisma.client.ts';

// Postgres' unique-constraint error code, surfaced by Prisma as P2002.
const UNIQUE_CONSTRAINT_VIOLATION = 'P2002';

@Service()
export class UserRepository implements IUserRepository {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = Container.get<PrismaClient>(PRISMA_CLIENT);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(data: CreateUserRecordDTO): Promise<PublicUser> {
    try {
      return await this.prisma.user.create({
        data,
        select: { id: true, name: true, email: true, createdAt: true },
      });
    } catch (err) {
      const isUniqueConstraintViolation =
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === UNIQUE_CONSTRAINT_VIOLATION;
      if (isUniqueConstraintViolation) {
        throw new AccountAlreadyExistsError();
      }
      throw err;
    }
  }
}
