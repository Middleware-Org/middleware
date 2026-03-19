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
      }}
    >
      {children}
    </SWRConfig>
  );
}
