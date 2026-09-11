import { Container, Service } from 'typedi';
import { InvalidRefreshTokenError } from '../../../entities/errors/auth/invalid-refresh-token.error.ts';
import {
  REFRESH_TOKEN_REPOSITORY,
  type IRefreshTokenRepository,
} from '../../interfaces/refresh-token.repository.interface.ts';
import { TOKEN_SERVICE, type ITokenService } from '../../interfaces/token.service.interface.ts';

@Service()
export class RefreshAccessTokenUseCase {
  private readonly refreshTokenRepository: IRefreshTokenRepository;
  private readonly tokenService: ITokenService;

  constructor() {
    this.refreshTokenRepository = Container.get<IRefreshTokenRepository>(REFRESH_TOKEN_REPOSITORY);
    this.tokenService = Container.get<ITokenService>(TOKEN_SERVICE);
  }

  async execute(refreshToken: string): Promise<string> {
    const userId = await this.refreshTokenRepository.find(refreshToken);
    if (userId === null) {
      throw new InvalidRefreshTokenError();
    }

    return this.tokenService.signAccessToken({ userId });
  }
}
