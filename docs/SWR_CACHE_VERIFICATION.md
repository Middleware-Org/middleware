# Verifica Cache SWR

Questo documento spiega come verificare se i dati provengono dalla cache SWR o da una richiesta REST.

## Metodi di Verifica

### 1. Console Logs (Browser)

Apri la console del browser (F12) e cerca questi log:

#### Cache SWR (dati pre-popolati dal server):
```
[SWR] Pre-popolazione cache con fallback: { keys: ["/api/articles"], timestamp: "..." }
[SWR] Dati caricati da fallback (SSR cache): /api/articles { itemsCount: 10 }
```

#### Richiesta REST (network request):
```
[SWR] Fetcher chiamato per: /api/articles { source: "network-request" }
[API] GET /api/articles - Richiesta REST effettuata { timestamp: "...", user: "..." }
[SWR] Risposta ricevuta: { dataSource: "rest-api", timestamp: "..." }
```

### 2. Network Tab (Browser DevTools)

1. Apri DevTools (F12)
2. Vai alla tab "Network"
3. Filtra per "Fetch/XHR"
4. **Se vedi una richiesta a `/api/articles`** → Dati da REST (non cache)
5. **Se NON vedi la richiesta** → Dati da cache SWR

### 3. Componente Debug (Development)

In development mode, un indicatore di cache appare in basso a destra che mostra:
- Tutte le chiavi nella cache SWR
- Stato di ogni chiave (cached o not cached)
- Numero di items per ogni entry

### 4. Flag `isValidating` negli Hook

Gli hook SWR restituiscono `isValidating`:
- `isValidating: false` → Usa cache (nessuna richiesta in corso)
- `isValidating: true` → Sta facendo una richiesta network

Esempio:
```typescript
const { articles, isValidating } = useArticles();
console.log("Usa cache?", !isValidating && articles !== undefined);
```

### 5. Headers HTTP

Le API routes aggiungono header personalizzati:
- `X-Data-Source: rest-api` → Risposta da REST
- `X-Timestamp: <timestamp>` → Quando la risposta è stata generata

Se questi header non sono presenti nella risposta, probabilmente è da cache del browser o SWR.

## Comportamento Atteso

### Prima Caricamento (SSR)
1. Server carica dati con `getAllArticles()`
2. Dati passati a `SWRPageProvider` come `fallback`
3. **Nessuna richiesta REST** - dati già in cache SWR
4. Console: `[SWR] Pre-popolazione cache...` e `[SWR] Dati caricati da fallback...`
5. Network tab: **Nessuna richiesta a `/api/articles`**

### Navigazione tra Pagine
1. Se i dati sono già in cache SWR → **Nessuna richiesta REST**
2. Se i dati non sono in cache → Richiesta REST viene fatta
3. Console: `[SWR] Fetcher chiamato...` e `[API] GET /api/...`

### Revalidazione Automatica
1. Su focus della finestra → SWR può fare una richiesta in background
2. Su reconnessione → SWR può fare una richiesta
3. Dopo `dedupingInterval` (5 secondi) → Nuove richieste vengono deduplicate

## Come Disabilitare i Log

I log sono attivi solo in development mode. In production non vengono mostrati.

Per disabilitarli completamente, rimuovi i `console.log` dai file:
- `app/api/**/route.ts`
- `hooks/swr/**/*.ts`
- `components/providers/SWRPageProvider.tsx`

