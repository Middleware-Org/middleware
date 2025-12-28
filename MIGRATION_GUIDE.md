# Guida alla Migrazione: da SWR a Next.js Native Cache

## Panoramica

Questa guida documenta la nuova architettura del sistema di query e mutations, migrando da **SWR** alla **cache nativa di Next.js** con Server Actions.

## Nuova Struttura

```
lib/
├── services/              # Services con cache Next.js
│   ├── article.service.ts
│   ├── author.service.ts
│   ├── category.service.ts
│   ├── issue.service.ts
│   ├── page.service.ts
│   ├── podcast.service.ts
│   ├── user.service.ts
│   └── index.ts
├── actions/               # Server Actions centralizzate
│   ├── article.actions.ts
│   ├── author.actions.ts
│   ├── category.actions.ts
│   ├── issue.actions.ts
│   ├── page.actions.ts
│   ├── podcast.actions.ts
│   ├── user.actions.ts
│   └── index.ts
└── github/
    └── types.ts          # Types con DTO

hooks/
└── mutations/            # Hook client-side per mutations
    ├── useArticleMutations.ts
    ├── useAuthorMutations.ts
    ├── useCategoryMutations.ts
    ├── useIssueMutations.ts
    ├── usePodcastMutations.ts
    └── index.ts
```

---

## 1. Architettura

### Services (Server-side)

I **services** gestiscono le query e wrappano le funzioni GitHub esistenti. Non usano più API routes.

**Esempio - ArticleService:**

```typescript
// lib/services/article.service.ts
import { getAllArticles as getArticlesFromGitHub } from "@/lib/github/articles";

export const ARTICLE_CACHE_TAGS = {
  all: "articles",
  bySlug: (slug: string) => `article-${slug}`,
  byIssue: (issueSlug: string) => `articles-issue-${issueSlug}`,
} as const;

export class ArticleService {
  static async getAll(): Promise<Article[]> {
    return await getArticlesFromGitHub();
  }

  static async getBySlug(slug: string): Promise<Article | undefined> {
    return await getArticleFromGitHub(slug);
  }
}
```

### Server Actions

Le **Server Actions** gestiscono le mutations con invalidazione cache tramite `revalidateTag` e `revalidatePath`.

**Esempio - Article Actions:**

```typescript
// lib/actions/article.actions.ts
"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { ARTICLE_CACHE_TAGS } from "@/lib/services";

export async function deleteArticleAction(slug: string): Promise<ActionResponse> {
  const user = await getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  await deleteArticle(slug);

  // Invalida la cache
  revalidateTag(ARTICLE_CACHE_TAGS.all);
  revalidateTag(ARTICLE_CACHE_TAGS.bySlug(slug));
  revalidatePath("/admin/articles");

  return { success: true };
}
```

### Hook Client-side

Gli **hook** wrappano le Server Actions usando `useTransition` per lo stato di loading.

**Esempio - useArticleMutations:**

```typescript
// hooks/mutations/useArticleMutations.ts
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteArticleAction } from "@/lib/actions";

export function useArticleMutations() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const deleteArticle = async (slug: string) => {
    setError(null);
    return new Promise<boolean>((resolve) => {
      startTransition(async () => {
        const result = await deleteArticleAction(slug);
        if (result.success) {
          router.refresh();
          resolve(true);
        } else {
          setError(result.error || "Unknown error");
          resolve(false);
        }
      });
    });
  };

  return {
    deleteArticle,
    isPending,
    error,
    clearError: () => setError(null),
  };
}
```

---

## 2. Come Migrare i Componenti

### Prima (con SWR)

```typescript
// ❌ OLD - Con SWR
"use client";

import { useArticles } from "@/hooks/swr";
import { mutate } from "swr";

export default function ArticleListClient() {
  const { articles = [], isLoading } = useArticles();

  const handleDelete = async (slug: string) => {
    await deleteArticleAction(slug);
    mutate("/api/articles"); // Invalida cache SWR
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {articles.map((article) => (
        <ArticleCard key={article.slug} article={article} onDelete={handleDelete} />
      ))}
    </div>
  );
}
```

### Dopo (con Next.js Cache)

```typescript
// ✅ NEW - Server Component
import { ArticleService } from "@/lib/services";
import { ArticleList } from "./ArticleList";

export default async function ArticlesPage() {
  // Fetch direttamente nel Server Component
  const articles = await ArticleService.getAll();

  return <ArticleList initialArticles={articles} />;
}

// ✅ NEW - Client Component
"use client";

import { useArticleMutations } from "@/hooks/mutations";

interface Props {
  initialArticles: Article[];
}

export function ArticleList({ initialArticles }: Props) {
  const { deleteArticle, isPending, error } = useArticleMutations();

  const handleDelete = async (slug: string) => {
    const success = await deleteArticle(slug);
    // router.refresh() viene chiamato automaticamente dall'hook
  };

  return (
    <div>
      {error && <ErrorAlert message={error} />}
      {initialArticles.map((article) => (
        <ArticleCard
          key={article.slug}
          article={article}
          onDelete={handleDelete}
          isLoading={isPending}
        />
      ))}
    </div>
  );
}
```

---

## 3. Pattern di Migrazione

### Pattern 1: Lista con Mutations

**Prima:**
```typescript
const { articles, isLoading, mutate } = useArticles();
```

