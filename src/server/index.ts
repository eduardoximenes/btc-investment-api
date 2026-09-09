import 'reflect-metadata';
import { env } from './config/env.ts';
import './config/di.ts';

import express, { type Express } from 'express';
import { API_PREFIX, API_VERSION } from './config/api-version.ts';
import { errorHandlerMiddleware } from './middlewares/error-handler.middleware.ts';
import { notFoundMiddleware } from './middlewares/not-found.middleware.ts';
import { routes } from './routes/v1/index.ts';

const app: Express = express();

app.use(express.json());

app.get('/', (_req, res) => {
  res.status(200).json({
    name: 'btc-investment-api',
    version: API_VERSION,
    health: `${API_PREFIX}/health`,
  });
});

//app.use('/v1', routes);
app.use(API_PREFIX, routes);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

app.listen(env.PORT, env.HOST, () => {
  console.log(`Server running at http://${env.HOST}:${env.PORT}${API_PREFIX}`);
});
