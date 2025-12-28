# Guida alla Migrazione da SWR a Next.js Native Cache

Questa guida spiega come completare la migrazione da SWR alla nuova architettura basata su Services, Actions e Hooks nativi di Next.js.

## 📋 Stato della Migrazione

### ✅ Completato

- **Struttura base**: Creati `/lib/services`, `/lib/actions`, `/hooks/mutations`
- **Services**: Implementati tutti i Services con cache Next.js (Articles, Authors, Categories, Issues, Pages, Podcasts, Users, Media)
- **Actions**: Implementate tutte le Server Actions con invalidazione cache granulare
- **Hooks**: Creati tutti gli hook mutations con useTransition
- **Esempio completo**: Migrati `ArticlesPage` e `ArticleListClient` come riferimento
- **Pulizia**: Rimossi SWR hooks, providers, endpoint API e dipendenza npm

### 🔄 Da Completare

Devi migrare i restanti componenti admin seguendo il pattern degli esempi:
- Authors (page.tsx + components)
- Categories (page.tsx + components)
- Issues (page.tsx + components)
- Pages (page.tsx + components)
- Podcasts (page.tsx + components)
- Users (page.tsx + components)
- Media (page.tsx + components)

---

## 🏗️ Architettura Nuova vs Vecchia

### ❌ Vecchia Architettura (SWR)

```
Server Component (page.tsx)
  └─> Fetch dati con lib/github/*
  └─> SWRPageProvider (passa dati a cache SWR)
      └─> Client Component
          └─> useSWR hooks (legge da cache)
          └─> mutate() per invalidare cache
```

### ✅ Nuova Architettura (Next.js Native)

```
Server Component (page.tsx)
  └─> Services (fetch con cache Next.js)
  └─> Passa dati come props
      └─> Client Component (riceve props)
          └─> useXxxMutations hook
          └─> router.refresh() automatico
```

---

## 📚 Pattern di Migrazione

### 1. Server Component (page.tsx)

#### ❌ Prima (con SWR)

```typescript
import { getAllArticles } from "@/lib/github/articles";
import SWRPageProvider from "@/components/providers/SWRPageProvider";

export default async function ArticlesPage() {
  const articles = await getAllArticles();

  const swrFallback = {
    "/api/articles": articles,
  };

  return (
    <SWRPageProvider fallback={swrFallback}>
      <ArticleListClient />
    </SWRPageProvider>
  );
}
```

#### ✅ Dopo (con Services)

```typescript
import { ArticleService, IssueService, CategoryService, AuthorService } from "@/lib/services";

export default async function ArticlesPage() {
  // Fetch con cache Next.js tramite Services
  const [articles, issues, categories, authors] = await Promise.all([
    ArticleService.getAll(),
    IssueService.getAll(),
    CategoryService.getAll(),
    AuthorService.getAll(),
  ]);

  return (
    <ArticleListClient
      initialArticles={articles}
      initialIssues={issues}
      initialCategories={categories}
      initialAuthors={authors}
    />
  );
}
```

**Cambiamenti:**
1. Importa i Services invece delle funzioni GitHub dirette
2. Rimuovi `SWRPageProvider`
3. Passa i dati come props al client component
4. Usa `Promise.all()` per fetch paralleli quando possibile

---

### 2. Client Component (components/*.tsx)

#### ❌ Prima (con SWR)

```typescript
"use client";

import { useState, useTransition } from "react";
import { useArticles, useIssues } from "@/hooks/swr";
import { mutate } from "swr";
import { deleteArticleAction } from "../actions";

export default function ArticleListClient() {
  const [isPending, startTransition] = useTransition();
  const { articles = [], isLoading } = useArticles();
  const { issues = [] } = useIssues();

  async function handleDelete(slug: string) {
    startTransition(async () => {
      const result = await deleteArticleAction(slug);
      if (result.success) {
        mutate("/api/articles");
      }
    });
  }

  // ...
}
```

#### ✅ Dopo (con Mutations Hook)

