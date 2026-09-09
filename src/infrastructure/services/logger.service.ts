import { Service } from 'typedi';
import type { ILoggerService } from '../../application/interfaces/logger.service.interface.ts';

@Service()
export class LoggerService implements ILoggerService {
  info(message: string, meta?: Record<string, unknown>): void {
    console.log(JSON.stringify({ level: 'info', message, ...meta }));
  }

  error(message: string, meta?: Record<string, unknown>): void {
    console.error(JSON.stringify({ level: 'error', message, ...meta }));
  }
}
