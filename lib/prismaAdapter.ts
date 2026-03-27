import { PrismaPg } from "@prisma/adapter-pg";

export function createPrismaAdapter() {
  const connectionString = process.env.MIDDLEWARE_PRISMA_DATABASE_URL;

  if (!connectionString) {
    throw new Error("MIDDLEWARE_PRISMA_DATABASE_URL is required");
  }

  return new PrismaPg({ connectionString });
}
