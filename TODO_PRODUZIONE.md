# TODO messa in produzione (focus qualità + performance)

Checklist operativa limitata a ciò che puoi verificare direttamente in questo repository,
senza introdurre nuovi ambienti e senza attività di deploy/rollback.

## 1) Qualità codice applicativa

- [x] Verificare che i nuovi file TypeScript non usino `any` evitabile. (enforced con hook pre-commit)
- [x] Verificare uso corretto di `import type` dove serve. (enforced con hook pre-commit)
- [x] Verificare ordine e coerenza import (terze parti -> alias `@/` -> relativi). (enforced con hook pre-commit)
- [x] Verificare che i moduli non mescolino responsabilità non correlate. (nessuna criticità alta riscontrata)
- [x] Verificare che le route API restituiscano `NextResponse.json(...)` con status espliciti. (uniformato con status espliciti)
- [x] Verificare che gli errori siano gestiti con `try/catch` e messaggi safe. (uniformato su route API)

## 2) Performance build/runtime (solo verifiche locali)

- [x] Verificare presenza di caching coerente su API (`CACHE_PROFILES`, header cache). (GET con profili cache, mutation/auth con `no-store`)
- [x] Verificare che i componenti siano Server Components di default quando possibile. (solo `app/error.tsx` e `app/global-error.tsx` client)
- [x] Verificare uso mirato di `"use client"` solo dove necessaria interattività. (audit completato su componenti client)
- [x] Verificare che `next/image` e `remotePatterns` siano coerenti con le sorgenti reali. (hostname Blob parametrizzato e allineato)
- [x] Verificare che `next.config.ts` mantenga `compress: true` e ottimizzazioni attive. (confermato)

## 3) Integrazioni e contenuti

- [x] Verificare che i moduli `lib/github/*` gestiscano errori e timeout in modo safe. (timeout centralizzato + errori safe in client GitHub)
- [x] Verificare che i fallback lato API/UI siano presenti quando GitHub o Blob falliscono. (mantenuto approccio hard-fail con error boundary + fallback API safe)
- [x] Verificare coerenza dei tipi condivisi (`lib/github/types`) tra fetcher, hook e route. (allineati DTO client per User/Media)

## 4) Criteri di uscita (go/no-go tecnico)

- [x] Nessun rischio alto aperto su sicurezza, performance o gestione errori. (GO tecnico confermato su verifiche locali)
- [x] Eventuali debiti tecnici residui sono tracciati con task chiari e priorità.

Debiti residui (non bloccanti):

- [ ] [P2] Uniformare timeout anche nelle route `app/api/github/*` con `fetch` diretto (`merge`, `merge/check`, `token-expiration`, `image`).
- [ ] [P2] Ridurre il logging di payload errore raw da GitHub in `lib/github/client.ts` mantenendo status/code.
- [ ] [P3] Ridurre complessità dei componenti admin più estesi (`MediaSelector`, `MediaListClient`, `UserListClient`).
- [ ] [P3] Centralizzare i DTO API client/server in un modulo dedicato (`lib/api/types`) per prevenire drift.
