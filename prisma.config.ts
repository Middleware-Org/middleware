import "dotenv/config";
import { defineConfig } from "prisma/config";

const directDatabaseUrl =
  process.env.MIDDLEWARE_POSTGRES_URL || process.env.MIDDLEWARE_DATABASE_URL;

if (!directDatabaseUrl) {
  throw new Error("MIDDLEWARE_POSTGRES_URL or MIDDLEWARE_DATABASE_URL is required");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: directDatabaseUrl,
  },
});
