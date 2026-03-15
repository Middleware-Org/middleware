# Checklist Performance e Caching Next.js pre go-live

## 1. Misurazione e baseline

- [ ] Misura sia field data sia lab data
- [ ] Traccia almeno LCP, INP e CLS su homepage, listing blog, articolo e ricerca interna
- [ ] Definisci target minimi per Core Web Vitals
- [ ] Collega il reporting con `useReportWebVitals` o con il monitoraggio della piattaforma
- [ ] Abilita `webVitalsAttribution` per capire quali elementi degradano le metriche

## 2. Strategia di rendering per ogni route

- [ ] Per ogni route decidi se deve essere statica, parzialmente prerenderizzata o dinamica
- [ ] Homepage, categorie, tag e articoli standard sono statici o cacheabili quando possibile
- [ ] Le route che leggono dati request-specific restano dinamiche
- [ ] I contenuti non cacheati dentro route prerenderizzabili sono isolati con `Suspense` o `use cache`

## 3. Policy dei fetch e Data Cache

- [ ] Per ogni `fetch` server-side decidi esplicitamente tra `force-cache`, `no-store` o `revalidate`
- [ ] Non lasci il comportamento dei fetch al default senza verificarlo
- [ ] I dati editoriali quasi statici usano cache o revalidate
- [ ] I dati user-specific o sensibili non finiscono in cache condivisa
- [ ] I valori di `revalidate` nei layout e nelle route sono coerenti
- [ ] `fetchCache` è usato solo se serve davvero forzare il comportamento del segmento

## 4. Cache Components e `use cache`

- [ ] Se usi Cache Components, `cacheComponents` è abilitato in `next.config`
- [ ] `use cache` è usato per query DB, funzioni costose e sottosezioni riutilizzabili
- [ ] Se vuoi cacheare un'intera route, applichi `use cache` in `layout` e `page`
- [ ] `cookies()` e `headers()` sono letti fuori dallo scope cacheato e passati come argomenti
- [ ] Non stai ancora basando la strategia nuova su `unstable_cache`
- [ ] Verifichi la compatibilità se usi static export

## 5. TTL, lifetime e invalidazione

- [ ] Hai una regola chiara per i TTL di homepage, categorie, articoli e componenti aggregati
- [ ] Usi tag cache coerenti (`posts`, `post:{slug}`, `category:{slug}`, `homepage`)
- [ ] Dopo publish, unpublish, edit o cambio slug invalidi con `revalidateTag`, `updateTag` o `revalidatePath`
- [ ] Dopo una modifica editoriale si aggiornano homepage, listing, articolo e sitemap/feed
- [ ] Non restano contenuti stale dopo modifiche o deploy ravvicinati

## 6. HTML cache e CDN

- [ ] Sai quali route escono con cache pubblica e quali con cache privata
- [ ] Il CDN o reverse proxy rispetta gli header `Cache-Control` emessi da Next.js
- [ ] Testi warm cache vs cold cache sulle pagine più trafficate
- [ ] Se servi asset da dominio/CDN separato, verifichi se ti serve `assetPrefix`

## 7. Immagini e media

- [ ] Usi `next/image` per le immagini editoriali quando possibile
- [ ] Ogni immagine ha `width`/`height` o `fill` per evitare layout shift
- [ ] `remotePatterns` è configurato in modo specifico
- [ ] L'immagine LCP di homepage o articolo è trattata come risorsa prioritaria
- [ ] I formati immagine sono scelti in modo coerente tra qualità, peso e costi cache
- [ ] Se hai un proxy/CDN davanti all'image optimizer, inoltri correttamente l'header `Accept`

## 8. JavaScript e bundle client

- [ ] Riduci al minimo i boundary `use client`
- [ ] Widget pesanti sono lazy-loaded con `next/dynamic` o `React.lazy()`
- [ ] Librerie usate solo dopo interazione non finiscono nel bundle iniziale
- [ ] Il layout globale non importa componenti client-only inutili su tutte le pagine

## 9. Terze parti, analytics e monitoraggio

- [ ] Tracci le performance reali dal client
- [ ] Se serve inizializzazione precoce di analytics o monitoring, usi `instrumentation-client`
- [ ] Ogni script terzo è rivisto e giustificato
- [ ] Chat, widget social, A/B test, tag manager o ads non degradano bundle e INP

## 10. Static assets

- [ ] I file in `public` esistono al build time
- [ ] Gli asset immutabili con hash nel filename usano cache lunga
- [ ] Gli asset non hashati o le risposte custom hanno header cache espliciti e coerenti

## 11. API routes, Route Handlers e SSR

- [ ] I Route Handlers che restituiscono dati cacheabili hanno una strategia di cache chiara
- [ ] Le API Routes o il Pages Router usano header `Cache-Control` coerenti dove opportuno
- [ ] Non esistono endpoint identici per tutti che restano senza cache inutilmente
- [ ] Le route SSR non fanno lavoro costoso ad ogni richiesta senza motivo

## 12. Database e query lato server

- [ ] Le query più frequenti sono identificate e misurate
- [ ] Non ci sono query duplicate o pattern N+1
- [ ] Le query di homepage, listing e articolo sono cacheate o ottimizzate
- [ ] Gli indici principali del database coprono i filtri usati davvero
- [ ] Le query lato admin non rallentano il frontend pubblico

## 13. Checklist route-by-route

### Homepage

- [ ] HTML cacheabile
- [ ] Hero/LCP image prioritaria
- [ ] Feed articoli recenti con revalidate o tag invalidation
- [ ] Nessun widget pesante nel bundle iniziale

### Listing blog / categorie / tag

- [ ] Query cacheate
- [ ] Paginazione stabile
- [ ] Invalidazione corretta dopo publish/unpublish
- [ ] Nessun `no-store` superfluo

### Singolo articolo

- [ ] Contenuto statico o cacheato
- [ ] Immagini ottimizzate
- [ ] Related posts, author box e popular posts non rallentano la route
- [ ] Aggiornamento immediato dopo edit importante

### Ricerca interna / preview / admin

- [ ] Route dinamiche dove serve
- [ ] Nessuna cache pubblica
- [ ] Script e librerie caricati solo quando servono

### Dopo una modifica CMS

- [ ] Publish di un post aggiorna homepage, articolo, categoria e sitemap/feed
- [ ] Cambio slug invalida vecchia e nuova destinazione
- [ ] Unpublish rimuove contenuti stale dalle pagine aggregate

## 14. Controlli finali pre go-live

- [ ] Le pagine principali restano veloci anche senza cache calda
- [ ] Le pagine principali migliorano sensibilmente con cache calda
- [ ] I contenuti editoriali si aggiornano nei tempi attesi
- [ ] Nessun contenuto personalizzato finisce in cache condivisa
- [ ] Nessuna route critica dipende da query o componenti inutilmente dinamici
- [ ] LCP, INP e CLS sono monitorati in produzione
- [ ] Hai alert o osservabilità minima per errori, timeout e degrado performance
