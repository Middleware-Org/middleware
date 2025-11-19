/* **************************************************
 * Imports
 **************************************************/
import useSWR from "swr";
import type { Category } from "@/lib/github/types";
import { createFetcher } from "./fetcher";
import { swrConfig } from "./config";

/* **************************************************
 * Fetcher
 **************************************************/
const fetcher = createFetcher<Category[]>("categories");

/* **************************************************
 * useCategories Hook
 **************************************************/
export function useCategories() {
  const { data, error, isLoading, mutate, isValidating } = useSWR<Category[]>(
    "/api/categories",
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
    categories: data,
    isLoading,
    isError: error,
    isValidating,
    mutate,
  };
}

/* **************************************************
 * useCategory Hook
 **************************************************/
export function useCategory(slug: string | null) {
  const fetcherSingle = createFetcher<Category>("category");
  const { data, error, isLoading, mutate, isValidating } = useSWR<Category>(
    slug ? `/api/categories/${slug}` : null,
    fetcherSingle,
    swrConfig,
  );

  return {
    category: data,
    isLoading,
    isError: error,
    isValidating,
    mutate,
  };
}

