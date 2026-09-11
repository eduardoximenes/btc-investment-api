import { Router } from 'express';
import { Container } from 'typedi';
import { LoginController } from '../../../adapters/http/controllers/v1/auth/login.controller.ts';
import { LogoutController } from '../../../adapters/http/controllers/v1/auth/logout.controller.ts';
import { RefreshController } from '../../../adapters/http/controllers/v1/auth/refresh.controller.ts';
import { RegisterController } from '../../../adapters/http/controllers/v1/auth/register.controller.ts';
import { loginSchema } from '../../../adapters/http/schemas/v1/auth/login.schema.ts';
import { logoutSchema } from '../../../adapters/http/schemas/v1/auth/logout.schema.ts';
import { refreshSchema } from '../../../adapters/http/schemas/v1/auth/refresh.schema.ts';
import { registerSchema } from '../../../adapters/http/schemas/v1/auth/register.schema.ts';
import { validateRequest } from '../../middlewares/validate.middleware.ts';

// Every identity/session endpoint (issue #23) — the 4 route files this
// used to be (account/login/refresh/logout) are wiring-only boilerplate,
// merged here instead of one near-identical file each.
export const authRoutes = Router();

const registerController = Container.get(RegisterController);
const loginController = Container.get(LoginController);
const refreshController = Container.get(RefreshController);
const logoutController = Container.get(LogoutController);

authRoutes.post('/account', validateRequest(registerSchema, 'body'), registerController.handle);
authRoutes.post('/login', validateRequest(loginSchema, 'body'), loginController.handle);
authRoutes.post('/refresh', validateRequest(refreshSchema, 'body'), refreshController.handle);
authRoutes.post('/logout', validateRequest(logoutSchema, 'body'), logoutController.handle);
