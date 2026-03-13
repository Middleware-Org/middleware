/* **************************************************
 * Imports
 **************************************************/
import useSWR from "swr";
import type { Podcast } from "@/lib/github/types";
import { createLogger } from "@/lib/logger";
import { createFetcher } from "./fetcher";
import { swrConfig } from "./config";

const logger = createLogger("SWR");

/* **************************************************
 * Fetcher
 **************************************************/
const fetcher = createFetcher<Podcast[]>("podcasts");

/* **************************************************
 * usePodcasts Hook
 **************************************************/
export function usePodcasts() {
  const { data, error, isLoading, mutate, isValidating } = useSWR<Podcast[]>(
    "/api/podcasts",
    fetcher,
    {
      ...swrConfig,
      onSuccess: (data, key) => {
        logger.debug(`Dati caricati per: ${key}`, {
          timestamp: new Date().toISOString(),
          itemsCount: Array.isArray(data) ? data.length : 1,
          fromCache: !isValidating && data !== undefined,
        });
      },
    },
  );

  return {
    podcasts: data,
    isLoading,
    isError: error,
    isValidating,
    mutate,
  };
}

/* **************************************************
 * usePodcast Hook
 **************************************************/
export function usePodcast(slug: string | null) {
  const fetcherSingle = createFetcher<Podcast>("podcast");
  const { data, error, isLoading, mutate, isValidating } = useSWR<Podcast>(
    slug ? `/api/podcasts/${slug}` : null,
    fetcherSingle,
    swrConfig,
  );

  return {
    podcast: data,
    isLoading,
    isError: error,
    isValidating,
    mutate,
  };
}
