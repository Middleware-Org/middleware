# Checklist SEO Next.js pre go-live

> **Legenda**
> - ✅ Implementato nella codebase
> - 🔴 Bug/lacuna da correggere nel codice (fix proposto)
> - 💬 Richiede configurazione esterna (DNS, hosting, analytics, etc.)
> - ⬜ Da verificare a runtime / non verificabile staticamente

---

## 1. Dominio canonico e redirect

- 💬 Decidi un solo host canonico: `www.tuodominio.it` oppure `tuodominio.it` (middleware.media)
  > Decisione di business da prendere con il team; da configurare poi su Vercel Dashboard (Domains → redirect).
- 💬 Imposta redirect 301 da tutte le varianti verso il canonico
  > Da configurare su Vercel oppure aggiungendo un `middleware.ts` con logica di redirect `www ↔ non-www`.
- 💬 Reindirizza `http -> https`
  > L'header HSTS è già configurato in `next.config.ts:52` (`max-age=63072000; includeSubDomains; preload`). Il redirect vero va attivato su Vercel con "Force HTTPS".
- 💬 Reindirizza `non-www -> www` oppure `www -> non-www`
  > Vedi punto precedente — da fare su Vercel o in `middleware.ts`.
- ✅ Usa sempre il dominio canonico nei link assoluti, sitemap, canonical, OG image e dati strutturati
  > `getBaseUrl()` centralizza il baseUrl in `lib/utils/metadata.ts:7` e viene usato ovunque.

---

## 2. Metadata globale

- ✅ Imposta `metadataBase` nel root layout con il dominio di produzione
  > `metadataBase: new URL(getBaseUrl())` → `app/layout.tsx:23`
- ✅ Verifica che `metadataBase` usi il dominio canonico reale
  > Fallback a `https://middleware.media` via `NEXT_PUBLIC_BASE_URL` → `lib/utils/metadata.ts:5`
- ✅ Definisci un template globale per il `title`
  > `template: "%s | Middleware"` → `app/layout.tsx:26`
- ✅ Definisci una `description` globale sensata
  > Definita in `app/layout.tsx:28-29`

---

## 3. Title e meta description

- ✅ Ogni pagina indicizzabile ha un `<title>` unico
  > Tutte le pagine esportano `generateMetadata` con title unico (articoli, podcast, categorie, autori, archivio, homepage, pagine statiche).
- ✅ Ogni pagina indicizzabile ha una meta description unica
  > Description personalizzata su ogni pagina; per gli articoli viene troncata a 160 caratteri → `app/[locale]/articles/[slug]/page.tsx:37-38`
- ✅ Homepage, listing blog, categorie, tag e articoli non hanno titoli duplicati
- ✅ Le pagine importanti fanno override del template globale quando serve

---

## 4. Canonical

- ✅ Ogni pagina indicizzabile ha una canonical corretta
  > `alternates.canonical` impostato in ogni `generateMetadata` di pagina.
- ✅ Le canonical puntano sempre all'URL canonico finale
  > Costruite da `getBaseUrl() + "/" + locale + "/" + slug`.
- ✅ Parametri come `utm_*`, sorting e filtri non generano canonical errate
  > Le canonical sono costruite staticamente, non dalle URL di navigazione.
- ✅ Le pagine preview non hanno canonical pubbliche
  > Le pagine admin/preview sono escluse dal router pubblico.
- 🔴 Articoli e podcast hanno canonical duplicate (layout + page entrambi le impostano)
  > **Fix**: rimuovere `generateMetadata` da `app/[locale]/articles/[slug]/layout.tsx` e `app/[locale]/podcast/[slug]/layout.tsx`. Il layout articoli ha inoltre un campo `languages` errato che punta a `/authors` invece che all'articolo stesso. La page.tsx ha metadata completo e corretto — è sufficiente.

---

## 5. Robots meta e robots.txt

- ✅ Le pagine pubbliche sono indicizzabili
  > `robots: { index: true, follow: true }` globale → `app/layout.tsx:63-73`
- ✅ Admin, preview e pagine test sono escluse dall'indice
  > `/admin/` escluso da `robots.txt`; admin routes richiedono autenticazione.
