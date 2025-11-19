/* **************************************************
 * Imports
 **************************************************/
"use client";

import { SWRConfig } from "swr";

/* **************************************************
 * SWR Provider Component
 **************************************************/
interface SWRProviderProps {
  children: React.ReactNode;
}

export default function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        // Configurazione globale SWR
        revalidateOnFocus: false, // Disabilitato per evitare richieste durante navigazione
        revalidateOnReconnect: true,
        revalidateIfStale: false, // Non revalidare se i dati non sono stale
        dedupingInterval: 60000, // Aumentato a 60 secondi per evitare richieste duplicate
        // Error retry
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        // Mantieni i dati precedenti durante la navigazione
        keepPreviousData: true,
      }}
    >
      {children}
    </SWRConfig>
  );
}
