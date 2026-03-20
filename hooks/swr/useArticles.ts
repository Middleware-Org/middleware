/* **************************************************
 * Imports
 **************************************************/
import useSWR from "swr";

import type { Article } from "@/lib/github/types";

import { swrConfig } from "./config";
import { createFetcher } from "./fetcher";

/* **************************************************
 * Fetcher
 **************************************************/
const fetcher = createFetcher<Article[]>("articles");

/* **************************************************
 * useArticles Hook
 **************************************************/
export function useArticles() {
  const { data, error, isLoading, mutate, isValidating } = useSWR<Article[]>(
    "/api/articles",
    fetcher,
    swrConfig,
  );

  return {
    articles: data,
    isLoading,
    isError: error,
    isValidating, // true = sta facendo una richiesta, false = usa cache
    mutate, // Per invalidare manualmente la cache
  };
}

/* **************************************************
 * useArticle Hook
 **************************************************/
export function useArticle(slug: string | null) {
  const fetcherSingle = createFetcher<Article>("article");
  const { data, error, isLoading, mutate, isValidating } = useSWR<Article>(
    slug ? `/api/articles/${slug}` : null,
    fetcherSingle,
    swrConfig,
  );

  return {
    article: data,
    isLoading,
    isError: error,
    isValidating,
    mutate,
  };
}
