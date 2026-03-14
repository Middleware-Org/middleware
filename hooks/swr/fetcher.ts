/* **************************************************
 * Shared Fetcher with Logging
 * Usa questo fetcher per avere logging automatico
 **************************************************/

import { createLogger } from "@/lib/logger";

const logger = createLogger("SWR");

/**
 * Fetcher condiviso con logging per verificare cache vs REST
 */
export function createFetcher<T>(endpointName: string) {
  return async (url: string): Promise<T> => {
    logger.debug(`Fetcher chiamato per: ${url}`, {
      timestamp: new Date().toISOString(),
      source: "network-request",
      endpoint: endpointName,
    });

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${endpointName}`);
    }

    const dataSource = res.headers.get("X-Data-Source");
    const timestamp = res.headers.get("X-Timestamp");

    logger.debug(`Risposta ricevuta per: ${url}`, {
      dataSource: dataSource || "unknown",
      timestamp: timestamp || "unknown",
      cached: dataSource === null,
      endpoint: endpointName,
    });

    return res.json();
  };
}
