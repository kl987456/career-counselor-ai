// src/server/context.ts
import { PrismaClient } from "@prisma/client";

// Prevent multiple instances of Prisma in development
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function createContext() {
  return { prisma };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