**Dopo:**
```typescript
// Server Component
const articles = await ArticleService.getAll();

// Client Component
const { deleteArticle, isPending } = useArticleMutations();
```

### Pattern 2: Dettaglio con Mutations

**Prima:**
```typescript
const { article, isLoading, mutate } = useArticle(slug);
```

**Dopo:**
```typescript
// Server Component
const article = await ArticleService.getBySlug(slug);

// Client Component (per actions)
const { publishArticle, isPending } = useArticleMutations();
```

### Pattern 3: Form con Server Actions

**Prima:**
```typescript
const handleSubmit = async (formData: FormData) => {
  await createArticleAction(null, formData);
  mutate("/api/articles");
  router.push("/admin/articles");
};
```

**Dopo:**
```typescript
import { createArticleAction } from "@/lib/actions";

export function ArticleForm() {
  const [state, formAction] = useFormState(createArticleAction, null);
  const { pending } = useFormStatus();

  return (
    <form action={formAction}>
      {/* form fields */}
      <button disabled={pending}>
        {pending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
```

---

## 4. Vantaggi della Nuova Architettura

### 1. **Performance**
- Nessun extra bundle per SWR (~11KB)
- Cache nativa di Next.js più veloce
- Server Components = zero JavaScript per query

### 2. **Semplicità**
- Meno codice boilerplate
- No configurazione SWR
- No API routes per semplici CRUD

### 3. **Cache Granulare**
- Tag specifici per invalidazione mirata
- `revalidateTag("article-123")` invalida solo quell'articolo
- `revalidatePath("/admin/articles")` invalida solo quella pagina

### 4. **Type Safety**
- DTO standardizzati (`CreateArticleDto`, `UpdateArticleDto`)
- `ActionResponse<T>` per tutte le actions
- Type inference automatico

---

## 5. Cosa Rimuovere

Dopo aver completato la migrazione, rimuovi:

### ❌ File da Eliminare:

```bash
# Hook SWR (8 file)
hooks/swr/
├── config.ts
├── fetcher.ts
├── index.ts
├── useArticles.ts
├── useAuthors.ts
├── useCategories.ts
├── useIssues.ts
├── useMedia.ts
├── usePages.ts
├── usePodcasts.ts
└── useUsers.ts

# Provider SWR
components/providers/SWRProvider.tsx
components/providers/SWRPageProvider.tsx

# Debug components
components/debug/SWRCacheIndicator.tsx

# API Routes (non più necessarie)
app/api/articles/route.ts
app/api/authors/route.ts
app/api/categories/route.ts
app/api/issues/route.ts
app/api/pages/route.ts
app/api/podcasts/route.ts
app/api/users/route.ts

# Actions locali (sostituiti da lib/actions/)
app/[locale]/admin/(protected)/articles/actions.ts
app/[locale]/admin/(protected)/authors/actions.ts
app/[locale]/admin/(protected)/categories/actions.ts
app/[locale]/admin/(protected)/issues/actions.ts
app/[locale]/admin/(protected)/pages/actions.ts
app/[locale]/admin/(protected)/podcasts/actions.ts
app/[locale]/admin/(protected)/users/actions.ts
```

### 📦 Package da Rimuovere:

```bash
npm uninstall swr
```

Aggiorna `package.json`:

```diff
{
  "dependencies": {
-   "swr": "^2.x.x"
  }
}
```

### 🔄 Import da Aggiornare:

**Prima:**
```typescript
import { useArticles, useArticle } from "@/hooks/swr";
import { mutate } from "swr";
```

**Dopo:**
```typescript
import { ArticleService } from "@/lib/services";
import { deleteArticleAction } from "@/lib/actions";
import { useArticleMutations } from "@/hooks/mutations";
```

---

## 6. Checklist di Migrazione

- [ ] **Testare** la nuova struttura con alcuni componenti
- [ ] **Migrare** tutti i componenti che usano SWR
- [ ] **Aggiornare** gli import nei componenti
- [ ] **Rimuovere** i file SWR obsoleti
- [ ] **Rimuovere** le API routes
- [ ] **Disinstallare** SWR da package.json
- [ ] **Testare** l'applicazione end-to-end
- [ ] **Committare** i cambiamenti

---

## 7. Troubleshooting

### Problema: "Cannot read properties of undefined"

**Causa:** Stai ancora usando hook SWR in un componente non migrato.

**Soluzione:** Migra il componente seguendo i pattern sopra.

---

### Problema: La cache non si invalida

**Causa:** Manca `revalidateTag` o `revalidatePath` nelle actions.

**Soluzione:** Verifica che tutte le actions chiamino:
```typescript
revalidateTag(ENTITY_CACHE_TAGS.all);
revalidatePath("/admin/...");
```

---

### Problema: "Error: Invariant: staticGenerationAsyncStorage..."

**Causa:** Stai chiamando una Server Action in un Server Component.

**Soluzione:** Sposta le actions in un Client Component con `"use client"`.

---

## 8. Esempi Completi

Vedi la cartella `examples/` per esempi completi di:
- Lista con CRUD
- Form con Server Actions
- Dettaglio con mutations
- Batch operations

---

## Supporto

Per domande o problemi, consulta:
- [Next.js Data Fetching Docs](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [Server Actions Docs](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

---

**Creato il:** $(date +%Y-%m-%d)
**Versione:** 1.0.0
