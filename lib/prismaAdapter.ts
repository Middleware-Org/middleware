import { PrismaPg } from "@prisma/adapter-pg";

export function createPrismaAdapter() {
  const connectionString = process.env.MIDDLEWARE_PRISMA_DATABASE_URL;

  if (!connectionString) {
    throw new Error("MIDDLEWARE_PRISMA_DATABASE_URL is required");
  }

  const protocol = new URL(connectionString).protocol;
  if (protocol !== "postgres:" && protocol !== "postgresql:") {
    throw new Error("MIDDLEWARE_PRISMA_DATABASE_URL must use postgres:// or postgresql://");
  }

  return new PrismaPg({ connectionString });
}