```typescript
"use client";

import { useState } from "react";
import { useArticleMutations } from "@/hooks/mutations";
import type { Article, Issue } from "@/lib/github/types";

interface ArticleListClientProps {
  initialArticles: Article[];
  initialIssues: Issue[];
}

export default function ArticleListClient({
  initialArticles,
  initialIssues,
}: ArticleListClientProps) {
  const { remove, isPending, error, clearError } = useArticleMutations();
  const articles = initialArticles;
  const issues = initialIssues;

  async function handleDelete(slug: string) {
    const success = await remove(slug);
    // router.refresh() viene chiamato automaticamente dall'hook
  }

  // ...
}
```

**Cambiamenti:**
1. Rimuovi import di `useXxx` hooks da `@/hooks/swr`
2. Rimuovi import di `mutate` da `swr`
3. Rimuovi `useTransition` (già gestito dall'hook)
4. Aggiungi interfaccia Props
5. Usa `useXxxMutations` hook
6. Ricevi dati come props invece di SWR
7. Rimuovi chiamate a `mutate()` (cache invalidata automaticamente)

---

## 🔧 Hook Mutations Disponibili

Tutti gli hook seguono lo stesso pattern:

### useArticleMutations

```typescript
const {
  create,        // (formData: FormData) => Promise<Article | null>
  update,        // (formData: FormData) => Promise<Article | null>
  remove,        // (slug: string) => Promise<boolean>
  removeMultiple,// (slugs: string[]) => Promise<ActionResult>
  isPending,     // boolean
  error,         // string | null
  clearError,    // () => void
} = useArticleMutations();
```

### Altri Hook

- `useAuthorMutations` - stessa API
- `useCategoryMutations` - stessa API
- `useIssueMutations` - stessa API
- `usePageMutations` - stessa API
- `usePodcastMutations` - stessa API
- `useUserMutations` - usa `id` invece di `slug` per delete
- `useMediaMutations` - ha `upload` e `rename` invece di create/update

---

## 📝 Checklist di Migrazione per Ogni Componente

Per ogni entità (Authors, Categories, etc.), segui questi passi:

### 1. Migra Server Component (`page.tsx`)

- [ ] Sostituisci import `getAllXxx` con `XxxService.getAll()`
- [ ] Aggiungi import di altri Services se necessari (es. IssueService)
- [ ] Rimuovi `SWRPageProvider`
- [ ] Passa dati come props al client component
- [ ] Usa `Promise.all()` per fetch paralleli

### 2. Migra Client Component List (`components/XxxListClient.tsx`)

- [ ] Aggiungi interfaccia Props
- [ ] Rimuovi import `useXxx` da `@/hooks/swr`
- [ ] Rimuovi import `mutate` da `swr`
- [ ] Rimuovi `useTransition` se non usato per altro
- [ ] Aggiungi import `useXxxMutations` da `@/hooks/mutations`
- [ ] Aggiungi parametri props alla funzione
- [ ] Sostituisci hook SWR con variabili props
- [ ] Aggiorna funzioni delete per usare hook mutations
- [ ] Rimuovi chiamate a `mutate()`

### 3. Migra Client Component Form (`components/XxxFormClient.tsx`)

- [ ] Aggiungi interfaccia Props se necessario
- [ ] Rimuovi import da `@/hooks/swr`
- [ ] Aggiungi import `useXxxMutations`
- [ ] Rimuovi `useFormState` e `useTransition`
- [ ] Usa `create` o `update` dall'hook mutations
- [ ] Rimuovi chiamate a `mutate()`

---

## 🎯 Esempio Completo di Migrazione

### File: `/app/[locale]/admin/(protected)/authors/page.tsx`

```typescript
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/server";
import { AuthorService } from "@/lib/services";
import AuthorListClient from "./components/AuthorListClient";
import AuthorListSkeleton from "./components/AuthorListSkeleton";
import styles from "./styles";
import { Plus, ArrowLeft } from "lucide-react";

export default async function AuthorsPage() {
  const user = await getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const authors = await AuthorService.getAll();

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Gestione Autori</h1>
        <div className="flex gap-2">
          <Link href="/admin/authors/new" className={styles.iconButton}>
            <Plus className="w-4 h-4" />
          </Link>
          <Link href="/admin" className={styles.iconButton}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <Suspense fallback={<AuthorListSkeleton />}>
        <AuthorListClient initialAuthors={authors} />
      </Suspense>
    </main>
  );
}
```

### File: `/app/[locale]/admin/(protected)/authors/components/AuthorListClient.tsx`

```typescript
"use client";

import { useState } from "react";
import { useAuthorMutations } from "@/hooks/mutations";
import type { Author } from "@/lib/github/types";
// ... altri import

interface AuthorListClientProps {
  initialAuthors: Author[];
}

export default function AuthorListClient({ initialAuthors }: AuthorListClientProps) {
  const { remove, removeMultiple, isPending, error: mutationError, clearError } = useAuthorMutations();
  const authors = initialAuthors;

  async function handleDeleteConfirm() {
    if (!deleteDialog.author) return;
    clearError();
    setDeleteDialog({ isOpen: false, author: null });

    const success = await remove(deleteDialog.author.slug);
    if (!success && mutationError) {
      setError({ message: mutationError, type: "error" });
    }
  }

  async function handleDeleteMultipleConfirm() {
    if (selectedIds.length === 0) return;
    clearError();

    const result = await removeMultiple(selectedIds);
    if (!result.success) {
      setError({ message: result.error, type: result.errorType || "error" });
    }
  }

  // ... resto del componente
}
```

---

## 🚀 Cache e Performance

### Configurazione Cache nei Services

```typescript
// Service con revalidazione ogni 60 secondi
static getAll = unstable_cache(
  async (): Promise<Article[]> => {
    return getAllArticlesGithub();
  },
  ['articles-all'],
  {
    revalidate: 60,  // Cache dura 60 secondi
    tags: [ARTICLE_CACHE_TAGS.all],  // Tag per invalidazione
  }
);
```

### Invalidazione Cache nelle Actions

```typescript
// Action che invalida cache specifica e generale
revalidateTag(ARTICLE_CACHE_TAGS.detail(slug));  // Invalida articolo specifico
revalidateTag(ARTICLE_CACHE_TAGS.all);            // Invalida lista
revalidatePath('/admin/articles');                // Invalida pagina admin
revalidatePath('/[locale]/articles', 'page');     // Invalida pagina pubblica
```

### Router Refresh negli Hook

```typescript
// Hook che refresha automaticamente dopo mutazione
const success = await remove(slug);
if (success) {
  router.refresh();  // Chiamato automaticamente dall'hook
}
```

---

## 🐛 Troubleshooting

### Problema: Dati non si aggiornano dopo delete

**Causa**: L'hook non sta chiamando `router.refresh()`
**Soluzione**: Verifica che l'hook mutations includa:
```typescript
if (result.success) {
  router.refresh();
}
```

### Problema: Errore "useXxx is not a function"

**Causa**: Import errato da SWR
**Soluzione**: Sostituisci:
```typescript
import { useArticles } from "@/hooks/swr";  // ❌
```
Con:
```typescript
import { useArticleMutations } from "@/hooks/mutations";  // ✅
```

### Problema: Props undefined nel client component

**Causa**: Server component non passa i dati
**Soluzione**: Assicurati che il server component passi le props:
```typescript
<ArticleListClient initialArticles={articles} />
```

### Problema: Cache non si invalida

**Causa**: Tags cache non corrispondono
**Soluzione**: Verifica che i tag nelle Actions corrispondano ai tag nei Services

---

## ✅ Testing della Migrazione

Dopo ogni migrazione, testa:

1. **Lista**: Verifica che i dati vengano mostrati
2. **Create**: Crea un nuovo elemento e verifica che appaia in lista
3. **Update**: Modifica un elemento e verifica le modifiche
4. **Delete**: Elimina un elemento e verifica che sparisca
5. **Delete Multiple**: Seleziona più elementi e eliminali insieme

---

## 📞 Supporto

Per problemi o domande sulla migrazione, riferisciti a:
- Esempio completo: `/app/[locale]/admin/(protected)/articles/`
- Services: `/lib/services/`
- Actions: `/lib/actions/`
- Hooks: `/hooks/mutations/`

Buona migrazione! 🚀
