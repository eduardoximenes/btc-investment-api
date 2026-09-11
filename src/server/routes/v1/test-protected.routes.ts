import { Router } from 'express';
import { sendSuccess } from '../../../adapters/http/responses/send-success.ts';
import { getAuthenticatedUserId } from '../../middlewares/auth.middleware.ts';

// Exists purely to exercise authMiddleware end-to-end (issue #22) — no
// protected business route exists yet. Only mounted when NODE_ENV=test
// (see index.ts); never reachable in dev/production. Not a real API
// surface — nothing to version or document beyond this comment.
export const testProtectedRoutes = Router();

testProtectedRoutes.get('/__test/protected', (_req, res) => {
  sendSuccess(res, { userId: getAuthenticatedUserId(res) });
});
