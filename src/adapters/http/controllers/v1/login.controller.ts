import { Container, Service } from 'typedi';
import type { Request, Response } from 'express';
import { InvalidCredentialsError } from '../../../../entities/errors/invalid-credentials.error.ts';
import type { LoginUserDTO } from '../../../../application/dtos/login-user.dto.ts';
import { LoginUserUseCase } from '../../../../application/use-cases/login-user.use-case.ts';
import { getValidated } from '../../../../server/middlewares/validate.middleware.ts';
import { HttpError } from '../../errors/http-error.ts';
import { sendSuccess } from '../../responses/send-success.ts';
import type { LoginBody } from '../../schemas/v1/login.schema.ts';

@Service()
export class LoginController {
  private readonly loginUserUseCase: LoginUserUseCase;

  constructor() {
    this.loginUserUseCase = Container.get(LoginUserUseCase);
  }

  handle = async (_req: Request, res: Response): Promise<void> => {
    const { email, password } = getValidated<LoginBody>(res);
    const dto: LoginUserDTO = { email, password };

    try {
      const tokens = await this.loginUserUseCase.execute(dto);
      sendSuccess(res, tokens);
    } catch (err) {
      if (err instanceof InvalidCredentialsError) {
        throw new HttpError(401, err.message);
      }
      throw err;
    }
  };
}
