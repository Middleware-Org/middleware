/* **************************************************
 * SWR Configuration
 * Configurazione comune per tutti gli hook SWR
 **************************************************/

import type { SWRConfiguration } from "swr";

/**
 * Configurazione ottimizzata per SWR
 * - Disabilita revalidazione automatica su focus per evitare richieste durante navigazione
 * - Aumenta dedupingInterval per evitare richieste duplicate
 * - Mantiene i dati precedenti durante la navigazione
 */
export const swrConfig: SWRConfiguration = {
  revalidateOnFocus: false, // Disabilitato per evitare richieste durante navigazione
  revalidateOnReconnect: true, // Revalida solo su riconnessione
  revalidateIfStale: false, // Non revalidare se i dati non sono stale
  dedupingInterval: 60000, // 60 secondi per evitare richieste duplicate
  keepPreviousData: true, // Mantieni i dati precedenti durante la navigazione
  errorRetryCount: 3,
  errorRetryInterval: 5000,
};

