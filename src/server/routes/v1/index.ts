import { Router } from 'express';
import { accountRoutes } from './account.routes.ts';
import { healthRoutes } from './health.routes.ts';
import { loginRoutes } from './login.routes.ts';

export const routes = Router();

routes.use(healthRoutes);
routes.use(accountRoutes);
routes.use(loginRoutes);
