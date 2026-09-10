import { Router } from 'express';
import { Container } from 'typedi';
import { LoginController } from '../../../adapters/http/controllers/v1/login.controller.ts';
import { loginSchema } from '../../../adapters/http/schemas/v1/login.schema.ts';
import { validateRequest } from '../../middlewares/validate.middleware.ts';

export const loginRoutes = Router();

const loginController = Container.get(LoginController);

loginRoutes.post('/login', validateRequest(loginSchema, 'body'), loginController.handle);
