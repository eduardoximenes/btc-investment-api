import { Container, Service } from 'typedi';
import { AccountAlreadyExistsError } from '../../entities/errors/account-already-exists.error.ts';
import type { User } from '../../entities/models/user.entity.ts';
import type { CreateUserDTO } from '../dtos/create-user.dto.ts';
import {
  PASSWORD_HASHER,
  type IPasswordHasher,
} from '../interfaces/password-hasher.interface.ts';
import { USER_REPOSITORY, type IUserRepository } from '../interfaces/user.repository.interface.ts';

@Service()
export class RegisterUserUseCase {
  private readonly userRepository: IUserRepository;
  private readonly passwordHasher: IPasswordHasher;

  constructor() {
    this.userRepository = Container.get<IUserRepository>(USER_REPOSITORY);
    this.passwordHasher = Container.get<IPasswordHasher>(PASSWORD_HASHER);
  }

  async execute(dto: CreateUserDTO): Promise<User> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new AccountAlreadyExistsError();
    }

    const passwordHash = await this.passwordHasher.hash(dto.password);

    return this.userRepository.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
    });
  }
}
