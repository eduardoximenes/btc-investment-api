import { Container, Service } from 'typedi';
import type { Request, Response } from 'express';
import {
  LOGGER_SERVICE,
  type ILoggerService,
} from '../../../../application/interfaces/logger.service.interface.ts';
import { API_VERSION } from '../../../../server/config/api-version.ts';

@Service()
export class HealthController {
  private readonly logger: ILoggerService;

  constructor() {
    this.logger = Container.get<ILoggerService>(LOGGER_SERVICE);
  }

  handle = (_req: Request, res: Response): void => {
    this.logger.info('health_check');
    res.status(200).json({ status: 'ok', version: API_VERSION });
  };
}