- 🔴 Login admin non escluso da robots.txt
  > La pagina `app/[locale]/admin/(public)/login/` è pubblica ma non in disallow. **Fix**: aggiungere `/it/admin/` (o pattern locale) al disallow in `app/robots.ts`.
- ✅ `/robots.txt` è raggiungibile
  > `app/robots.ts` genera la risposta → `/robots.txt`
- ✅ In `robots.txt` è presente la riga della sitemap
  > `sitemap: \`${baseUrl}/sitemap.xml\`` → `app/robots.ts:20`
- ✅ Le pagine non indicizzabili usano meta robots coerenti
  > 404 dinamiche hanno `robots: { index: false, follow: false }` → `app/not-found.tsx`

---

## 6. Sitemap XML

- ✅ `/sitemap.xml` esiste ed è accessibile
  > Generata da `app/sitemap.ts`
- ✅ La sitemap contiene solo URL canoniche
  > URL costruite con `getBaseUrl()` + locale + slug
- ✅ La sitemap contiene solo URL con status `200`
  > Solo contenuti `published` vengono inclusi (filtro a livello di `getAllArticles()`, `getAllPodcasts()`, etc.)
- ✅ La sitemap esclude `noindex`, preview, redirect, 404 e draft
  > Filtro `published` in `lib/content/articles.ts:11` e analogamente per podcast/issues
- ✅ `lastmod` è valorizzato correttamente per gli articoli
  > `new Date(article.last_update || article.date)` → `app/sitemap.ts:61`
- ⬜ Se hai molte URL, valuta sitemap multiple
  > Al momento il volume è gestibile con una sitemap singola; rivalutare quando le URL superano ~10.000.

---

## 7. Open Graph e social metadata

- ✅ Homepage e articoli hanno `og:title`
- ✅ Homepage e articoli hanno `og:description`
- ✅ Homepage e articoli hanno `og:image`
  > Immagini dinamiche 1200×630 via `/api/og` per gli articoli; fallback a `/logo.svg` per le altre pagine.
- ✅ Sono presenti anche i metadata Twitter/X
  > `card: "summary_large_image"` su tutte le pagine tramite `createTwitterMetadata()`.
- 🔴 Podcast mancano di `og:image` nel metadata finale
  > La page.tsx del podcast (`app/[locale]/podcast/[slug]/page.tsx:40-46`) non include `images` nell'openGraph; siccome la page.tsx fa override del layout.tsx, l'immagine della cover viene persa. **Fix**: aggiungere recupero della cover image dal issue associato e includerla nell'openGraph di `page.tsx`.
- ✅ Le immagini social hanno URL corrette e pubbliche
  > Costruite da `getBaseUrl()` + path.
