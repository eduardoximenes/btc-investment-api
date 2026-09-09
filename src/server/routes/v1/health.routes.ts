import { Router } from 'express';
import { Container } from 'typedi';
import { HealthController } from '../../../adapters/http/controllers/v1/health.controller.ts';

export const healthRoutes = Router();

const healthController = Container.get(HealthController);

healthRoutes.get('/health', healthController.handle);
