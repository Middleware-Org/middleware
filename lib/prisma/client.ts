/* ****************************************************************
 * Imports
 ***************************************************************** */
import { PrismaClient } from "@/lib/generated/prisma/client";

/* ****************************************************************
 * Prisma Client Singleton
 *
 * Questo pattern previene la creazione di multiple istanze
 * del Prisma Client durante il hot-reload in sviluppo Next.js
 ***************************************************************** */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
