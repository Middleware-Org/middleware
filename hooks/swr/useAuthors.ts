/* **************************************************
 * Imports
 **************************************************/
import useSWR from "swr";

import type { Author } from "@/lib/github/types";

import { swrConfig } from "./config";
import { createFetcher } from "./fetcher";

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
    swrConfig,
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
