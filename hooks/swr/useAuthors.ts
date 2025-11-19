/* **************************************************
 * Imports
 **************************************************/
import useSWR from "swr";
import type { Author } from "@/lib/github/types";
import { createFetcher } from "./fetcher";
import { swrConfig } from "./config";

/* **************************************************
 * Fetcher
 **************************************************/
const fetcher = createFetcher<Author[]>("authors");

/* **************************************************
 * useAuthors Hook
 **************************************************/
export function useAuthors() {
  const { data, error, isLoading, mutate, isValidating } = useSWR<Author[]>(
    "/api/authors",
    fetcher,
    {
      ...swrConfig,
      onSuccess: (data, key) => {
        if (process.env.NODE_ENV === "development") {
          console.log("[SWR] Dati caricati per:", key, {
            timestamp: new Date().toISOString(),
            itemsCount: Array.isArray(data) ? data.length : 1,
            fromCache: !isValidating && data !== undefined,
          });
        }
      },
    },
  );

  return {
    authors: data,
    isLoading,
    isError: error,
    isValidating,
    mutate,
  };
}

/* **************************************************
 * useAuthor Hook
 **************************************************/
export function useAuthor(slug: string | null) {
  const fetcherSingle = createFetcher<Author>("author");
  const { data, error, isLoading, mutate, isValidating } = useSWR<Author>(
    slug ? `/api/authors/${slug}` : null,
    fetcherSingle,
    swrConfig,
  );

  return {
    author: data,
    isLoading,
    isError: error,
    isValidating,
    mutate,
  };
}

