export interface ILoggerService {
  info(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
}

export const LOGGER_SERVICE = 'ILoggerService';
