import { Container } from 'typedi';
import { LOGGER_SERVICE } from '../../application/interfaces/logger.service.interface.ts';
import { PASSWORD_HASHER } from '../../application/interfaces/password-hasher.interface.ts';
import { USER_REPOSITORY } from '../../application/interfaces/user.repository.interface.ts';
import { REDIS_CLIENT, redisClient } from '../../infrastructure/cache/redis.client.ts';
import { PRISMA_CLIENT, prismaClient } from '../../infrastructure/database/prisma.client.ts';
import { BcryptPasswordHasherService } from '../../infrastructure/services/bcrypt-password-hasher.service.ts';
import { LoggerService } from '../../infrastructure/services/logger.service.ts';
import { UserRepository } from '../../infrastructure/repositories/user.repository.ts';

Container.set(LOGGER_SERVICE, Container.get(LoggerService));
Container.set(PRISMA_CLIENT, prismaClient);
Container.set(REDIS_CLIENT, redisClient);
Container.set(PASSWORD_HASHER, Container.get(BcryptPasswordHasherService));
Container.set(USER_REPOSITORY, Container.get(UserRepository));
