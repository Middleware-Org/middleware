# AGENTS.md

Agent guide for this repository (`middleware`).
Use this as the default operating manual for coding agents.

## 1) Project Snapshot

- Stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Prisma, SWR, Zustand.
- Package manager: `npm` (`package-lock.json` is present).
- Content sources: local generated content (`.velite`) and GitHub-backed content APIs under `lib/github`.
- App structure: route handlers in `app/api/**/route.ts`, pages/layouts in `app/**/page.tsx` and `layout.tsx`.
- Auth and protected admin behavior are server-enforced in actions and API handlers.

## 2) Cursor/Copilot Rules

- `.cursorrules`: not found.
- `.cursor/rules/`: not found.
- `.github/copilot-instructions.md`: not found.
- If these files are added later, treat them as higher-priority repository instructions and update this file.

## 3) Setup and Environment

- Install deps: `npm install`
- Generate Prisma client (also runs in `postinstall`): `npm run postinstall`
- Required env vars are referenced in code (example: `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_TOKEN`, `MIDDLEWARE_PRISMA_DATABASE_URL`).
- Do not commit secrets from `.env`.

## 4) Build, Lint, Typecheck, Test Commands

### Core Commands

- Dev server: `npm run dev`
- Production build: `npm run build`
- Start production server: `npm run start`
- Lint whole repo: `npm run lint`
- Auto-fix lint: `npm run lint:fix`
- Typecheck: `npm run typecheck`
- Prettier check: `npm run format`
- Prettier write: `npm run format:fix`
- Full local cleanup pass: `npm run beauty`

### Database / Prisma

- Push schema to DB: `npm run db:push`
- Create/apply migration in dev: `npm run db:migrate`
- Prisma Studio: `npm run db:studio`

### Single-file / Targeted Checks

- Lint a single file: `npm run lint -- app/api/articles/route.ts`
- Lint a directory: `npm run lint -- app/api`
- Format-check one file: `npx prettier --check app/api/articles/route.ts`
- Format one file in place: `npx prettier --write app/api/articles/route.ts`
- Typecheck one file: not supported directly via project script (run full `npm run typecheck`).

### Tests (Current State)

- There is currently no `test` script in `package.json`.
- No test runner config (Jest/Vitest/Playwright/Cypress) was found.
- No `*.test.*` / `*.spec.*` files were found.
- Single-test command is therefore **not available yet** in current repo state.

### If/When Tests Are Added

- Add a `test` script to `package.json` and document exact commands here.
- Prefer documenting both full and single-test forms, for example (Vitest):
  - All tests: `npx vitest run`
  - Single file: `npx vitest run path/to/file.test.ts`
  - Single test name: `npx vitest run path/to/file.test.ts -t "test name"`

## 5) Code Style and Conventions

### Language and Typing

- Use TypeScript for all new app/library code.
- Keep `strict`-compatible code (`tsconfig.json` has `strict: true`).
- Prefer explicit domain types over `any`.
- Use `import type` for type-only imports.
- Narrow unknown errors with `error instanceof Error` before using `.message`.

### Imports and Module Paths

- Prefer path alias `@/` for intra-repo imports outside local siblings.
- Use relative imports for same-folder modules (for example `./styles`).
- Keep imports grouped logically:
  1. framework/third-party,
  2. internal alias imports,
  3. relative imports.
- Keep one responsibility per module where practical (especially in `lib/github/*`).

### Formatting

- Prettier is authoritative:
  - semicolons: on
  - quotes: double
  - trailing commas: all
  - tab width: 2
  - print width: 100
  - arrow parens: always
- Run `npm run format` and `npm run lint` before finishing substantial changes.

### ESLint

- ESLint extends Next core-web-vitals + TypeScript + Prettier compatibility.
- Do not reintroduce formatting rules that conflict with Prettier.
- Respect Next.js App Router conventions and server/client boundaries.

### Naming Conventions

- React components: PascalCase (files often `index.tsx` in component folders).
- Hooks: camelCase with `use` prefix (for example `useArticles`, `useTableState`).
- Zustand stores exposed as hooks commonly use `useX` naming.
- Utility functions/variables: camelCase.
- Route segment folders: Next.js style (`[slug]`, `(group)`, `[locale]`).
- Keep existing API/content field naming when bound to external schemas (snake_case fields may be intentional).

### React / Next.js Patterns

- Default to Server Components; add `"use client"` only when required.
- Use `"use server"` server actions for privileged mutations.
- In API route handlers, use `NextResponse.json(...)` with explicit HTTP status codes.
- Revalidate affected paths after mutations when needed (`revalidatePath`).
- Follow existing params typing pattern in routes/pages (some handlers use promised `params` in Next 16).

### State and Data Fetching

- SWR hooks live under `hooks/swr/*`; keep fetcher logic centralized.
- For client cache consistency, return stable shapes from hooks (`data`, loading/error flags, mutate).
- Zustand is used for lightweight UI state; keep stores minimal and focused.

### Error Handling and Logging

- Use `try/catch` in route handlers and server actions.
- Return user-safe error payloads; avoid leaking secrets/tokens.
- Prefer consistent error envelopes in actions (`{ success: false, error, errorType }`).
- Logging is allowed (especially in development), but keep it purposeful and avoid noisy logs in production paths.

### Prisma and Database

- Prisma schema lives in `prisma/schema.prisma`.
- Generated client path is customized (`lib/generated/prisma`).
- Reuse the shared Prisma singleton pattern in `lib/prisma.ts`; do not instantiate many clients.
- After schema changes, run migration/push commands and ensure generated client is up to date.

### UI and Styling

- Tailwind utility classes are common; a local `cn(...)` helper is used to compose class strings.
- Many components colocate style objects in `styles.ts`; follow local folder patterns.
- Preserve existing design language and component architecture (`atoms`, `molecules`, `organism`).

## 6) Agent Execution Checklist

- Read nearby files before editing; match existing conventions first.
- Keep diffs focused; avoid opportunistic refactors unless requested.
- Run, at minimum, `npm run lint` and `npm run typecheck` after non-trivial changes.
- If you changed formatting-sensitive files, run `npm run format` (or targeted prettier command).
- If tests are introduced later, run full and relevant single-test commands before handoff.
- Update this AGENTS.md when tooling or conventions materially change.
