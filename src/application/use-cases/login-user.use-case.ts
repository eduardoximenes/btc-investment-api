import { Container, Service } from 'typedi';
import { InvalidCredentialsError } from '../../entities/errors/invalid-credentials.error.ts';
import type { AuthTokensDTO } from '../dtos/auth-tokens.dto.ts';
import type { LoginUserDTO } from '../dtos/login-user.dto.ts';
import {
  PASSWORD_HASHER,
  type IPasswordHasher,
} from '../interfaces/password-hasher.interface.ts';
import {
  REFRESH_TOKEN_REPOSITORY,
  type IRefreshTokenRepository,
} from '../interfaces/refresh-token.repository.interface.ts';
import { TOKEN_SERVICE, type ITokenService } from '../interfaces/token.service.interface.ts';
import { USER_REPOSITORY, type IUserRepository } from '../interfaces/user.repository.interface.ts';

@Service()
export class LoginUserUseCase {
  private readonly userRepository: IUserRepository;
  private readonly passwordHasher: IPasswordHasher;
  private readonly tokenService: ITokenService;
  private readonly refreshTokenRepository: IRefreshTokenRepository;

  constructor() {
    this.userRepository = Container.get<IUserRepository>(USER_REPOSITORY);
    this.passwordHasher = Container.get<IPasswordHasher>(PASSWORD_HASHER);
    this.tokenService = Container.get<ITokenService>(TOKEN_SERVICE);
    this.refreshTokenRepository = Container.get<IRefreshTokenRepository>(REFRESH_TOKEN_REPOSITORY);
  }

  async execute(dto: LoginUserDTO): Promise<AuthTokensDTO> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const passwordMatches = await this.passwordHasher.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new InvalidCredentialsError();
    }

    const token = this.tokenService.signAccessToken({ userId: user.id });
    const refreshToken = this.tokenService.generateRefreshToken();
    await this.refreshTokenRepository.save(refreshToken, user.id);

    return { token, refreshToken };
  }
}
