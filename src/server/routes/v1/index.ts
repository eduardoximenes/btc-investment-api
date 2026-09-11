import { Router } from 'express';
import { env } from '../../config/env.ts';
import { authRoutes } from './auth.routes.ts';
import { healthRoutes } from './health.routes.ts';
import { testProtectedRoutes } from './test-protected.routes.ts';

// Everything here sits ahead of authMiddleware (see app.ts) — no access
// token required. health is a platform concern; every identity/session
// endpoint (authRoutes: account/login/refresh/logout) is unauthenticated
// by design (issue #22 — logout included, since a client must be able to
// log out even with an expired access token, which is exactly the case
// the refresh flow exists to cover).
export const publicRoutes = Router();
publicRoutes.use(healthRoutes);
publicRoutes.use(authRoutes);

// Everything here sits behind authMiddleware. No real business route
// exists yet — testProtectedRoutes only mounts under NODE_ENV=test, to
// exercise the middleware end-to-end (issue #22).
export const protectedRoutes = Router();
if (env.NODE_ENV === 'test') {
  protectedRoutes.use(testProtectedRoutes);
}
