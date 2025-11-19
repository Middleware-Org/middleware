/* **************************************************
 * Imports
 **************************************************/
"use client";

import { SWRConfig } from "swr";

/* **************************************************
 * Types
 **************************************************/
interface SWRPageProviderProps {
  children: React.ReactNode;
  fallback: Record<string, unknown>;
}

/* **************************************************
 * SWR Page Provider Component
 * Pre-popola la cache SWR con dati dal server
 **************************************************/
export default function SWRPageProvider({ children, fallback }: SWRPageProviderProps) {
  // Log in development per vedere cosa viene pre-popolato
  if (process.env.NODE_ENV === "development") {
    const fallbackKeys = Object.keys(fallback);
    const fallbackSummary = fallbackKeys.reduce(
      (acc, key) => {
        const value = fallback[key];
        acc[key] = {
          type: Array.isArray(value) ? "array" : typeof value,
          count: Array.isArray(value) ? value.length : value ? 1 : 0,
        };
        return acc;
      },
      {} as Record<string, { type: string; count: number }>,
    );

    console.log("[SWR] Pre-popolazione cache con fallback:", {
      keys: fallbackKeys,
      summary: fallbackSummary,
      timestamp: new Date().toISOString(),
    });
  }

  return (
    <SWRConfig
      value={{
        fallback, // Pre-popolazione cache con dati SSR
        revalidateOnFocus: false, // Disabilitato per evitare richieste durante navigazione
        revalidateOnReconnect: true,
        revalidateIfStale: false, // Non revalidare se i dati non sono stale
        dedupingInterval: 60000, // Aumentato a 60 secondi per evitare richieste duplicate
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        keepPreviousData: true, // Mantieni i dati precedenti durante la navigazione
        onSuccess: (data, key) => {
          // Log quando SWR usa i dati dal fallback (cache SSR)
          if (process.env.NODE_ENV === "development") {
            console.log("[SWR] Dati caricati da fallback (SSR cache):", key, {
              timestamp: new Date().toISOString(),
              itemsCount: Array.isArray(data) ? data.length : 1,
            });
          }
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
