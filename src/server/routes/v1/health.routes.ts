import { Router } from 'express';
import { Container } from 'typedi';
import { HealthController } from '../../../adapters/http/controllers/v1/health.controller.ts';
import { healthQuerySchema } from '../../../adapters/http/controllers/v1/health.schema.ts';
import { validateRequest } from '../../middlewares/validate.middleware.ts';

export const healthRoutes = Router();

const healthController = Container.get(HealthController);

healthRoutes.get(
  '/health',
  validateRequest(healthQuerySchema, 'query'),
  healthController.handle,
);