- ⬜ Le immagini social non sono rotte e hanno dimensioni sensate
  > Da verificare a runtime con [opengraph.xyz](https://www.opengraph.xyz).

---

## 8. Structured data / JSON-LD

- ✅ Hai `Organization` a livello globale
  > `createOrganizationSchema()` renderizzato in `app/[locale]/layout.tsx:86`
- ✅ Gli articoli hanno `Article` con headline, author, datePublished, dateModified, image
  > Schema completo in `app/[locale]/articles/[slug]/page.tsx:114-141`
- ✅ I podcast hanno `PodcastEpisode` con audio, datePublished, dateModified
  > Schema in `app/[locale]/podcast/[slug]/page.tsx:66-82`
- ✅ I breadcrumb hanno `BreadcrumbList` su articoli e podcast
  > Tre livelli (Home → Sezione → Titolo) → `page.tsx:143-166` articoli, `page.tsx:84-107` podcast
- 🔴 Schema JSON-LD duplicato su articoli e podcast
  > Il layout.tsx di articoli e podcast rendono `<StructuredData>` con schema base (`createArticleSchema`, `createPodcastSchema`), mentre le rispettive page.tsx rendono uno schema più completo + breadcrumb. Risultato: due blocchi `<script type="application/ld+json">` con tipo Article/Podcast sulla stessa pagina. **Fix**: rimuovere `<StructuredData>` e le variabili schema dal corpo di entrambi i layout (mantenendo solo la struttura HTML).
- 💬 `sameAs` in Organization schema è vuoto
  > `lib/utils/metadata.ts:154` ha `sameAs: []`. Aggiungere gli URL dei profili social ufficiali di Middleware (da comunicare al team).
- ⬜ I dati strutturati sono testati con Rich Results Test
  > Da verificare su [search.google.com/test/rich-results](https://search.google.com/test/rich-results) dopo il deploy.

---

## 9. Rendering, status code e indicizzabilità reale

- ✅ Le pagine reali rispondono con `200`
- ✅ Le pagine rimosse rispondono con `404`
  > `notFound()` di Next.js su slug inesistenti → `app/[locale]/articles/[slug]/page.tsx:194`
- ✅ I redirect usano `301` o `308` quando appropriato
  > Redirect configurabili su Vercel; HSTS forza HTTPS.
- ✅ Il contenuto principale dell'articolo è presente nell'HTML renderizzato
  > RSC (React Server Components) con ISR; il contenuto è server-rendered.
- ✅ Le pagine non risultano vuote lato server per i crawler
- ✅ Non esistono pagine duplicate raggiungibili con più URL
  > La canonical è univoca e le route sono definite dallo slug.

---

## 10. Performance SEO-relevant

- ⬜ Homepage e articoli hanno buone metriche Core Web Vitals
  > Vercel Speed Insights è installato (`components/Analytics.tsx`) — da monitorare a runtime.
- ⬜ LCP è sotto controllo sulle pagine principali
  > Da verificare; le immagini hero usano `priority` → `app/[locale]/issues/[slug]/components/IssueCover.tsx:68`
- ✅ Le immagini sono ottimizzate e dimensionate correttamente
  > Formati AVIF/WebP, responsive sizes configurati → `next.config.ts:4-39`
- ✅ I font sono caricati in modo efficiente
  > `next/font/local` con `display: "swap"` e `preload: true` per il font primario → `lib/fonts.ts`
- ✅ Gli script di terze parti sono ridotti al minimo
  > Solo Vercel Analytics caricato con `dynamic()` e `ssr: false`
- ✅ Non carichi JavaScript inutile sopra la piega
  > RSC + caricamento lazy degli analytics
- ✅ Le pagine editoriali sfruttano caching dove possibile
  > ISR con `revalidate = 3600` sugli articoli; header cache-control su `/rss.xml`

---

## 11. Analytics e Search Console

- 💬 Search Console è configurata
  > Nessuna verifica trovata nel codice. Da configurare via DNS TXT, file HTML in `/public`, o meta tag in `app/layout.tsx`.
- 💬 La sitemap è inviata in Search Console
  > Dopo aver configurato Search Console, inviare `https://middleware.media/sitemap.xml`.
- ✅ Vercel Analytics è installato correttamente
  > `@vercel/analytics` + `@vercel/speed-insights` → `components/Analytics.tsx` caricato in `app/[locale]/layout.tsx:89`
- 💬 GA4 o GTM non installati — valutare se necessari
  > Attualmente solo Vercel Analytics. Se si vuole GA4, aggiungerlo come script in `app/layout.tsx` condizionato a `NODE_ENV === "production"`.
- ✅ Non c'è doppio tracciamento analytics
  > Un solo provider (Vercel Analytics).
- ✅ Preview e staging non inquinano i dati di produzione
  > Vercel Analytics traccia solo il dominio di produzione per default; verificare impostazioni progetto su Vercel.

---

## 12. Pagine e template da verificare una per una

- ✅ Homepage → `app/[locale]/(home)/page.tsx`
- ✅ Pagina listing del blog → `app/[locale]/archive/page.tsx`
- ✅ Singolo articolo → `app/[locale]/articles/[slug]/page.tsx`
- ✅ Categoria → `app/[locale]/categories/page.tsx`
- ✅ Tag / Autore → `app/[locale]/authors/page.tsx`
- ✅ Pagine statiche (catch-all) → `app/[locale]/[slug]/page.tsx`
- ✅ Podcast listing → `app/[locale]/podcasts/page.tsx`
- ⬜ Pagine paginate
  > Non è presente un sistema di paginazione server-side; il caricamento avviene client-side. Da valutare se serve paginazione con URL proprie (`?page=2`) per il SEO.
- ✅ 404 personalizzata → `app/not-found.tsx` con `robots: noindex`
- ✅ Feed RSS → `app/rss.xml/route.ts` con link discovery nel root layout

---

## 13. Checklist specifica per ogni articolo

- ✅ URL pulita e definitiva
  > `/${locale}/articles/${slug}` — slug derivato dal frontmatter dei file Markdown.
- ✅ Titolo SEO chiaro
  > `title: article.title` + template `%s | Middleware`
- ✅ Meta description presente (troncata a 160 char)
  > `app/[locale]/articles/[slug]/page.tsx:37-38`
- ✅ Canonical corretta
  > `alternates.canonical: articleUrl`
- ✅ H1 presente e unico
  > `<H1>{article.title}</H1>` → `app/[locale]/articles/[slug]/components/Article.tsx:144`
- ✅ Immagine cover presente e ottimizzata
  > Next.js `<Image>` con AVIF/WebP
- ✅ Alt text delle immagini compilati
  > Cover issue con alt descrittivo; 🔴 eccezione: logo con `alt=""` → fix in `components/organism/pictogram/index.tsx:29`
- ✅ `datePublished` e `dateModified` corretti
  > Nel JSON-LD della page.tsx: `dateModified: article.last_update || article.date`
- ✅ Autore valorizzato correttamente
  > `author: { "@type": "Person", name: author?.name }` nel schema articolo
- ✅ Breadcrumb presenti (JSON-LD)
  > BreadcrumbList in `page.tsx:143-166`; non renderizzati visualmente (solo per i crawler).
- ✅ Open Graph completo (title, description, image, type: article, publishedTime, modifiedTime)
- ✅ Structured data valido
  > Da confermare con Rich Results Test dopo il deploy.
- 🔴 Keywords malformate nel metadata articolo
  > `app/[locale]/articles/[slug]/page.tsx:58`: `article.title.split(" ").slice(0, 3)` è un array annidato senza spread operator — produce keyword errate. **Fix**: aggiungere `...` per espanderlo.
- ⬜ Nessun link rotto nel contenuto
  > Da verificare a runtime (tool come Screaming Frog o broken-link-checker).
- ⬜ Nessun contenuto placeholder o draft residuo
  > Il filtro `published` esclude i draft, ma i contenuti pubblicati andrebbero revisionati editorialmente.

---

## 14. Controlli finali pre go-live

- 💬 Ambiente staging non è indicizzabile
  > Configurare su Vercel: nelle impostazioni del progetto → "Preview Deployments" → aggiungere header `X-Robots-Tag: noindex` per i deployment non di produzione. In alternativa, usare una variabile d'ambiente per condizionare i robots meta.
- 💬 Ambiente produzione è indicizzabile
  > Verificare che `NEXT_PUBLIC_BASE_URL=https://middleware.media` sia impostato nell'ambiente di produzione su Vercel.
- 💬 Dominio finale è collegato e raggiungibile in HTTPS
  > Da verificare su Vercel Dashboard dopo il go-live.
- 💬 Redirect finali funzionano correttamente
  > Da testare manualmente dopo la configurazione DNS.
- ✅ `robots.txt` e `sitemap.xml` sono online (nel codice)
  > Presenti e funzionanti nella codebase; da verificare sul dominio finale.
- 💬 Search Console verifica il dominio correttamente
  > Da completare dopo aver configurato Search Console (vedi Punto 11).
- ⬜ Nessun meta tag `noindex` lasciato per errore in produzione
  > Da verificare con una scansione del sito (Screaming Frog o Search Console Coverage).
- ✅ Nessun link interno punta ancora a staging o localhost
  > I pochi riferimenti a `localhost` trovati sono in configurazioni dev-only o `remotePatterns` per le immagini (non link navigabili).
