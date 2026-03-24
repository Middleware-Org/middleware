# TODO messa in produzione (focus qualità + performance)

Checklist operativa limitata a ciò che puoi verificare direttamente in questo repository,
senza introdurre nuovi ambienti e senza attività di deploy/rollback.

## Frontend Admin - Anti-pattern (audit 2026-03-20)


### P1 (priorità media)

- [x] [P1] Rimuovere `querySelector` dai form client admin e passare a stato typed + hidden inputs controllati/serializer `FormData` esplicito.
  - File chiave: `PageFormClient`, `PodcastFormClient`, `IssueFormClient`, `PageMetaPanel`, `PodcastMetaPanel`, `ArticleMetaPanel`.
- [x] [P1] Uniformare tutte le conferme delete su `ConfirmDialog` (eliminare `window.confirm`).
  - File noti: `AuthorDeleteButton`, `CategoryDeleteButton`, `IssueDeleteButton`.
- [x] [P1] Correggere inconsistenze copy IT/EN/plurali in admin (`No image`, `podcasts`, copy dashboard/error).
- [x] [P1] Hardening sicurezza generazione password in admin users: sostituire `Math.random()` con `crypto.getRandomValues`.

Stato avanzamento P1 (aggiornato):

- [x] Conferme delete migrate a `ConfirmDialog` in area admin (`AuthorDeleteButton`, `CategoryDeleteButton`, `IssueDeleteButton`).
- [x] Generazione password sicura migrata a API crittografica browser (`crypto.getRandomValues`) con shuffle Fisher-Yates.
- [x] Eliminato uso di `querySelector` in area admin protected (form/panel principali + form author/category).
- [x] Inconsistenze copy IT/EN/plurali sistemate nei componenti admin principali.

### P2 (priorità bassa/media)

- [x] [P2] Ridurre duplicazione dei `*ListClient` CRUD con estrazione base condivisa (hook/componente headless per search/sort/selection/pagination/bulk actions).
  - Estratti `CrudListShell<T>` (componente generico tabella+paginazione+dialogs) e `useCrudList<T>` (hook generico state CRUD) in `(protected)/shared/`. Applicati a `AuthorListClient`, `CategoryListClient`, `UserListClient`, `IssueListClient`, `PodcastListClient`, `PageListClient`, `ArticleListClient`.
- [x] [P2] Ridurre duplicazione degli style object admin (`authors/categories/users/issues`) e consolidare stili sidebar in un unico modulo.
- [x] [P2] Estrarre error boundary admin riusabile per ridurre copy/paste tra `*/error.tsx`.

Stato avanzamento P2 (aggiornato):

- [x] Error boundary admin consolidata in componente riusabile (`(protected)/components/AdminErrorView.tsx`) e applicata a `articles/authors/categories/issues/media/podcasts/users`.
- [x] Stili CRUD entity consolidati in modulo condiviso (`(protected)/shared/entityCrudStyles.ts`) con override minimi locali; sidebar allineata a un solo modulo stile (`(protected)/components/Sidebar/styles.ts`).
- [x] Riduzione duplicazione `*ListClient` CRUD completata (`CrudListShell` + `useCrudList`).

## Debiti residui (non bloccanti)

- [x] [P2] Uniformare timeout anche nelle route `app/api/github/*` con `fetch` diretto (`merge`, `merge/check`, `token-expiration`, `image`).
- [x] [P2] Ridurre il logging di payload errore raw da GitHub in `lib/github/client.ts` mantenendo status/code.
- [ ] [P3] Ridurre complessità dei componenti admin più estesi (`MediaSelector`, `MediaListClient`, `UserListClient`).
- [ ] [P3] Centralizzare i DTO API client/server in un modulo dedicato (`lib/api/types`) per prevenire drift.
