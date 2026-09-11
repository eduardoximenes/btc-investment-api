import { Router } from 'express';
import { env } from '../../config/env.ts';
import { accountRoutes } from './account.routes.ts';
import { healthRoutes } from './health.routes.ts';
import { loginRoutes } from './login.routes.ts';
import { logoutRoutes } from './logout.routes.ts';
import { refreshRoutes } from './refresh.routes.ts';
import { testProtectedRoutes } from './test-protected.routes.ts';

// Everything here sits ahead of authMiddleware (see app.ts) — no access
// token required. health is a platform concern; account/login/refresh/
// logout are unauthenticated by design (issue #22 — logout included,
// since a client must be able to log out even with an expired access
// token, which is exactly the case the refresh flow exists to cover).
export const publicRoutes = Router();
publicRoutes.use(healthRoutes);
publicRoutes.use(accountRoutes);
publicRoutes.use(loginRoutes);
publicRoutes.use(refreshRoutes);
publicRoutes.use(logoutRoutes);

// Everything here sits behind authMiddleware. No real business route
// exists yet — testProtectedRoutes only mounts under NODE_ENV=test, to
// exercise the middleware end-to-end (issue #22).
export const protectedRoutes = Router();
if (env.NODE_ENV === 'test') {
  protectedRoutes.use(testProtectedRoutes);
}
