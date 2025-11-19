/* **************************************************
 * Shared Fetcher with Logging
 * Usa questo fetcher per avere logging automatico
 **************************************************/

/**
 * Fetcher condiviso con logging per verificare cache vs REST
 */
export function createFetcher<T>(endpointName: string) {
  return async (url: string): Promise<T> => {
    // Log per verificare se il fetcher viene chiamato (non cache)
    if (process.env.NODE_ENV === "development") {
      console.log(`[SWR] Fetcher chiamato per: ${url}`, {
        timestamp: new Date().toISOString(),
        source: "network-request",
        endpoint: endpointName,
      });
    }

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${endpointName}`);
    }

    const dataSource = res.headers.get("X-Data-Source");
    const timestamp = res.headers.get("X-Timestamp");

    if (process.env.NODE_ENV === "development") {
      console.log(`[SWR] Risposta ricevuta per: ${url}`, {
        dataSource: dataSource || "unknown",
        timestamp: timestamp || "unknown",
        cached: dataSource === null, // Se non c'è header, potrebbe essere da cache del browser
        endpoint: endpointName,
      });
    }

    return res.json();
  };
}

