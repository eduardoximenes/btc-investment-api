import { Container, Service } from 'typedi';
import type { Request, Response } from 'express';
import { AccountAlreadyExistsError } from '../../../../entities/errors/account-already-exists.error.ts';
import type { CreateUserDTO } from '../../../../application/dtos/create-user.dto.ts';
import { RegisterUserUseCase } from '../../../../application/use-cases/register-user.use-case.ts';
import { getValidated } from '../../../../server/middlewares/validate.middleware.ts';
import { HttpError } from '../../errors/http-error.ts';
import { sendSuccess } from '../../responses/send-success.ts';
import type { CreateAccountBody } from '../../schemas/v1/account.schema.ts';

@Service()
export class AccountController {
  private readonly registerUserUseCase: RegisterUserUseCase;

  constructor() {
    this.registerUserUseCase = Container.get(RegisterUserUseCase);
  }

  handle = async (_req: Request, res: Response): Promise<void> => {
    const { name, email, password } = getValidated<CreateAccountBody>(res);
    const dto: CreateUserDTO = { name, email, password };

    try {
      const user = await this.registerUserUseCase.execute(dto);
      sendSuccess(res, user, { statusCode: 201, message: 'account created' });
    } catch (err) {
      if (err instanceof AccountAlreadyExistsError) {
        throw new HttpError(400, err.message);
      }
      throw err;
    }
  };
}
