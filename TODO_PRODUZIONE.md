# TODO messa in produzione (focus qualità + performance)

Checklist operativa limitata a ciò che puoi verificare direttamente in questo repository,
senza introdurre nuovi ambienti e senza attività di deploy/rollback.

## 0) Preparazione codice

- [ ] Verificare che il branch sia aggiornato con il branch base (`main`/`master`).
- [ ] Verificare working tree pulito e assenza di file temporanei/versionati per errore.
- [ ] Definire il commit/tag candidato al rilascio.
- [ ] Preparare un changelog tecnico breve orientato a fix, performance e rischi noti.

## 1) Gate di qualità obbligatori

- [ ] Installazione dipendenze coerente con lockfile: `npm install`.
- [ ] Generazione Prisma client: `npm run postinstall`.
- [x] Lint completo repository: `npm run lint`.
- [x] Type check completo: `npm run typecheck`.
- [x] Verifica formatting: `npm run format`.
- [x] Build produzione locale: `npm run build`.
- [x] Avvio runtime locale su build: `npm run start`.

## 2) Qualità codice applicativa

- [ ] Verificare che i nuovi file TypeScript non usino `any` evitabile.
- [ ] Verificare uso corretto di `import type` dove serve.
- [ ] Verificare ordine e coerenza import (terze parti -> alias `@/` -> relativi).
- [ ] Verificare che i moduli non mescolino responsabilità non correlate.
- [ ] Verificare che le route API restituiscano `NextResponse.json(...)` con status espliciti.
- [ ] Verificare che gli errori siano gestiti con `try/catch` e messaggi safe.
- [ ] Verificare che non ci siano log rumorosi o contenenti dati sensibili.

## 3) Performance build/runtime (solo verifiche locali)

- [ ] Analizzare output di `npm run build` e annotare pagine/routes più pesanti.
- [ ] Controllare warning su bundle size o chunking e aprire task se fuori soglia.
- [ ] Verificare presenza di caching coerente su API (`CACHE_PROFILES`, header cache).
- [ ] Verificare che i componenti siano Server Components di default quando possibile.
- [ ] Verificare uso mirato di `"use client"` solo dove necessaria interattività.
- [ ] Verificare che `next/image` e `remotePatterns` siano coerenti con le sorgenti reali.
- [ ] Verificare che `next.config.ts` mantenga `compress: true` e ottimizzazioni attive.

### 3.1) Analisi eseguita: coerenza caching API

- [x] Mappati endpoint GET sotto `app/api/**/route.ts` e confronto con uso cache helpers.
- [x] Verificato helper centralizzato in `lib/api/cache.ts` (`list`/`detail`, `private`, `Vary`).
- [x] Verificato che gli endpoint contenuto principali usano cache coerente:
  - `app/api/articles/route.ts`, `app/api/articles/[slug]/route.ts`
  - `app/api/authors/route.ts`, `app/api/authors/[slug]/route.ts`
  - `app/api/categories/route.ts`, `app/api/categories/[slug]/route.ts`
  - `app/api/issues/route.ts`, `app/api/issues/[slug]/route.ts`
  - `app/api/media/route.ts`
  - `app/api/pages/route.ts`, `app/api/pages/[slug]/route.ts`
  - `app/api/podcasts/route.ts`, `app/api/podcasts/[slug]/route.ts`
- [x] Verificato endpoint con caching dedicato (non helper):
  - `app/api/github/image/route.ts` usa `Cache-Control: public, max-age=86400, stale-while-revalidate=604800`.

### 3.2) Gap individuati e task di miglioramento

- [x] Valutare e standardizzare cache su endpoint admin utenti:
  - `app/api/users/route.ts`
  - `app/api/users/[id]/route.ts`
  - proposta: cache privata breve (es. profilo `list`/`detail`) o `no-store` esplicito.
- [x] Rendere esplicita policy `Cache-Control: no-store` sugli endpoint operativi GitHub:
  - `app/api/github/token-expiration/route.ts`
  - `app/api/github/merge/check/route.ts`
  - motivazione: evitare caching intermedio di dati operativi sensibili/volatili.
- [x] Uniformare decisione su header diagnostici (`X-Data-Source`, `X-Timestamp`) in produzione:
  - mantenerli solo se utili al debug operativo,
  - altrimenti rimuoverli o condizionarli a `NODE_ENV !== "production"`.
- [x] Allineare la checklist con risultato finale dell'analisi cache (apri task tecnici prima del rilascio se restano gap).

## 4) Sicurezza e robustezza del codice

- [ ] Verificare che nessun secret/token sia hardcoded nel codice.
- [ ] Verificare che `.env*` sia ignorato correttamente e non incluso nei commit.
- [ ] Validare header sicurezza definiti in `next.config.ts` (CSP, HSTS, ecc.).
- [ ] Verificare autorizzazioni server-side su endpoint admin/protetti.
- [ ] Verificare che upload/media gestiscano limiti e tipi file ammessi.

## 5) Database e consistenza Prisma

- [ ] Verificare allineamento tra codice e `prisma/schema.prisma`.
- [ ] Verificare utilizzo singleton Prisma in `lib/prisma.ts` (no istanze multiple).
- [ ] Se ci sono modifiche schema, validare migrazione con `npm run db:migrate` in locale.
- [ ] Se previsto dal flusso interno, validare anche `npm run db:push` in locale.
- [ ] Verificare eventuali impatti del task `npm run roles:migrate`.

## 6) Integrazioni e contenuti

- [ ] Verificare che la pipeline `velite` giri durante dev/build senza errori.
- [ ] Verificare che i moduli `lib/github/*` gestiscano errori e timeout in modo safe.
- [ ] Verificare che i fallback lato API/UI siano presenti quando GitHub o Blob falliscono.
- [ ] Verificare coerenza dei tipi condivisi (`lib/github/types`) tra fetcher, hook e route.

## 7) Criteri di uscita (go/no-go tecnico)

- [ ] Tutti i gate (`lint`, `typecheck`, `format`, `build`) sono verdi.
- [ ] Nessun warning critico non giustificato nell'output build.
- [ ] Nessun rischio alto aperto su sicurezza, performance o gestione errori.
- [ ] Eventuali debiti tecnici residui sono tracciati con task chiari e priorità.
