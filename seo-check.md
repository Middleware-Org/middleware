# Checklist SEO Next.js pre go-live

## 1. Dominio canonico e redirect

- [ ] Decidi un solo host canonico: `www.tuodominio.it` oppure `tuodominio.it`
- [ ] Imposta redirect 301 da tutte le varianti verso il canonico
- [ ] Reindirizza `http -> https`
- [ ] Reindirizza `non-www -> www` oppure `www -> non-www`
- [ ] Usa sempre il dominio canonico nei link assoluti, sitemap, canonical, OG image e dati strutturati

## 2. Metadata globale

- [ ] Imposta `metadataBase` nel root layout con il dominio di produzione
- [ ] Verifica che `metadataBase` usi il dominio canonico reale
- [ ] Definisci un template globale per il `title`
- [ ] Definisci una `description` globale sensata

## 3. Title e meta description

- [ ] Ogni pagina indicizzabile ha un `<title>` unico
- [ ] Ogni pagina indicizzabile ha una meta description unica
- [ ] Homepage, listing blog, categorie, tag e articoli non hanno titoli duplicati
- [ ] Le pagine importanti fanno override del template globale quando serve

## 4. Canonical

- [ ] Ogni pagina indicizzabile ha una canonical corretta
- [ ] Le canonical puntano sempre all'URL canonico finale
- [ ] Parametri come `utm_*`, sorting e filtri non generano canonical errate
- [ ] Le pagine preview non hanno canonical pubbliche
- [ ] Articoli, categorie e archivi non canonicalizzano per errore verso homepage

## 5. Robots meta e robots.txt

- [ ] Le pagine pubbliche sono indicizzabili
- [ ] Admin, login, preview, search interna, staging e pagine test sono escluse dall'indice
- [ ] `/robots.txt` è raggiungibile
- [ ] In `robots.txt` è presente la riga della sitemap
- [ ] Le pagine non indicizzabili usano meta robots coerenti

## 6. Sitemap XML

- [ ] `/sitemap.xml` esiste ed è accessibile
- [ ] La sitemap contiene solo URL canoniche
- [ ] La sitemap contiene solo URL con status `200`
- [ ] La sitemap esclude `noindex`, preview, redirect, 404 e draft
- [ ] `lastmod` è valorizzato correttamente per gli articoli
- [ ] Se hai molte URL, valuti sitemap multiple

## 7. Open Graph e social metadata

- [ ] Homepage e articoli hanno `og:title`
- [ ] Homepage e articoli hanno `og:description`
- [ ] Homepage e articoli hanno `og:image`
- [ ] Sono presenti anche i metadata Twitter/X
- [ ] Le immagini social hanno URL corrette e pubbliche
- [ ] Le immagini social non sono rotte e hanno dimensioni sensate

## 8. Structured data / JSON-LD

- [ ] Hai `Organization` oppure `WebSite` a livello globale
- [ ] Gli articoli hanno `BlogPosting` oppure `Article`
- [ ] I breadcrumb hanno `BreadcrumbList` dove serve
- [ ] `author`, `headline`, `image`, `datePublished` e `dateModified` sono coerenti
- [ ] I dati strutturati sono testati con Rich Results Test

## 9. Rendering, status code e indicizzabilità reale

- [ ] Le pagine reali rispondono con `200`
- [ ] Le pagine rimosse rispondono con `404` o `410`
- [ ] I redirect usano `301` o `308` quando appropriato
- [ ] Il contenuto principale dell'articolo è presente nell'HTML renderizzato
- [ ] Le pagine non risultano vuote lato server per i crawler
- [ ] Non esistono pagine duplicate raggiungibili con più URL

## 10. Performance SEO-relevant

- [ ] Homepage e articoli hanno buone metriche Core Web Vitals
- [ ] LCP è sotto controllo sulle pagine principali
- [ ] Le immagini sono ottimizzate e dimensionate correttamente
- [ ] I font sono caricati in modo efficiente
- [ ] Gli script di terze parti sono ridotti al minimo
- [ ] Non carichi JavaScript inutile sopra la piega
- [ ] Le pagine editoriali sfruttano caching dove possibile

## 11. Analytics e Search Console

- [ ] Search Console è configurata
- [ ] La sitemap è inviata in Search Console
- [ ] GA4 o GTM sono installati correttamente
- [ ] Non c'è doppio tracciamento analytics
- [ ] Preview e staging non inquinano i dati di produzione

## 12. Pagine e template da verificare una per una

- [ ] Homepage
- [ ] Pagina listing del blog
- [ ] Singolo articolo
- [ ] Categoria
- [ ] Tag
- [ ] Pagina autore, se esiste
- [ ] Pagine paginated
- [ ] 404 personalizzata
- [ ] Feed RSS, se presente

## 13. Checklist specifica per ogni articolo

- [ ] URL pulita e definitiva
- [ ] Titolo SEO chiaro
- [ ] Meta description presente
- [ ] Canonical corretta
- [ ] H1 presente e unico
- [ ] Immagine cover presente e ottimizzata
- [ ] Alt text delle immagini compilati
- [ ] `datePublished` e `dateModified` corretti
- [ ] Autore valorizzato correttamente
- [ ] Breadcrumb presenti, se previsti
- [ ] Open Graph completo
- [ ] Structured data valido
- [ ] Nessun link rotto nel contenuto
- [ ] Nessun contenuto placeholder o draft residuo

## 14. Controlli finali pre go-live

- [ ] Ambiente staging non è indicizzabile
- [ ] Ambiente produzione è indicizzabile
- [ ] Dominio finale è collegato e raggiungibile in HTTPS
- [ ] Redirect finali funzionano correttamente
- [ ] `robots.txt` e `sitemap.xml` sono online
- [ ] Search Console verifica il dominio correttamente
- [ ] Nessun meta tag `noindex` lasciato per errore in produzione
- [ ] Nessun link interno punta ancora a staging o localhost
