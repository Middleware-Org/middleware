# Middleware (Teiko) - Digital Magazine Platform

> A sophisticated, Git-based content management system for the Italian political/cultural magazine **Teiko** (resistance).

[![Next.js](https://img.shields.io/badge/Next.js-16.0.7-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.1-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38bdf8)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🎯 Overview

Middleware is a modern, type-safe digital magazine platform built with Next.js 16 and React 19. It features a **Git-based CMS** where all content is version-controlled, a sophisticated admin panel with WYSIWYG editing, and a beautiful public-facing magazine site.

### Key Features

- 📝 **Git-Based CMS** - All content stored in Git with full version control
- ✍️ **Rich Markdown Editor** - Tiptap-powered WYSIWYG editor with custom extensions
- 🎙️ **Podcast Support** - Advanced audio player with transcripts and bookmarks
- 🎨 **Magazine Layout** - Beautiful, responsive design for articles and issues
- 🔐 **Secure Authentication** - Better Auth integration with session management
- 🌍 **i18n Ready** - Internationalization support (currently Italian)
- 🚀 **Serverless** - Deployed on Vercel with edge functions
- 📱 **PWA** - Progressive Web App with offline support
- 🔍 **SEO Optimized** - Automatic sitemaps, structured data, and meta tags

---

## 🏗️ Tech Stack

### Core
- **Framework:** [Next.js 16.0.7](https://nextjs.org/) (App Router)
- **UI Library:** [React 19.2.1](https://react.dev/)
- **Language:** [TypeScript 5.x](https://www.typescriptlang.org/) (strict mode)
- **Styling:** [Tailwind CSS 4.x](https://tailwindcss.com/)

### Content & Data
- **CMS:** [Velite](https://velite.js.org/) (type-safe content layer)
- **Database:** [PostgreSQL](https://www.postgresql.org/) via [Prisma 6.x](https://www.prisma.io/)
- **Content Storage:** Git + GitHub API
- **File Storage:** [Vercel Blob](https://vercel.com/storage/blob)

### State & Data Fetching
- **Global State:** [Zustand 5.x](https://zustand-demo.pmnd.rs/)
- **Server State:** [SWR 2.x](https://swr.vercel.app/) + [TanStack Query 5.x](https://tanstack.com/query)
- **Browser Storage:** [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) (idb 8.x)

### Editing & Rendering
- **Rich Text:** [Tiptap 3.x](https://tiptap.dev/)
- **Markdown:** [Marked](https://marked.js.org/), [Remark](https://remark.js.org/)
- **Typography:** [@tailwindcss/typography](https://tailwindcss.com/docs/typography-plugin)

### Auth & Security
- **Authentication:** [Better Auth 1.4.x](https://www.better-auth.com/)
- **Session Storage:** PostgreSQL (via Prisma)

### Developer Experience
- **Linting:** [ESLint 9.x](https://eslint.org/) + [Prettier 3.7.x](https://prettier.io/)
- **Type Safety:** TypeScript strict mode + Zod validation
- **Icons:** [Lucide React](https://lucide.dev/)

---

## 📁 Project Structure

```
middleware/
├── app/                          # Next.js App Router
│   ├── [locale]/                 # i18n routes
│   │   ├── (home)/               # Public homepage
│   │   ├── articles/             # Article pages
│   │   ├── podcast/              # Podcast player
│   │   ├── issues/               # Magazine issues
│   │   └── admin/                # Admin panel
│   │       ├── (public)/         # Login
│   │       └── (protected)/      # Protected routes
│   └── api/                      # API routes
│
├── components/                   # React components (Atomic Design)
│   ├── atoms/                    # Basic components
│   ├── molecules/                # Compound components
│   └── organism/                 # Complex components
│
├── lib/                          # Business logic
│   ├── auth/                     # Authentication
│   ├── content/                  # Velite content access
│   ├── github/                   # GitHub API client
│   ├── store/                    # Zustand stores
│   └── utils/                    # Utilities
│
├── content/                      # Content files (Git-managed)
│   ├── articles/                 # Markdown articles
│   ├── authors/                  # JSON author profiles
│   ├── categories/               # JSON categories
│   └── issues/                   # JSON issue metadata
│
├── prisma/                       # Database schema & migrations
├── docs/                         # Documentation
└── public/                       # Static assets
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **npm** 9+ or **pnpm** 8+
- **PostgreSQL** 14+ database
- **Git** for content management

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Middleware-Org/middleware.git
   cd middleware
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your configuration:
   ```env
   # Database
   MIDDLEWARE_PRISMA_DATABASE_URL=postgresql://user:password@localhost:5432/middleware

   # GitHub (for content management)
   GITHUB_OWNER=your-org
   GITHUB_REPO=your-repo
   GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
   GITHUB_DEV_BRANCH=develop

   # Authentication
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   BETTER_AUTH_SECRET=your-secret-key-here

   # Vercel Blob (optional, for media uploads)
   BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxx
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

---

## 📖 Documentation

- **[Architecture Overview](docs/ARCHITECTURE.md)** - System design and key patterns
- **[Setup Guide](docs/SETUP.md)** - Detailed development environment setup
- **[API Reference](docs/API.md)** - API endpoints documentation
- **[Deployment Guide](docs/DEPLOYMENT.md)** - How to deploy to production
- **[Database Schema](docs/DATABASE.md)** - Database structure and relationships
- **[Contributing](CONTRIBUTING.md)** - How to contribute to the project

---

## 🎨 Key Architectural Patterns

### 1. **Git-Based CMS**
All content is stored in Git and managed via GitHub API. Changes are committed to a `develop` branch and can be reviewed before merging to `main`.

```
Admin Panel → GitHub API (develop) → Content Files
                                    ↓
                          Velite (build-time processing)
                                    ↓
                          Public Site (type-safe content)
```

### 2. **SWR + SSR Hybrid**
Server Components pre-populate SWR cache for instant page loads without flickering:

```typescript
// Server Component
const articles = await getAllArticles();
const fallback = { "/api/articles": articles };

<SWRPageProvider fallback={fallback}>
  <ClientComponent /> {/* Uses SWR with pre-populated cache */}
</SWRPageProvider>
```

### 3. **Atomic Design**
Components follow atomic design principles with colocated styles:

```
components/atoms/button/
  ├── index.tsx      # Component logic
  └── styles.ts      # Tailwind classes
```

---

## 🛠️ Development Scripts

```bash
# Development
npm run dev              # Start dev server with Velite watch mode
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Check Prettier formatting
npm run format:fix       # Fix Prettier formatting
npm run beauty           # Run lint:fix + format:fix
npm run typecheck        # Run TypeScript type checking

# Database
npm run db:push          # Push schema changes to database
npm run db:migrate       # Create and run migrations
npm run db:studio        # Open Prisma Studio
```

---

## 🔐 Authentication

The platform uses **Better Auth** for authentication. Default admin user must be created directly in the database:

```sql
-- Create admin user (password is hashed with bcrypt)
INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt")
VALUES (
  'admin-id',
  'admin@example.com',
  'Admin',
  '$2a$10$...', -- bcrypt hash of your password
  'admin',
  NOW(),
  NOW()
);
```

See [docs/SETUP.md](docs/SETUP.md) for detailed instructions.

---

## 🌐 Content Management Workflow

1. **Create/Edit Content** in the admin panel
2. **Preview** changes locally
3. **Commit** to `develop` branch via GitHub API
4. **Review** changes in Git
5. **Merge** to `main` (triggers production rebuild)

All content changes are versioned and can be rolled back if needed.

---

## 📦 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy! Vercel will automatically build on push to `main`

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions including:
- Custom domain setup
- Database configuration
- Environment variables
- CI/CD setup

---

## 🤝 Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Code of conduct
- Development workflow
- Pull request process
- Coding standards

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Credits

Built with love by the Middleware team.

### Key Technologies
- [Next.js](https://nextjs.org/) - React framework
- [Vercel](https://vercel.com/) - Hosting platform
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Tiptap](https://tiptap.dev/) - Rich text editor
- [Prisma](https://www.prisma.io/) - Database ORM

---

## 📞 Support

For support, email [support@middleware.media](mailto:support@middleware.media) or open an issue on GitHub.

---

<div align="center">
  <strong>Made in Italy 🇮🇹</strong>
</div>
