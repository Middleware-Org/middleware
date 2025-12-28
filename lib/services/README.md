# Services & Actions

## Struttura

Questa cartella contiene l'architettura professionale per query e mutations, sostituendo SWR con la cache nativa di Next.js.

### Services (`lib/services/`)

I **services** gestiscono le **query** (GET operations) e wrappano le funzioni GitHub esistenti.

- **ArticleService** - Gestione articoli
- **AuthorService** - Gestione autori
- **CategoryService** - Gestione categorie
- **IssueService** - Gestione issue/numeri
- **PageService** - Gestione pagine statiche
- **PodcastService** - Gestione podcast
- **UserService** - Gestione utenti

Ogni service:
- Espone metodi statici per le query
- Definisce i **CACHE_TAGS** per l'invalidazione
- Wrappa le funzioni GitHub esistenti

**Uso nei Server Components:**

```typescript
import { ArticleService } from "@/lib/services";

export default async function ArticlesPage() {
  const articles = await ArticleService.getAll({ published: true });

  return <ArticleList articles={articles} />;
}
```

### Actions (`lib/actions/`)

Le **actions** gestiscono le **mutations** (CREATE, UPDATE, DELETE) con invalidazione cache.

- **article.actions.ts** - CRUD articoli + publish/unpublish
- **author.actions.ts** - CRUD autori
- **category.actions.ts** - CRUD categorie
- **issue.actions.ts** - CRUD issue + publish/unpublish
- **page.actions.ts** - CRUD pagine
- **podcast.actions.ts** - CRUD podcast + publish/unpublish
- **user.actions.ts** - CRUD utenti

Ogni action:
- Usa `"use server"` directive
- Verifica autenticazione con `getUser()`
- Chiama `revalidateTag()` e `revalidatePath()`
- Ritorna `ActionResponse<T>`

**Uso con useFormState:**

```typescript
import { createArticleAction } from "@/lib/actions";
import { useFormState } from "react-dom";

export function ArticleForm() {
  const [state, formAction] = useFormState(createArticleAction, null);

  return <form action={formAction}>...</form>;
}
```

### Mutations Hooks (`hooks/mutations/`)

Gli **hook** wrappano le actions per mutations veloci (delete, publish, etc.) con `useTransition`.

**Uso:**

```typescript
import { useArticleMutations } from "@/hooks/mutations";

export function ArticleList({ articles }: Props) {
  const { deleteArticle, isPending, error } = useArticleMutations();

  const handleDelete = async (slug: string) => {
    const success = await deleteArticle(slug);
    if (success) {
      // router.refresh() viene chiamato automaticamente
    }
  };

  return <div>...</div>;
}
```

## Cache Strategy

### Cache Tags

Ogni risorsa ha tag specifici per invalidazione granulare:

```typescript
ARTICLE_CACHE_TAGS = {
  all: "articles",                          // Tutti gli articoli
  bySlug: (slug) => `article-${slug}`,     // Articolo specifico
  byIssue: (slug) => `articles-issue-${slug}`,
  byAuthor: (slug) => `articles-author-${slug}`,
  byCategory: (slug) => `articles-category-${slug}`,
}
```

### Invalidazione

Le actions invalidano automaticamente i tag corretti:

```typescript
export async function updateArticleAction(...) {
  const article = await updateArticle(slug, data);

  // Invalida cache
  revalidateTag(ARTICLE_CACHE_TAGS.all);
  revalidateTag(ARTICLE_CACHE_TAGS.bySlug(slug));
  revalidateTag(ARTICLE_CACHE_TAGS.byIssue(article.issue));
  revalidatePath("/admin/articles");

  return { success: true, data: article };
}
```

## Types

I types sono definiti in `lib/github/types.ts` con DTO standardizzati:

```typescript
export type Article = { /* ... */ };
export type CreateArticleDto = Omit<Article, "slug" | "last_update">;
export type UpdateArticleDto = Partial<CreateArticleDto>;
export type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
```

## Migrazione da SWR

Vedi `MIGRATION_GUIDE.md` per la guida completa alla migrazione.

**In breve:**

**Prima (SWR):**
```typescript
const { articles, isLoading, mutate } = useArticles();
```

**Dopo (Next.js Cache):**
```typescript
// Server Component
const articles = await ArticleService.getAll();

// Client Component (per mutations)
const { deleteArticle, isPending } = useArticleMutations();
```
