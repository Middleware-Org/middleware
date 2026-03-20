/* **************************************************
 * Imports
 **************************************************/
import useSWR from "swr";

import type { Podcast } from "@/lib/github/types";

import { swrConfig } from "./config";
import { createFetcher } from "./fetcher";

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
    swrConfig,
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
