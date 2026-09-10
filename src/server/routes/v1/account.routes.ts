import { Router } from 'express';
import { Container } from 'typedi';
import { AccountController } from '../../../adapters/http/controllers/v1/account.controller.ts';
import { createAccountSchema } from '../../../adapters/http/schemas/v1/account.schema.ts';
import { validateRequest } from '../../middlewares/validate.middleware.ts';

export const accountRoutes = Router();

const accountController = Container.get(AccountController);

accountRoutes.post(
  '/account',
  validateRequest(createAccountSchema, 'body'),
  accountController.handle,
);
