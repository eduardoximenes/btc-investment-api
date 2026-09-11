import { Container, Service } from 'typedi';
import {
  REFRESH_TOKEN_REPOSITORY,
  type IRefreshTokenRepository,
} from '../interfaces/refresh-token.repository.interface.ts';

@Service()
export class LogoutUseCase {
  private readonly refreshTokenRepository: IRefreshTokenRepository;

  constructor() {
    this.refreshTokenRepository = Container.get<IRefreshTokenRepository>(REFRESH_TOKEN_REPOSITORY);
  }

  // Deleting a nonexistent Redis key is a no-op, not an error — logging
  // out an already-invalid token is idempotent for free, no branching
  // needed here.
  async execute(refreshToken: string): Promise<void> {
    await this.refreshTokenRepository.delete(refreshToken);
  }
}
