import { Router } from 'express';
import { accountRoutes } from './account.routes.ts';
import { healthRoutes } from './health.routes.ts';
import { loginRoutes } from './login.routes.ts';
import { logoutRoutes } from './logout.routes.ts';
import { refreshRoutes } from './refresh.routes.ts';

export const routes = Router();

routes.use(healthRoutes);
routes.use(accountRoutes);
routes.use(loginRoutes);
routes.use(refreshRoutes);
routes.use(logoutRoutes);
