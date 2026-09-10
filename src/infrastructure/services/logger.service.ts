import { Service } from 'typedi';
import type { ILoggerService } from '../../application/interfaces/logger.service.interface.ts';
import { requestLogger } from '../logging/pino.ts';

@Service()
export class LoggerService implements ILoggerService {
  info(message: string, meta?: Record<string, unknown>): void {
    requestLogger.info(meta ?? {}, message);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    requestLogger.error(meta ?? {}, message);
  }
}
