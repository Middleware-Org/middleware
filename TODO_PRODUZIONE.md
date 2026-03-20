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

- [ ] Verificare presenza di caching coerente su API (`CACHE_PROFILES`, header cache).
- [ ] Verificare che i componenti siano Server Components di default quando possibile.
- [ ] Verificare uso mirato di `"use client"` solo dove necessaria interattività.
- [ ] Verificare che `next/image` e `remotePatterns` siano coerenti con le sorgenti reali.
- [ ] Verificare che `next.config.ts` mantenga `compress: true` e ottimizzazioni attive.

## 3) Integrazioni e contenuti

- [ ] Verificare che i moduli `lib/github/*` gestiscano errori e timeout in modo safe.
- [ ] Verificare che i fallback lato API/UI siano presenti quando GitHub o Blob falliscono.
- [ ] Verificare coerenza dei tipi condivisi (`lib/github/types`) tra fetcher, hook e route.

## 4) Criteri di uscita (go/no-go tecnico)

- [ ] Nessun rischio alto aperto su sicurezza, performance o gestione errori.
- [ ] Eventuali debiti tecnici residui sono tracciati con task chiari e priorità.
