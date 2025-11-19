/* **************************************************
 * Imports
 **************************************************/
import useSWR from "swr";
import type { Issue } from "@/lib/github/types";
import { createFetcher } from "./fetcher";
import { swrConfig } from "./config";

/* **************************************************
 * Fetcher
 **************************************************/
const fetcher = createFetcher<Issue[]>("issues");

/* **************************************************
 * useIssues Hook
 **************************************************/
export function useIssues() {
  const { data, error, isLoading, mutate, isValidating } = useSWR<Issue[]>("/api/issues", fetcher, {
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
  });

  return {
    issues: data,
    isLoading,
    isError: error,
    isValidating, // true = sta facendo una richiesta, false = usa cache
    mutate,
  };
}

/* **************************************************
 * useIssue Hook
 **************************************************/
export function useIssue(slug: string | null) {
  const fetcherSingle = createFetcher<Issue>("issue");
  const { data, error, isLoading, mutate, isValidating } = useSWR<Issue>(
    slug ? `/api/issues/${slug}` : null,
    fetcherSingle,
    swrConfig,
  );

  return {
    issue: data,
    isLoading,
    isError: error,
    isValidating,
    mutate,
  };
}
