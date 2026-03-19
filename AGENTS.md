# AGENTS.md

Agent guide for this repository (`middleware`).
Use this as the default operating manual for coding agents working in this codebase.

## 1) Project Snapshot

- Framework/app stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4.
- Data/state stack: Prisma, SWR, Zustand.
- Content pipeline: `velite` generation + GitHub-backed content modules in `lib/github/*`.
- Package manager: `npm` (`package-lock.json` is present and authoritative).
- Key app layout: routes in `app/**`, API handlers in `app/api/**/route.ts`.
- Auth and admin protections are enforced server-side (actions + API handlers).

## 2) Cursor and Copilot Rule Files

- `.cursorrules`: not found.
- `.cursor/rules/`: not found.
- `.github/copilot-instructions.md`: not found.
- If any of these files are added later, treat them as higher-priority instructions and update this document.

## 3) Setup and Environment

- Install dependencies: `npm install`.
- Prisma client generation runs in `postinstall`: `npm run postinstall`.
- Dev command also generates Prisma client and Velite content: `npm run dev`.
- Expected env vars are referenced in code (examples):
  - `GITHUB_OWNER`
  - `GITHUB_REPO`
  - `GITHUB_TOKEN`
  - `MIDDLEWARE_PRISMA_DATABASE_URL`
- Never commit secrets from `.env*` files.

## 4) Build, Lint, Typecheck, and Test Commands

### Core Project Commands

- Run dev server: `npm run dev`
- Build for production: `npm run build`
- Start production server: `npm run start`
- Lint all files: `npm run lint`
- Lint and auto-fix: `npm run lint:fix`
- Type-check the project: `npm run typecheck`
- Check formatting: `npm run format`
- Write formatting changes: `npm run format:fix`
- Local cleanup pass (lint fix + format fix): `npm run beauty`

### Prisma / Database Commands

- Push schema to database: `npm run db:push`
- Create/apply dev migration: `npm run db:migrate`
- Open Prisma Studio: `npm run db:studio`
- Run role migration utility: `npm run roles:migrate`

### Targeted / Single-File Checks

- Lint one file: `npm run lint -- app/api/articles/route.ts`
- Lint one directory: `npm run lint -- app/api`
- Format-check one file: `npx prettier --check app/api/articles/route.ts`
- Format one file: `npx prettier --write app/api/articles/route.ts`
- Type-check one file: not supported by project scripts; run full `npm run typecheck`.

### Tests (Current Repository State)

- There is no `test` script in `package.json` at the moment.
- No test runner config (Vitest/Jest/Playwright/Cypress) is present.
- No `*.test.*` or `*.spec.*` files were found.
- Result: there is currently no available “run single test” command.

### If/When a Test Runner Is Added

- Add explicit test scripts to `package.json` and update this section immediately.
- Document both full-suite and single-test invocation forms.
- Example Vitest command set:
  - all tests: `npx vitest run`
  - single file: `npx vitest run path/to/file.test.ts`
  - single test by name: `npx vitest run path/to/file.test.ts -t "test name"`

## 5) Code Style and Conventions

### Language and Typing

- Write new app/library code in TypeScript.
- Keep code compatible with `strict: true` (`tsconfig.json`).
- Prefer explicit domain models/types over `any`.
- Use `import type` for type-only imports.
- Narrow unknown errors before property access (for example `error instanceof Error`).

### Imports and Module Boundaries

- Prefer `@/` path alias for non-local imports.
- Use relative imports for same-folder modules (`./x`).
- Keep imports grouped in this order:
  1. framework/third-party,
  2. internal alias imports,
  3. relative imports.
- Keep modules focused; avoid mixing unrelated responsibilities in one file.

### Formatting and Linting

- Prettier config (`prettier.config.mjs`) is authoritative:
  - `semi: true`
  - `singleQuote: false`
  - `trailingComma: "all"`
  - `tabWidth: 2`
  - `printWidth: 100`
  - `arrowParens: "always"`
- ESLint config (`eslint.config.mjs`) extends:
  - `eslint-config-next/core-web-vitals`
  - `eslint-config-next/typescript`
  - `eslint-config-prettier`
- Do not add formatting rules that conflict with Prettier.

### Naming Conventions

- React components: PascalCase.
- Hooks: camelCase with `use` prefix (`useArticles`, `useMedia`, etc.).
- Utility functions/variables: camelCase.
- Route segment folders: Next.js dynamic/segment conventions (`[slug]`, `(group)`, `[locale]`).
- Preserve external schema naming when required (including snake_case fields).

### Next.js and React Patterns

- Prefer Server Components by default.
- Add `"use client"` only where browser interactivity/state requires it.
- Use `"use server"` for privileged server actions.
- In route handlers, return `NextResponse.json(...)` with explicit status codes.
- Follow existing Next 16 parameter typing patterns in routes/pages (some handlers type `params` as `Promise<...>`).
- Revalidate paths after mutations when needed (`revalidatePath`).

### Data Fetching and State

- SWR hooks live under `hooks/swr/*`; keep fetcher behavior centralized.
- Return stable, predictable hook shapes (`data` + loading/error flags + `mutate`).
- Keep Zustand stores minimal and domain-focused.

### Error Handling and Logging

- Wrap API handlers and server actions in `try/catch` when failures are possible.
- Return safe error responses; never leak tokens, secrets, or internal credentials.
- Prefer consistent error envelopes in actions (`success`, `error`, `errorType`).
- Keep logs meaningful and avoid excessive noise in production paths.

### Prisma and Database Practices

- Prisma schema location: `prisma/schema.prisma`.
- Generated Prisma client is in `lib/generated/prisma/client`.
- Reuse the singleton client in `lib/prisma.ts`; do not instantiate many Prisma clients.
- After schema changes, run migration/push flows and ensure client generation is up to date.

### UI and Styling

- Tailwind utilities are the primary styling mechanism.
- Use existing helpers/patterns (for example `cn(...)`) when composing class names.
- Follow existing component organization patterns in this repo.

## 6) Agent Execution Checklist

- Read nearby files first and match local conventions.
- Keep diffs narrowly scoped to the requested change.
- Avoid opportunistic refactors unless explicitly requested.
- After non-trivial edits, run at least: `npm run lint` and `npm run typecheck`.
- If formatting-sensitive files changed, run `npm run format` (or targeted Prettier checks).
- Since tests are not currently configured, do not claim test execution; report that limitation clearly.
- Update this AGENTS.md when scripts, tooling, or conventions materially change.
