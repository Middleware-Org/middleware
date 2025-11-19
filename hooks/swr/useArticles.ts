/* **************************************************
 * Imports
 **************************************************/
import useSWR from "swr";
import type { Article } from "@/lib/github/types";
import { createFetcher } from "./fetcher";
import { swrConfig } from "./config";

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
    {
      ...swrConfig,
      onSuccess: (data, key) => {
        // Log quando i dati vengono caricati (potrebbe essere da cache o network)
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
