import { PrismaClient } from '@prisma/client';

// Use same PrismaClient as your PrismaService, just instantiate directly
export const prisma = new PrismaClient();