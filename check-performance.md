# Checklist Performance e Caching Next.js pre go-live

> **Legenda**
> - ✅ Implementato nella codebase
> - 🔴 Bug/lacuna da correggere nel codice (fix proposto)
> - 💬 Richiede configurazione esterna o decisione di team
> - ⬜ Da verificare a runtime / non verificabile staticamente

> **Nota PageSpeed**: I link di analisi PageSpeed Insights condivisi richiedono un browser con JavaScript per essere visualizzati e non sono accessibili in modo automatizzato. Consultarli manualmente. Le aree di intervento più probabili in base alla codebase sono indicate nei punti 7 e 9.

---

## 1. Misurazione e baseline

- ⬜ Misura sia field data sia lab data
  > Field data (CrUX) richiede traffico reale su middleware.media. Lab data disponibili tramite PageSpeed Insights / Lighthouse CLI dopo il go-live.
- ⬜ Traccia almeno LCP, INP e CLS su homepage, listing blog, articolo e ricerca interna
  > Vercel Speed Insights raccoglie automaticamente CWV in produzione. Il `WebVitals` component (Fix 3) permette il debug route-by-route in dev.
- 💬 Definisci target minimi per Core Web Vitals
  > Decisione di team. Riferimento Google: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1. Una volta definiti, possono essere usati come soglie nel componente `WebVitals`.
- 🔴 Collega il reporting con `useReportWebVitals`
  > Non implementato. **Fix**: creare `components/WebVitals.tsx` con `useReportWebVitals` e montarlo in `app/[locale]/layout.tsx`. Pronto per estensione a endpoint custom.
- 🔴 Abilita `webVitalsAttribution` per capire quali elementi degradano le metriche
  > Non implementato. Da includere nel `WebVitals` component con il campo `metric.attribution` per identificare l'elemento LCP degradato.

---

## 2. Strategia di rendering per ogni route

- ✅ Per ogni route decidi se deve essere statica, parzialmente prerenderizzata o dinamica
  > Articoli, podcast, issues e pagine statiche usano `generateStaticParams` (statico). Admin usa componenti dinamici con SWR. Il locale layout è Server Component.
- ✅ Homepage, categorie, tag e articoli standard sono statici o cacheabili quando possibile
  > Tutti i contenuti pubblici usano Velite (import statico a build time) — nessuna query DB a runtime sulle route pubbliche.
- ✅ Le route che leggono dati request-specific restano dinamiche
  > Admin e API routes sono dinamiche. Prisma usato solo per auth/utenti.
- ✅ I contenuti non cacheati dentro route prerenderizzabili sono isolati con `Suspense`
  > `<Suspense>` con skeleton usato sistematicamente in tutte le sezioni admin dinamiche.

---

## 3. Policy dei fetch e Data Cache

- ✅ Per ogni `fetch` server-side è definita esplicitamente la policy di cache
  > GitHub API client usa `cache: "no-store"` su tutte le chiamate (`lib/github/client.ts`). API admin usano `CACHE_PROFILES` (`lib/api/cache.ts`) con `private, max-age=30/60`.
- ✅ Non lasci il comportamento dei fetch al default senza verificarlo
  > Ogni `fetch` ha la policy esplicita (`no-store` per GitHub API, profili privati per admin API).
- ✅ I dati editoriali quasi statici usano cache o revalidate
  > I contenuti editoriali vengono da Velite (build-time static) — non hanno fetch runtime. Aggiornati tramite deploy.
- ✅ I dati user-specific o sensibili non finiscono in cache condivisa
  > Le API admin usano `Cache-Control: private` con `Vary: Authorization, Cookie`.
- 🔴 I valori di `revalidate` nelle route sono incoerenti
  > Solo `articles/[slug]/page.tsx` ha `export const revalidate = 3600`. Podcast e issues slug mancano del valore. **Fix**: aggiungere `export const revalidate = 3600` a `podcast/[slug]/page.tsx` e `issues/[slug]/page.tsx`.
- ⬜ `fetchCache` è usato solo se serve davvero forzare il comportamento del segmento
  > Non usato nel progetto — non necessario con la policy attuale.

---

## 4. Cache Components e `use cache`

- 💬 Se usi Cache Components, `cacheComponents` è abilitato in `next.config`
  > Feature sperimentale di Next.js 15 (dynamicIO), non ancora stabile per produzione. Non abilitata. Da rivalutare nella prossima major.
