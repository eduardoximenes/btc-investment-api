import { Container } from 'typedi';
import { LOGGER_SERVICE } from '../../application/interfaces/logger.service.interface.ts';
import { PRISMA_CLIENT, prismaClient } from '../../infrastructure/database/prisma.client.ts';
import { LoggerService } from '../../infrastructure/services/logger.service.ts';

Container.set(LOGGER_SERVICE, Container.get(LoggerService));
Container.set(PRISMA_CLIENT, prismaClient);
