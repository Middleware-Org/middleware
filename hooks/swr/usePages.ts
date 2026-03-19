/* **************************************************
 * Imports
 **************************************************/
import useSWR from "swr";
import { createFetcher } from "./fetcher";
import { swrConfig } from "./config";
import type { Page } from "@/lib/github/types";

/* **************************************************
 * Types
 **************************************************/
type UsePagesResponse = {
  pages: Page[];
  isLoading: boolean;
  isError: boolean;
};

type UsePageResponse = {
  page: Page | null;
  isLoading: boolean;
  isError: boolean;
};

/* **************************************************
 * Hooks
 **************************************************/
export function usePages(initialData?: Page[]): UsePagesResponse {
  const { data, error, isLoading } = useSWR<Page[]>("/api/pages", createFetcher<Page[]>("pages"), {
    ...swrConfig,
    fallbackData: initialData,
  });

  return {
    pages: data || [],
    isLoading,
    isError: !!error,
  };
}

export function usePage(slug: string | null, initialData?: Page): UsePageResponse {
  const { data, error, isLoading } = useSWR<Page | null>(
    slug ? `/api/pages/${slug}` : null,
    createFetcher<Page>("page"),
    {
      ...swrConfig,
      fallbackData: initialData,
    },
  );

  return {
    page: data || null,
    isLoading,
    isError: !!error,
  };
}
