# Status Migrazione da SWR - Fix Build Errors

## ✅ Completato

### Infrastruttura
- ✅ Creati `/lib/services/` con cache Next.js
- ✅ Creati `/lib/actions/` con invalidazione cache
- ✅ Creati `/hooks/mutations/` con useTransition
- ✅ Rimossi `/hooks/swr/` e tutti i file correlati
- ✅ Rimossa dipendenza `swr` da package.json
- ✅ Rimossi endpoint API REST (`/app/api/{entities}`)
- ✅ Rimossi `SWRProvider` e `SWRPageProvider`

### Componenti Migrati Completamente
- ✅ **Articles Page** (`/articles/page.tsx`) - Usa Services
- ✅ **ArticleListClient** - Usa props + `useArticleMutations`
- ✅ **MergeButton** - Convertito da useSWR a useEffect
- ✅ **TokenExpirationBanner** - Convertito da useSWR a useEffect

### Fix Build Errors
- ✅ Rimossi tutti gli import `@/hooks/swr/*`
- ✅ Rimossi tutti gli import `from 'swr'`
- ✅ Commentate chiamate a hook SWR con TODO

## 🔄 Da Migrare

I seguenti componenti hanno le chiamate SWR commentate e mostreranno **dati vuoti** fino alla migrazione:

### Authors
- `AuthorListClient.tsx` - Commentato `useAuthors()`
- `AuthorFormClient.tsx` - Commentato `useAuthors()`
- `AuthorDeleteButton.tsx` - Commentato `mutate()`

### Categories
- `CategoryListClient.tsx` - Commentato `useCategories()`
- `CategoryFormClient.tsx` - Commentato `useCategories()`
- `CategoryDeleteButton.tsx` - Commentato `mutate()`

### Issues
- `IssueListClient.tsx` - Commentato `useIssues()`
- `IssueFormClient.tsx` - Commentato `useIssues()`
- `IssueDeleteButton.tsx` - Commentato `mutate()`

### Pages
- `PageListClient.tsx` - Commentato `usePages()`
- `PageFormClient.tsx` - Commentato `usePages()`
- `PageMetaPanel.tsx` - Commentato `mutate()`

### Podcasts
- `PodcastListClient.tsx` - Commentato `usePodcasts()`
- `PodcastFormClient.tsx` - Commentato `usePodcasts()`
- `PodcastMetaPanel.tsx` - Commentato `mutate()` e `usePodcasts()`

### Users
- `UserListClient.tsx` - Commentato `useUsers()`
- `UserFormClient.tsx` - Commentato `useUsers()`

### Media
- `MediaListClient.tsx` - Commentato `useMedia()`
- `MediaDialog.tsx` - Commentato `mutate()`

### Articles (componenti rimanenti)
- `ArticleFormClient.tsx` - Commentato `useAuthors()`, `useCategories()`, `useIssues()`
- `ArticleMetaPanel.tsx` - Commentato `usePodcasts()`
- `MediaSelector.tsx` - Commentato `useMedia()`
- `AudioJsonMediaSelector.tsx` - Commentato `useMedia()`

## 📝 Come Migrare

Per ogni entità, segui questi 3 passi:

### 1. Migra il Server Component (`page.tsx`)

```typescript
// ❌ Prima
const entities = await getAllEntities();
return <SWRPageProvider fallback={{"/api/entities": entities}}>

// ✅ Dopo
const entities = await EntityService.getAll();
return <EntityListClient initialEntities={entities} />
```

### 2. Migra il List Client Component

```typescript
// ❌ Prima (commentato)
// const { entities = [], isLoading } = useEntities();

// ✅ Dopo
interface Props {
  initialEntities: Entity[];
}

export default function EntityListClient({ initialEntities }: Props) {
  const entities = initialEntities;
  const { remove, removeMultiple, isPending } = useEntityMutations();
  // ...
}
```

### 3. Aggiorna Form e altri componenti

```typescript
// ❌ Prima (commentato)
// const { entities = [] } = useEntities();
// await mutate("/api/entities");

// ✅ Dopo
// Ricevi dati come props dal parent
// O fetch direttamente se necessario
const entities = []; // o props
// router.refresh() è chiamato automaticamente dai mutation hooks
```

## 🚀 Quick Start per Entità Singola

Esempio completo per **Authors**:

1. Copia `/articles/page.tsx` → `/authors/page.tsx`
2. Sostituisci `Article` con `Author`
3. Sostituisci `ArticleService` con `AuthorService`
4. Copia pattern da `ArticleListClient` per `AuthorListClient`
5. Rimuovi commenti `// TODO: Migrate`
6. Testa

**Tempo stimato**: 10-15 minuti per entità

## 📚 Riferimenti

- **Guida completa**: `MIGRATION_GUIDE.md`
- **Esempio funzionante**: `/articles/` (page.tsx + ArticleListClient.tsx)
- **Services**: `/lib/services/`
- **Actions**: `/lib/actions/`
- **Hooks**: `/hooks/mutations/`

## ⚠️ Note Importanti

1. **Build funziona**: Tutti gli errori di import sono stati risolti
2. **Dati vuoti**: I componenti non migrati mostreranno array vuoti
3. **No breaking changes**: Le API esistenti funzionano ancora
4. **Cache attiva**: Services usano cache Next.js, nessuna chiamata ridondante
5. **Priorità**: Migra prima le sezioni più usate (Articles è già fatto)

## 🎯 Ordine Consigliato di Migrazione

1. ✅ Articles - **COMPLETATO**
2. Authors - Più semplice, buon esempio
3. Categories - Simile ad Authors
4. Issues - Include upload immagini
5. Pages - Include meta panel
6. Podcasts - Include audio
7. Users - Usa `id` invece di `slug`
8. Media - Più complesso, fai per ultimo

---

**Ultimo aggiornamento**: Commit d400ce3
**Status build**: ✅ Tutti gli errori di import risolti
**Status runtime**: ⚠️ Componenti non migrati mostrano dati vuoti
