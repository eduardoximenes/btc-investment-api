import { Router } from 'express';
import { Container } from 'typedi';
import { LogoutController } from '../../../adapters/http/controllers/v1/logout.controller.ts';
import { logoutSchema } from '../../../adapters/http/schemas/v1/logout.schema.ts';
import { validateRequest } from '../../middlewares/validate.middleware.ts';

export const logoutRoutes = Router();

const logoutController = Container.get(LogoutController);

logoutRoutes.post('/logout', validateRequest(logoutSchema, 'body'), logoutController.handle);
