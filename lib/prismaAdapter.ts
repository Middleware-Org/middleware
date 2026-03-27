import { PrismaPg } from "@prisma/adapter-pg";

export function createPrismaAdapter() {
  const connectionString =
    process.env.MIDDLEWARE_POSTGRES_URL || process.env.MIDDLEWARE_DATABASE_URL;

  if (!connectionString) {
    throw new Error("MIDDLEWARE_POSTGRES_URL or MIDDLEWARE_DATABASE_URL is required");
  }

  const protocol = new URL(connectionString).protocol;
  if (protocol !== "postgres:" && protocol !== "postgresql:") {
    throw new Error("Database URL must use postgres:// or postgresql://");
  }

  return new PrismaPg({ connectionString });
}