- 💬 `use cache` è usato per query DB, funzioni costose e sottosezioni riutilizzabili
  > Non applicabile con l'architettura attuale (dati Velite statici). Da considerare se si introduce un CMS con lettura runtime.
- 💬 Se vuoi cacheare un'intera route, applichi `use cache` in `layout` e `page`
  > Vedi sopra.
- 💬 `cookies()` e `headers()` sono letti fuori dallo scope cacheato e passati come argomenti
  > Corretto pattern da seguire se si abilita `use cache` in futuro. Attualmente non rilevante.
- 💬 Non stai ancora basando la strategia nuova su `unstable_cache`
  > Corretto: `unstable_cache` non è usato nel progetto.
- ✅ Verifichi la compatibilità se usi static export
  > Non si usa static export (`output: "export"`): il progetto usa ISR e Server Components, compatibile con Vercel.

---

## 5. TTL, lifetime e invalidazione

- 💬 Hai una regola chiara per i TTL di homepage, categorie, articoli e componenti aggregati
  > Con Velite (contenuti statici a build time), il TTL effettivo è il ciclo di deploy. `revalidate = 3600` sugli articoli è una rete di sicurezza ISR, ma il contenuto si aggiorna realmente solo con un nuovo build.
- 💬 Usi tag cache coerenti (`posts`, `post:{slug}`, `category:{slug}`, `homepage`)
  > `revalidateTag` non è usato: l'architettura attuale invalida via `revalidatePath` su deploy/azione admin. Tags coerenti diventano utili se si introduce un CMS con webhook.
- ✅ Dopo publish, unpublish, edit o cambio slug invalidi con `revalidateAdminPath`
  > `revalidateAdminPath()` è chiamato in tutte le server actions admin (articoli, podcast, issues, autori, categorie, pagine) — `lib/cache/revalidate.ts`.
- 💬 Dopo una modifica editoriale si aggiornano homepage, listing, articolo e sitemap/feed
  > Con l'architettura file-based (contenuto scritto su GitHub → webhook → nuovo deploy), l'aggiornamento avviene a deploy-time. `revalidatePath` pulisce la cache admin ma non anticipa il contenuto Velite (che è un import statico). Da documentare nel team.
- ✅ Non restano contenuti stale dopo modifiche o deploy ravvicinati
  > Vercel invalida automaticamente la cache ISR al deploy. I contenuti Velite sono ricompilati ad ogni build.

---

## 6. HTML cache e CDN

- ⬜ Sai quali route escono con cache pubblica e quali con cache privata
  > Route pubbliche: statiche (cache pubblica Vercel CDN). API admin: `Cache-Control: private`. Da verificare gli header effettivi con DevTools dopo il go-live.
- 💬 Il CDN o reverse proxy rispetta gli header `Cache-Control` emessi da Next.js
  > Vercel CDN rispetta nativamente gli header Next.js. Da confermare sul dominio finale.
- ⬜ Testi warm cache vs cold cache sulle pagine più trafficate
  > Da misurare in produzione con strumenti come `curl -I` prima e dopo il warmup.
- 💬 Se servi asset da dominio/CDN separato, verifichi se ti serve `assetPrefix`
  > Non necessario: Vercel gestisce il CDN degli asset Next.js automaticamente.

---

## 7. Immagini e media

- ✅ Usi `next/image` per le immagini editoriali quando possibile
  > `<Image>` usato in tutti i componenti con immagini editoriali (cover, podcast header, issue cover, card archivio).
- ✅ Ogni immagine ha `width`/`height` o `fill` per evitare layout shift
  > Tutte le `<Image>` hanno `width`/`height` o `fill` — nessun CLS da immagini.
- 🔴 `remotePatterns` include `localhost` e `via.placeholder.com` anche in produzione
  > **Fix**: condizionare `localhost` a `NODE_ENV !== "production"`, rimuovere `via.placeholder.com` da `next.config.ts`.
- ✅ L'immagine LCP di homepage o articolo è trattata come risorsa prioritaria
  > `priority` prop su: cover numero (`cover/index.tsx:48`), pictogram logo (`pictogram/index.tsx:29`), primo card archivio (`ArchiveIssueCard.tsx:102` con `priority={index === 0}`), podcast header, issue cover.
