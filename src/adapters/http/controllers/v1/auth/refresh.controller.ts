import { Container, Service } from 'typedi';
import type { Request, Response } from 'express';
import { InvalidRefreshTokenError } from '../../../../../entities/errors/auth/invalid-refresh-token.error.ts';
import { RefreshAccessTokenUseCase } from '../../../../../application/use-cases/auth/refresh-access-token.use-case.ts';
import { getValidated } from '../../../../../server/middlewares/validate.middleware.ts';
import { HttpError } from '../../../errors/http-error.ts';
import { sendSuccess } from '../../../responses/send-success.ts';
import type { RefreshBody } from '../../../schemas/v1/auth/refresh.schema.ts';

@Service()
export class RefreshController {
  private readonly refreshAccessTokenUseCase: RefreshAccessTokenUseCase;

  constructor() {
    this.refreshAccessTokenUseCase = Container.get(RefreshAccessTokenUseCase);
  }

  handle = async (_req: Request, res: Response): Promise<void> => {
    const { refreshToken } = getValidated<RefreshBody>(res);

    try {
      const token = await this.refreshAccessTokenUseCase.execute(refreshToken);
      sendSuccess(res, { token });
    } catch (err) {
      if (err instanceof InvalidRefreshTokenError) {
        throw new HttpError(401, err.message);
      }
      throw err;
    }
  };
}
