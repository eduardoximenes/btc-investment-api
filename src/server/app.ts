import 'reflect-metadata';
import './config/env.ts';
import './config/di.ts';

import express, { type Express } from 'express';
import { API_PREFIX, API_VERSION } from './config/api-version.ts';
import { authMiddleware } from './middlewares/auth.middleware.ts';
import { correlationIdMiddleware } from './middlewares/correlation-id.middleware.ts';
import { errorHandlerMiddleware } from './middlewares/error-handler.middleware.ts';
import { notFoundMiddleware } from './middlewares/not-found.middleware.ts';
import { protectedRoutes, publicRoutes } from './routes/v1/index.ts';

// The configured app, with no `.listen()` call — kept separate from
// index.ts so tests (supertest) can exercise it directly without binding a
// real port. index.ts is the only thing that starts listening.
export const app: Express = express();

app.use(correlationIdMiddleware);
app.use(express.json());

app.get('/', (_req, res) => {
  res.status(200).json({
    name: 'btc-investment-api',
    version: API_VERSION,
    health: `${API_PREFIX}/health`,
  });
});

app.use(API_PREFIX, publicRoutes);
app.use(API_PREFIX, authMiddleware, protectedRoutes);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);
