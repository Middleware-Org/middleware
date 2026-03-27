import { PrismaPg } from "@prisma/adapter-pg";

const CANDIDATE_DATABASE_URLS = [
  process.env.MIDDLEWARE_POSTGRES_URL,
  process.env.MIDDLEWARE_DATABASE_URL,
  process.env.DATABASE_URL,
  process.env.MIDDLEWARE_PRISMA_DATABASE_URL,
];

function resolveDirectPostgresUrl() {
  for (const candidate of CANDIDATE_DATABASE_URLS) {
    if (!candidate) {
      continue;
    }

    try {
      const protocol = new URL(candidate).protocol;
      if (protocol === "postgres:" || protocol === "postgresql:") {
        return candidate;
      }
    } catch {
      continue;
    }
  }

  return null;
}

export function createPrismaAdapter() {
  const connectionString = resolveDirectPostgresUrl();

  if (!connectionString) {
    throw new Error(
      "A direct Postgres URL is required for Prisma adapter (set MIDDLEWARE_POSTGRES_URL, MIDDLEWARE_DATABASE_URL, DATABASE_URL, or MIDDLEWARE_PRISMA_DATABASE_URL with postgres://)",
    );
  }

  return new PrismaPg({ connectionString });
}
