/* **************************************************
 * API boundary types
 *
 * These are the shapes that cross the server→client boundary via JSON
 * (API routes, server actions). Use these types in client components
 * and SWR hooks — not the server-side DB models.
 *
 * Note on ApiUser: the DB model (lib/github/users.ts User) has
 * `createdAt: Date` / `updatedAt: Date`. The API serializes them to
 * ISO strings, so ApiUser has `createdAt: string` / `updatedAt: string`.
 * Server actions must explicitly call `.toISOString()` when returning
 * User data to clients (see users/actions.ts).
 * ************************************************** */
export type {
  Article,
  Author,
  Category,
  Issue,
  Page,
  Podcast,
  ApiUser,
  ApiMediaFile,
  GitHubFile,
} from "@/lib/github/types";
export type { ActionResult } from "@/lib/actions/types";
