import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { env } from '../../server/config/env.ts';

export const PRISMA_CLIENT = 'PrismaClient';

// Prisma 7 dropped its bundled Rust query engine in favor of driver
// adapters — this one wraps `pg` and takes the same validated DATABASE_URL
// the rest of the app uses (see ticket #10).
const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

export const prismaClient: PrismaClient = new PrismaClient({ adapter });
