# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Middleware is an Italian editorial/magazine CMS built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS 4. It manages articles, podcasts, issues, authors, categories, and static pages. The site is deployed on Vercel at middleware.media.

## Commands

- `npm run dev` — start dev server (generates Prisma client + Velite content first)
- `npm run build` — production build
- `npm run lint` — ESLint check; `npm run lint:fix` to auto-fix
- `npm run typecheck` — TypeScript check (`tsc --noEmit`)
- `npm run format` — Prettier check; `npm run format:fix` to auto-fix
- `npm run beauty` — lint:fix + format:fix combined
- `npm run db:push` — push Prisma schema to database
- `npm run db:migrate` — create/apply Prisma migration
- Lint single file: `npm run lint -- app/api/articles/route.ts`
- No test runner is configured; no test files exist.

## Architecture

### Dual Content System

Content lives in two places with distinct roles:

1. **Velite (read-only, public site):** Markdown/JSON files in `content/` (articles, podcasts, authors, categories, issues, pages) are compiled at build time by Velite (`velite.config.ts`). Output lands in `.velite/` and is imported as `@/.velite`. The `lib/content/` module builds in-memory lookup maps from this data for the public-facing site.

2. **GitHub API (CMS write path):** The admin CMS reads and writes content via the GitHub Contents API (`lib/github/`). All operations target a dev branch (`GITHUB_DEV_BRANCH`, defaults to `develop`). Each entity type (articles, authors, categories, issues, pages, podcasts) has a dedicated module in `lib/github/` that wraps `lib/github/client.ts`. Media uploads also go through GitHub (stored in `public/assets/`).

This means the public site renders from build-time Velite data, while the admin CMS operates on the GitHub repo directly.

### Routing

- All public routes are under `app/[locale]/` with locale-based routing (currently only `it`). The middleware in `proxy.ts` detects locale from `Accept-Language` and redirects.
- Admin routes: `app/[locale]/admin/(protected)/` (authenticated) and `app/[locale]/admin/(public)/` (login).
- API routes: `app/api/` with subdirectories per entity (articles, authors, categories, issues, pages, podcasts, media, users, github).

### Auth

Uses `better-auth` with email/password. Server-side helpers in `lib/auth/server.ts`: `getSession()`, `getUser()`, `getCmsUser()`, `getAdminUser()`. Client-side hook via `lib/auth/client.ts` (`useSession`). Two roles: `ADMIN` and `EDITOR`.

### Database

PostgreSQL via Prisma. Schema at `prisma/schema.prisma`, generated client at `lib/generated/prisma/`. Singleton client in `lib/prisma.ts` uses a pg adapter (`lib/prismaAdapter.ts`). The database manages auth-related models only (User, Session, Account, Verification) — content is in GitHub.

Connection string env vars: `MIDDLEWARE_POSTGRES_URL` or `MIDDLEWARE_DATABASE_URL` (see `prisma.config.ts`).

### Data Fetching (Admin)

- SWR hooks in `hooks/swr/` (useArticles, useAuthors, useCategories, useIssues, useMedia, usePages, usePodcasts, useUsers) with centralized fetcher config.
- Zustand stores in `lib/store/` for client-side UI state.
- Client-side caching modules in `lib/cache/` (bookmarks, podcast progress, media) use IndexedDB via `idb`.

### Key Env Vars

`GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_TOKEN`, `GITHUB_DEV_BRANCH`, `MIDDLEWARE_POSTGRES_URL` / `MIDDLEWARE_DATABASE_URL`, `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_BLOB_HOSTNAME`.

## Code Conventions

- Package manager: `npm` (package-lock.json is authoritative).
- Path alias: `@/*` maps to project root.
- `import type` is enforced by ESLint (`consistent-type-imports`).
- `no-explicit-any` is set to `error`.
- Prettier: double quotes, semicolons, trailing commas, 100 char width, 2-space indent.
- Pre-commit hook (Husky + lint-staged) runs ESLint on staged `.ts`/`.tsx` files.
- Next.js params in layouts/pages are typed as `Promise<{ locale: string }>` (Next 16 async params pattern).
- Server Components by default; `"use client"` only when needed.
