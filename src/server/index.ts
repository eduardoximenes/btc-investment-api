import { Container } from 'typedi';
import {
  LOGGER_SERVICE,
  type ILoggerService,
} from '../application/interfaces/logger.service.interface.ts';
import { app } from './app.ts';
import { API_PREFIX } from './config/api-version.ts';
import { env } from './config/env.ts';

app.listen(env.PORT, env.HOST, () => {
  const logger = Container.get<ILoggerService>(LOGGER_SERVICE);
  logger.info('server_started', { url: `http://${env.HOST}:${env.PORT}${API_PREFIX}` });
});
