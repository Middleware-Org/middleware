# Development Setup Guide

Complete guide to setting up your local development environment for Middleware.

---

## Prerequisites

### Required Software

- **Node.js** 20.x or higher ([Download](https://nodejs.org/))
- **npm** 9.x or higher (comes with Node.js)
- **Git** 2.x or higher
- **PostgreSQL** 14.x or higher ([Download](https://www.postgresql.org/download/))
- **Code Editor** - Recommended: VS Code with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - Prisma

### Optional but Recommended

- **GitHub CLI** (`gh`) for easier GitHub operations
- **Docker** for running PostgreSQL in a container
- **pnpm** as faster alternative to npm

---

## Quick Start

```bash
# 1. Clone repository
git clone https://github.com/Middleware-Org/middleware.git
cd middleware

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# 4. Set up database
npx prisma generate
npx prisma db push

# 5. Create admin user (see below)

# 6. Run development server
npm run dev
```

---

## Detailed Setup Steps

### 1. Database Setup

#### Option A: Local PostgreSQL

```bash
# Create database
createdb middleware_dev

# Create user (optional)
psql -c "CREATE USER middleware WITH PASSWORD 'your_password';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE middleware_dev TO middleware;"
```

#### Option B: Docker PostgreSQL

```bash
docker run --name middleware-postgres \
  -e POSTGRES_DB=middleware_dev \
  -e POSTGRES_USER=middleware \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:16
```

### 2. Environment Variables

Create `.env.local` in project root:

```env
# Database
MIDDLEWARE_PRISMA_DATABASE_URL="postgresql://middleware:your_password@localhost:5432/middleware_dev"

# GitHub (for content management)
GITHUB_OWNER="Middleware-Org"
GITHUB_REPO="middleware"
GITHUB_TOKEN="ghp_your_personal_access_token_here"
GITHUB_DEV_BRANCH="develop"

# Authentication
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
BETTER_AUTH_SECRET="your-random-secret-key-min-32-chars"
BETTER_AUTH_URL="http://localhost:3000"

# Vercel Blob (optional - for media uploads)
# Leave empty for local development
BLOB_READ_WRITE_TOKEN=""
```

#### GitHub Token Setup

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes:
   - `repo` (full control of private repositories)
   - `workflow` (if you need CI/CD access)
4. Copy token to `GITHUB_TOKEN` in `.env.local`

#### Generate Auth Secret

```bash
# Generate random secret
openssl rand -base64 32
```

### 3. Database Schema

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (creates tables)
npx prisma db push

# Open Prisma Studio to view database
npx prisma studio
```

### 4. Create Admin User

```bash
# Hash a password
node -e "console.log(require('bcryptjs').hashSync('your_password', 10))"
```

Then insert user in database:

```sql
-- Open psql
psql middleware_dev

-- Insert admin user
INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt")
VALUES (
  'admin-1',
  'admin@example.com',
  'Admin User',
  '$2a$10$...your_hashed_password_here...',
  'admin',
  NOW(),
  NOW()
);
```

Or use Prisma Studio (http://localhost:5555) to create the user via GUI.

### 5. Seed Content (Optional)

The `content/` folder should have initial content. If empty:

```bash
# Create sample article
mkdir -p content/articles
cat > content/articles/sample.md << 'ARTICLE'
---
title: "Welcome to Middleware"
date: 2025-12-05
author: admin
category: general
issue: issue-1
published: true
---

# Welcome

This is a sample article.
ARTICLE

# Create sample author
mkdir -p content/authors
cat > content/authors/admin.json << 'JSON'
{
  "slug": "admin",
  "name": "Admin User",
  "description": "Administrator"
}
JSON
```

---

## Running the Development Server

```bash
npm run dev
```

The server will start on:
- **Public site:** http://localhost:3000
- **Admin panel:** http://localhost:3000/admin

Login with credentials created in step 4.

---

## Development Workflow

### Code Quality

```bash
# Run linter
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Check formatting
npm run format

# Auto-fix formatting
npm run format:fix

# Run both
npm run beauty

# Type checking
npm run typecheck
```

### Database Migrations

```bash
# Create migration
npx prisma migrate dev --name add_field

# Apply migrations
npx prisma migrate deploy

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

### Content Development

1. Edit content in `content/` folder
2. Velite watches for changes in dev mode
3. Content is automatically reprocessed
4. Refresh browser to see changes

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Database Connection Error

```bash
# Check PostgreSQL is running
pg_isready

# Check connection string
echo $MIDDLEWARE_PRISMA_DATABASE_URL
```

### Prisma Client Not Found

```bash
# Regenerate Prisma client
npx prisma generate
```

### Velite Build Errors

```bash
# Clear Velite cache
rm -rf .velite

# Restart dev server
npm run dev
```

### ESLint/TypeScript Errors

```bash
# Install missing type definitions
npm install --save-dev @types/node @types/react @types/react-dom
```

---

## IDE Configuration

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

### Recommended Extensions

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

---

## Next Steps

- Read [Architecture Documentation](ARCHITECTURE.md)
- Check [API Documentation](API.md)
- See [Contributing Guidelines](../CONTRIBUTING.md)
- Join the team on Slack/Discord

---

**Need Help?**

- GitHub Issues: https://github.com/Middleware-Org/middleware/issues
- Email: dev@middleware.media
