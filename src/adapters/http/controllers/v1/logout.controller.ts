import { Container, Service } from 'typedi';
import type { Request, Response } from 'express';
import { LogoutUseCase } from '../../../../application/use-cases/logout.use-case.ts';
import { getValidated } from '../../../../server/middlewares/validate.middleware.ts';
import { sendSuccess } from '../../responses/send-success.ts';
import type { LogoutBody } from '../../schemas/v1/logout.schema.ts';

@Service()
export class LogoutController {
  private readonly logoutUseCase: LogoutUseCase;

  constructor() {
    this.logoutUseCase = Container.get(LogoutUseCase);
  }

  handle = async (_req: Request, res: Response): Promise<void> => {
    const { refreshToken } = getValidated<LogoutBody>(res);

    await this.logoutUseCase.execute(refreshToken);
    sendSuccess(res, null);
  };
}
