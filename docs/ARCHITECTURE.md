# Architecture Documentation

> Comprehensive guide to Middleware's system design, architectural patterns, and technical decisions.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Core Architectural Patterns](#core-architectural-patterns)
4. [Directory Structure](#directory-structure)
5. [Data Flow](#data-flow)
6. [Component Architecture](#component-architecture)
7. [State Management](#state-management)
8. [Content Management System](#content-management-system)
9. [Authentication & Authorization](#authentication--authorization)
10. [Performance Optimizations](#performance-optimizations)
11. [Security Considerations](#security-considerations)
12. [Scalability](#scalability)

---

## System Overview

Middleware is a **Next.js 16 App Router** application that combines:
- **Public Magazine Site** - Server-rendered pages with SSR/SSG
- **Admin CMS** - Protected routes with rich editing capabilities
- **Git-Based Content Storage** - Version-controlled content via GitHub API
- **PostgreSQL Database** - User management and session storage

### Technology Decisions

| Technology | Reason |
|------------|--------|
| **Next.js 16** | App Router for advanced routing, React Server Components, Server Actions |
| **React 19** | Latest features (use, useTransition, useActionState) |
| **TypeScript Strict** | Type safety, better DX, catch errors at compile-time |
| **Tailwind CSS 4** | Utility-first, performance, DX |
| **Velite** | Type-safe content layer, compile-time validation |
| **Prisma** | Type-safe database access, migrations, developer experience |
| **Better Auth** | Modern auth library, TypeScript-first, Prisma integration |

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Public Site                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Home    │  │ Articles │  │ Podcasts │  │  Issues  │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│       │             │              │             │               │
│       └─────────────┴──────────────┴─────────────┘               │
│                         │                                         │
│                         ▼                                         │
│                  ┌──────────────┐                                │
│                  │ Server       │                                │
│                  │ Components   │                                │
│                  └──────┬───────┘                                │
│                         │                                         │
│                         ▼                                         │
│                  ┌──────────────┐                                │
│                  │ Velite       │◄───────────┐                  │
│                  │ Content      │            │                  │
│                  │ Layer        │            │                  │
│                  └──────────────┘            │                  │
└─────────────────────────────────────────────┼──────────────────┘
                                               │
┌──────────────────────────────────────────────┼──────────────────┐
│                     Admin Panel              │                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │                   │
│  │ Articles │  │  Users   │  │  Media   │  │                   │
│  │  Editor  │  │  Mgmt    │  │ Library  │  │                   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  │                   │
│       │             │              │         │                   │
│       └─────────────┴──────────────┘         │                   │
│                     │                         │                   │
│                     ▼                         │                   │
│              ┌──────────────┐                │                   │
│              │ API Routes   │                │                   │
│              └──────┬───────┘                │                   │
│                     │                         │                   │
│        ┌────────────┼────────────┐           │                   │
│        │            │            │           │                   │
│        ▼            ▼            ▼           │                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │                   │
│  │ GitHub   │ │ Prisma   │ │ Vercel   │    │                   │
│  │ API      │ │ (DB)     │ │ Blob     │    │                   │
│  └────┬─────┘ └──────────┘ └──────────┘    │                   │
│       │                                      │                   │
│       └──────────────────────────────────────┘                   │
└──────────────────────────────────────────────────────────────────┘
                       │
                       ▼
            ┌──────────────────────┐
            │  Git Repository      │
            │  (content/ folder)   │
            │  - articles/*.md     │
            │  - authors/*.json    │
            │  - categories/*.json │
            │  - issues/*.json     │
            └──────────────────────┘
```

---

## Core Architectural Patterns

### 1. Git-Based CMS Pattern

**Problem:** How to manage content with version control, review workflows, and rollback capabilities?

**Solution:** Store all content in Git, edit via admin panel, commit via GitHub API.

```typescript
// Admin writes content
Admin Panel → API Route → GitHub API (create/update file)
                              ↓
                       Commit to 'develop' branch
                              ↓
                       Review changes in Git
                              ↓
                       Merge to 'main' (manual)
                              ↓
                       Trigger rebuild (Vercel webhook)
                              ↓
                       Velite processes content at build time
                              ↓
                       Type-safe content objects available
```

**Benefits:**
- Full version history
- Code review for content
- Rollback capability
- Branch-based workflows
- Type safety via Velite

**Implementation:**
- `lib/github/` - GitHub API client
- `content/` - Content files
- `velite.config.ts` - Content schema

### 2. SWR + SSR Hybrid Pattern

**Problem:** How to get instant page loads without loading spinners while still having fresh data?

**Solution:** Pre-populate SWR cache on the server, revalidate on client.

```typescript
// Server Component (RSC)
export default async function ArticlesPage() {
  const articles = await getAllArticles(); // Server-side fetch

  return (
    <SWRPageProvider fallback={{ '/api/articles': articles }}>
      <ArticleListClient /> {/* Client Component with SWR */}
    </SWRPageProvider>
  );
}

// Client Component
'use client';
function ArticleListClient() {
  // SWR finds data in cache immediately, no loading state!
  const { data } = useSWR('/api/articles', fetcher);

  return data.map(...); // Instant render with server data
}
```

**Benefits:**
- Zero loading spinners
- Instant page transitions
- Automatic revalidation
- Optimistic updates
- Cache deduplication

**Documentation:** See `docs/SWR_CACHE_VERIFICATION.md`

### 3. Atomic Design Pattern

**Problem:** How to organize components for maximum reusability?

**Solution:** Break components into atoms, molecules, and organisms.

```
components/
├── atoms/          # Basic building blocks (button, input, typography)
│   └── button/
│       ├── index.tsx      # Component logic
│       └── styles.ts      # Tailwind classes
│
├── molecules/      # Combinations of atoms (card, form field)
│   └── articleCard/
│       ├── index.tsx
│       └── styles.ts
│
└── organism/       # Complex UI sections (header, footer, article list)
    └── header/
        ├── index.tsx
        └── styles.ts
```

**Benefits:**
- Clear hierarchy
- Easy to find components
- Enforces reusability
- Colocated styles
- Testable units

### 4. Server Actions Pattern

**Problem:** How to handle form submissions and mutations without writing API routes?

**Solution:** Use Next.js Server Actions for type-safe mutations.

```typescript
// actions.ts (server-side)
'use server';
export async function createArticle(formData: FormData) {
  const title = formData.get('title') as string;
  // Validate, process, save to GitHub
  return { success: true, data: article };
}

// Component (client-side)
'use client';
function ArticleForm() {
  const [state, formAction] = useActionState(createArticle, null);

  return (
    <form action={formAction}>
      <input name="title" />
      <button type="submit">Create</button>
    </form>
  );
}
```

**Benefits:**
- Type-safe end-to-end
- No API routes needed
- Progressive enhancement
- Automatic revalidation

---

## Directory Structure

### App Router Structure

```
app/
├── [locale]/                    # i18n wrapper
│   ├── (home)/                  # Route group (doesn't affect URL)
│   │   ├── layout.tsx           # Shared layout for home pages
│   │   └── page.tsx             # Homepage
│   │
│   ├── articles/                # Public articles
│   │   ├── [slug]/
│   │   │   └── page.tsx         # Dynamic article page
│   │   └── page.tsx             # Article list
│   │
│   ├── podcast/[slug]/          # Podcast player
│   │   ├── components/          # Podcast-specific components
│   │   └── page.tsx
│   │
│   └── admin/                   # Admin panel
│       ├── (public)/            # Non-authenticated routes
│       │   └── login/
│       │       └── page.tsx
│       │
│       └── (protected)/         # Authenticated routes
│           ├── layout.tsx       # Auth wrapper
│           ├── articles/
│           │   ├── [slug]/edit/
│           │   │   └── page.tsx # Edit article
│           │   ├── new/
│           │   │   └── page.tsx # New article
│           │   ├── actions.ts   # Server Actions
│           │   ├── components/  # Article admin components
│           │   └── page.tsx     # Article list
│           │
│           ├── users/
│           ├── media/
│           └── ...
│
└── api/                         # API Routes
    ├── articles/
    │   ├── route.ts             # GET /api/articles
    │   └── [slug]/
    │       └── route.ts         # GET /api/articles/:slug
    │
    ├── auth/                    # Better Auth routes
    └── github/
        └── merge/
            └── check/
                └── route.ts     # Check merge status
```

### Component Organization

```
components/
├── atoms/                       # Level 1: Primitives
│   ├── button/
│   ├── date/
│   ├── separator/
│   └── typography/
│
├── molecules/                   # Level 2: Combinations
│   ├── articleCard/
│   ├── confirmDialog/
│   └── ReadingProgress/
│
├── organism/                    # Level 3: Sections
│   ├── header/
│   ├── banner/
│   └── issuesList/
│
├── table/                       # Feature-specific
├── search/
├── pagination/
└── providers/                   # Context providers
    ├── SWRPageProvider.tsx
    └── ThemeProvider.tsx
```

### Library Organization

```
lib/
├── auth/                        # Authentication
│   ├── server.ts                # Better Auth server config
│   └── client.ts                # Client-side auth helpers
│
├── content/                     # Velite content access
│   ├── articles.ts              # getAllArticles(), getArticle(slug)
│   ├── authors.ts
│   └── ...
│
├── github/                      # GitHub API client
│   ├── client.ts                # Base GitHub API wrapper
│   ├── articles.ts              # Article CRUD via GitHub
│   ├── images.ts                # Image URL helpers
│   └── types.ts                 # GitHub response types
│
├── store/                       # Zustand stores
│   └── useArticleStore.ts
│
├── storage/                     # Browser storage
│   ├── podcastProgress.ts       # IndexedDB for podcast progress
│   └── podcastBookmarks.ts      # IndexedDB for bookmarks
│
└── utils/                       # Utilities
    ├── classes.ts               # cn() for Tailwind
    ├── dates.ts                 # Date formatting
    └── window.ts                # Browser helpers
```

---

## Data Flow

### Public Site Data Flow

```
User Request
    ↓
Next.js Server Component
    ↓
Velite Content Layer (.velite/*.json)
    ↓
Pre-render HTML
    ↓
Hydrate on Client
    ↓
SWR Cache (pre-populated)
    ↓
User Interaction (navigation)
    ↓
SWR Fetches from API (/api/articles)
    ↓
Stale-While-Revalidate
```

### Admin Panel Data Flow

```
User Action (Create/Edit)
    ↓
Form Submission
    ↓
Server Action (actions.ts)
    ↓
Validation (Zod schema)
    ↓
GitHub API (create/update file)
    ↓
Commit to 'develop' branch
    ↓
SWR Cache Invalidation (mutate())
    ↓
UI Update
```

### Podcast Flow

```
User Plays Podcast
    ↓
Audio Element (HTMLAudioElement)
    ↓
useAudioPlayer Hook
    ↓
Progress Tracking (every 3s)
    ↓
IndexedDB (save progress)
    ↓
Restore on Page Load
```

---

## Component Architecture

### Component Types

#### 1. Server Components (Default)

```typescript
// app/articles/page.tsx
export default async function ArticlesPage() {
  // Fetch data on server
  const articles = await getAllArticles();

  // Pre-populate SWR cache
  const fallback = { '/api/articles': articles };

  return (
    <SWRPageProvider fallback={fallback}>
      <ArticleList />
    </SWRPageProvider>
  );
}
```

**When to use:**
- Initial page renders
- SEO-critical content
- Data fetching
- No user interaction needed

#### 2. Client Components ('use client')

```typescript
// components/ArticleList.tsx
'use client';

export function ArticleList() {
  const { data } = useSWR('/api/articles', fetcher);
  const [filter, setFilter] = useState('');

  return (
    <div>
      <input onChange={e => setFilter(e.target.value)} />
      {data.filter(a => a.title.includes(filter)).map(...)}
    </div>
  );
}
```

**When to use:**
- User interactions (onClick, onChange)
- State management (useState, useReducer)
- Effects (useEffect)
- Browser APIs

#### 3. Hybrid Pattern

```typescript
// Parent: Server Component
async function ArticlePage({ params }) {
  const article = await getArticle(params.slug);

  return (
    <>
      <ArticleHeader article={article} /> {/* Server Component */}
      <ArticleContent content={article.content} /> {/* Server Component */}
      <CommentSection articleId={article.id} /> {/* Client Component */}
    </>
  );
}
```

---

## State Management

### State Layers

```
┌─────────────────────────────────────────────────────────────┐
│  URL State (useSearchParams, usePathname)                   │
│  - Filters, pagination, sort order                          │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  Server State (SWR, TanStack Query)                         │
│  - API data, cached, automatic revalidation                 │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  Global UI State (Zustand)                                  │
│  - Theme, sidebar open/close, user preferences              │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  Local Component State (useState)                           │
│  - Form inputs, modals, temporary UI state                  │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  Browser Storage (IndexedDB)                                │
│  - Podcast progress, bookmarks, offline data                │
└─────────────────────────────────────────────────────────────┘
```

### When to Use Each

| State Type | Use Case | Example |
|-----------|----------|---------|
| **URL State** | Shareable, bookmarkable | Filter, page number |
| **SWR** | Server data | Articles, users |
| **Zustand** | Global UI | Theme, preferences |
| **useState** | Component-local | Form input, modal open |
| **IndexedDB** | Persistent client | Podcast progress |

---

## Content Management System

### Content Schema (Velite)

```typescript
// velite.config.ts
export default defineConfig({
  collections: {
    articles: {
      name: 'Article',
      pattern: 'articles/**/*.md',
      schema: s.object({
        title: s.string().max(99),
        slug: s.slug('global'),
        date: s.isodate(),
        author: s.string(),
        category: s.string(),
        issue: s.string(),
        content: s.markdown(),
        excerpt: s.string().optional(),
        published: s.boolean().default(false),
        in_evidence: s.boolean().default(false),
        audio: s.string().optional(),
        audio_chunks: s.string().optional(),
      }),
    },
  },
});
```

### Content Workflow

```
┌─────────────┐
│  1. Create  │  Admin creates article via Tiptap editor
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  2. Save    │  Server Action → GitHub API
└──────┬──────┘  Commits to 'develop' branch
       │
       ▼
┌─────────────┐
│  3. Review  │  Git diff shows changes
└──────┬──────┘  Code review process
       │
       ▼
┌─────────────┐
│  4. Merge   │  Manual merge to 'main'
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  5. Build   │  Vercel webhook triggers rebuild
└──────┬──────┘  Velite processes new content
       │
       ▼
┌─────────────┐
│  6. Deploy  │  New version with updated content
└─────────────┘
```

---

## Authentication & Authorization

### Better Auth Configuration

```typescript
// lib/auth/server.ts
export const auth = betterAuth({
  database: prismaAdapter(prisma),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
  },
});
```

### Route Protection

```typescript
// app/admin/(protected)/layout.tsx
export default async function ProtectedLayout({ children }) {
  const session = await auth.api.getSession({ headers: headers() });

  if (!session) {
    redirect('/admin/login');
  }

  return <>{children}</>;
}
```

### Role-Based Access

```typescript
// Roles: 'admin' | 'editor' | 'viewer'
// Currently only 'admin' implemented
// TODO: Implement granular permissions
```

---

## Performance Optimizations

### 1. Build-Time Processing

- **Velite** processes all markdown at build time
- No markdown parsing at runtime
- Type-safe content objects

### 2. Image Optimization

```typescript
// Automatic optimization via next/image
<Image
  src={imageUrl}
  width={800}
  height={600}
  alt="..."
  loading="lazy"
  placeholder="blur"
/>
```

### 3. Code Splitting

- Automatic route-based splitting
- Dynamic imports for heavy components

```typescript
const MarkdownEditor = dynamic(() => import('./MarkdownEditor'), {
  ssr: false,
  loading: () => <EditorSkeleton />,
});
```

### 4. SWR Cache

- Deduplicated requests
- Stale-while-revalidate
- Pre-populated from SSR

### 5. React Server Components

- Zero JavaScript for static content
- Reduced bundle size
- Faster initial page loads

---

## Security Considerations

### Current Implementation

✅ **Implemented:**
- HTTPS enforced
- TypeScript strict mode
- Prisma SQL injection protection
- Better Auth session management
- Route protection (layout-based)

⚠️ **TODO:**
- Rate limiting on API routes
- CSRF token verification
- Input sanitization in Tiptap editor
- File upload validation (size, type)
- CSP headers
- Security audit

---

## Scalability

### Current Scale

- **Content:** ~5 articles, can handle 1000s
- **Users:** Single admin, designed for <50 admins
- **Media:** Vercel Blob (scalable)
- **Database:** PostgreSQL (scalable)

### Bottlenecks

1. **GitHub API rate limits** (5000 req/hour)
   - Mitigated by caching
   - Consider GitHub App for higher limits

2. **Build time** with large content
   - Velite processes all content at build
   - Solution: Incremental Static Regeneration

3. **Database queries** without indexes
   - Add indexes for frequently queried fields

### Horizontal Scaling

- **Stateless design** - can run multiple instances
- **Vercel Functions** - auto-scales
- **Database pooling** - Prisma connection pooling

---

## Future Architectural Improvements

### Short-term (1-3 months)

1. **Add testing** - Vitest + Testing Library
2. **Implement CI/CD** - GitHub Actions
3. **Add monitoring** - Sentry for errors
4. **Security hardening** - Rate limiting, CSRF

### Medium-term (3-6 months)

1. **Multi-language support** - Expand i18n
2. **Full-text search** - PostgreSQL full-text or Algolia
3. **Comments system** - User-generated content
4. **Email notifications** - New articles, comments

### Long-term (6-12 months)

1. **Multi-tenancy** - Support multiple magazines
2. **API for external apps** - REST or GraphQL API
3. **Mobile apps** - React Native
4. **Advanced analytics** - Custom analytics dashboard

---

## Glossary

| Term | Definition |
|------|------------|
| **RSC** | React Server Component |
| **SSR** | Server-Side Rendering |
| **SSG** | Static Site Generation |
| **ISR** | Incremental Static Regeneration |
| **SWR** | Stale-While-Revalidate (also the library name) |
| **Velite** | Content processing library |
| **Atomic Design** | Component organization methodology |

---

## References

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [React Server Components](https://react.dev/reference/react/use-server)
- [SWR Documentation](https://swr.vercel.app/)
- [Velite Documentation](https://velite.js.org/)
- [Better Auth Docs](https://www.better-auth.com/)
- [Atomic Design by Brad Frost](https://atomicdesign.bradfrost.com/)

---

**Last Updated:** 2025-12-05
**Maintained by:** Middleware Team
