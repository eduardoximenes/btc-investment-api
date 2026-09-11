import { Router } from 'express';
import { Container } from 'typedi';
import { RefreshController } from '../../../adapters/http/controllers/v1/refresh.controller.ts';
import { refreshSchema } from '../../../adapters/http/schemas/v1/refresh.schema.ts';
import { validateRequest } from '../../middlewares/validate.middleware.ts';

export const refreshRoutes = Router();

const refreshController = Container.get(RefreshController);

refreshRoutes.post('/refresh', validateRequest(refreshSchema, 'body'), refreshController.handle);