- ✅ I formati immagine sono scelti in modo coerente tra qualità, peso e costi cache
  > `formats: ["image/avif", "image/webp"]` in `next.config.ts`. Immagini servite nel formato più efficiente supportato dal browser.
- 🔴 `minimumCacheTTL` per le immagini ottimizzate è troppo basso (1h)
  > `minimumCacheTTL: 3600` in `next.config.ts`. Le cover dei numeri cambiano raramente. **Fix**: aumentare a `86400` (1 giorno).
- ⬜ Se hai un proxy/CDN davanti all'image optimizer, inoltri correttamente l'header `Accept`
  > Da verificare con il CDN effettivo dopo il go-live.

---

## 8. JavaScript e bundle client

- ✅ Riduci al minimo i boundary `use client`
  > Root layout e locale layout sono Server Components. `use client` usato solo dove strettamente necessario (form, interazioni, analytics).
- ✅ Widget pesanti sono lazy-loaded con `next/dynamic`
  > `dynamic()` con `ssr: false` per: Vercel Analytics, SpeedInsights, MarkdownEditor (admin), BookmarkManager.
- ✅ Librerie usate solo dopo interazione non finiscono nel bundle iniziale
  > Editor Markdown (Tiptap) e Bookmark manager sono lazy-loaded.
- ✅ Il layout globale non importa componenti client-only inutili su tutte le pagine
  > Root layout (`app/layout.tsx`): solo `Toaster` (toast notifications, minimo). Locale layout (`app/[locale]/layout.tsx`): `Analytics` (lazy), `PolicyBanner`, `StructuredData`.

---

## 9. Terze parti, analytics e monitoraggio

- ✅ Tracci le performance reali dal client
  > Vercel Speed Insights (`@vercel/speed-insights`) installato e lazy-loaded.
- 💬 Se serve inizializzazione precoce di analytics o monitoring, usi `instrumentation-client`
  > Non necessario al momento: nessun APM (Sentry, Datadog, etc.) configurato. Da aggiungere se si introduce monitoring backend.
- ✅ Ogni script terzo è rivisto e giustificato
  > Unico script terzo: Vercel Analytics. Nessun GTM, chat widget, A/B test o ad network.
- ✅ Chat, widget social, A/B test, tag manager o ads non degradano bundle e INP
  > Nessuno di questi è installato. Il bundle client è contenuto.

---

## 10. Static assets

- ✅ I file in `public` esistono al build time
  > Tutti i file in `public/` sono SVG e PNG per icone/manifest — presenti a build time.
- ✅ Gli asset immutabili con hash nel filename usano cache lunga
  > `/_next/static/*` ha `Cache-Control: public, max-age=31536000, immutable` (1 anno) in `next.config.ts`.
- ✅ Gli asset non hashati (font, favicon) hanno header cache espliciti e coerenti
  > `/fonts/*` ha `Cache-Control: public, max-age=31536000, immutable` in `next.config.ts`.

---

## 11. API routes, Route Handlers e SSR

- ✅ I Route Handlers che restituiscono dati cacheabili hanno una strategia di cache chiara
  > RSS: `public, max-age=3600, s-maxage=3600`. GitHub image proxy: `public, max-age=86400, stale-while-revalidate=604800`. API admin: `private, max-age=30/60`.
- 🔴 La route OG image non ha `Cache-Control`
  > `app/api/og/route.tsx` (edge) non imposta header di cache. Le immagini OG vengono rigenerate ad ogni richiesta. **Fix**: aggiungere `Cache-Control: public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800` alla risposta `ImageResponse`.
- ✅ Non esistono endpoint identici per tutti che restano senza cache inutilmente
  > Le API admin hanno profili cache privati coerenti tramite `CACHE_PROFILES` in `lib/api/cache.ts`.
- ✅ Le route SSR non fanno lavoro costoso ad ogni richiesta senza motivo
  > I contenuti pubblici sono statici (Velite). Le route admin sono dinamiche by design.

---

## 12. Database e query lato server

- ✅ Le query più frequenti sono identificate e misurate
  > Prisma usato solo per auth (User, Session). Le query di autenticazione (`findUnique`) sono puntuali e indicizzate per ID/email.
- ✅ Non ci sono query duplicate o pattern N+1
  > I contenuti pubblici usano Velite (zero DB queries). Le query admin sono controllate.
- ✅ Le query di homepage, listing e articolo sono cacheate o ottimizzate
  > Non ci sono query DB per homepage/listing/articolo: tutto da Velite (import statico).
- ✅ Gli indici principali del database coprono i filtri usati davvero
  > Schema Prisma: `User` indicizzato per `email` e `id`. Solo operazioni di auth.
- ✅ Le query lato admin non rallentano il frontend pubblico
  > Totale separazione: admin legge da GitHub API (`no-store`), frontend da Velite.

---

## 13. Checklist route-by-route

### Homepage

- ✅ HTML cacheabile
  > Contenuto da Velite (statico a build time). Cache Vercel CDN.
- ✅ Hero/LCP image prioritaria
  > Cover del primo numero con `priority` in `archive/components/ArchiveIssueCard.tsx:102`.
- ✅ Feed articoli recenti con revalidate o tag invalidation
  > Aggiornato a ogni nuovo deploy (architettura Velite + GitHub).
- ✅ Nessun widget pesante nel bundle iniziale
  > Analytics lazy-loaded, nessun widget terzo.

### Listing blog / categorie / tag

- ✅ Query cacheate
  > Dati Velite: zero query runtime.
- ⬜ Paginazione stabile
  > La paginazione è client-side (tutti i contenuti caricati server-side, filtrati client-side). Con volumi attuali è accettabile. Da rivalutare se gli articoli superano ~200 unità.
- ✅ Invalidazione corretta dopo publish/unpublish
  > Tramite deploy-triggered da GitHub webhook.
- ✅ Nessun `no-store` superfluo
  > Le route listing non fanno fetch — usano import Velite.

### Singolo articolo

- ✅ Contenuto statico o cacheato
  > `generateStaticParams` + `revalidate = 3600`.
- ✅ Immagini ottimizzate
  > `next/image` con formati AVIF/WebP.
- ✅ Related posts, author box non rallentano la route
  > Tutti i dati correlati (autore, categoria, numero) vengono da Velite (import sincrono).
- ✅ Aggiornamento immediato dopo edit importante
  > `revalidateAdminPath` invalida cache admin + nuovo deploy aggiorna contenuto.

### Ricerca interna / preview / admin

- ✅ Route dinamiche dove serve
  > Admin usa SWR client-side + Suspense streaming.
- ✅ Nessuna cache pubblica
  > API admin usano `Cache-Control: private`.
- ✅ Script e librerie caricati solo quando servono
  > MarkdownEditor lazy-loaded con `dynamic()`.

### Dopo una modifica CMS

- ✅ Publish di un post aggiorna homepage, articolo, categoria e sitemap/feed
  > Tramite deploy pipeline (GitHub push → Vercel build → Velite recompile).
- 💬 Cambio slug invalida vecchia e nuova destinazione
  > Richiede un redirect manuale (dalla vecchia URL alla nuova) in `next.config.ts` o via Vercel Redirects. Da gestire editorialmente.
- ✅ Unpublish rimuove contenuti stale dalle pagine aggregate
  > Filtro `published` in Velite + deploy invalida ISR.

---

## 14. Controlli finali pre go-live

- ⬜ Le pagine principali restano veloci anche senza cache calda
  > Da misurare con Lighthouse CLI su URL di staging.
- ⬜ Le pagine principali migliorano sensibilmente con cache calda
  > Da misurare confrontando prima e dopo il warmup.
- ✅ I contenuti editoriali si aggiornano nei tempi attesi
  > Aggiornamento tramite deploy (minuti). ISR `revalidate = 3600` come rete di sicurezza.
- ✅ Nessun contenuto personalizzato finisce in cache condivisa
  > API admin: `Cache-Control: private` + `Vary: Authorization, Cookie`.
- ✅ Nessuna route critica dipende da query o componenti inutilmente dinamici
  > Tutti i contenuti pubblici sono statici (Velite).
- ⬜ LCP, INP e CLS sono monitorati in produzione
  > Vercel Speed Insights attivo. Il `WebVitals` component (Fix 3) aggiunge visibilità granulare.
- 💬 Hai alert o osservabilità minima per errori, timeout e degrado performance
  > Vercel offre alerting base. Per soglie CWV avanzate valutare Sentry Performance o Datadog RUM.
