/* **************************************************
 * Imports
 **************************************************/
import useSWR from "swr";

import type { Issue } from "@/lib/github/types";

import { swrConfig } from "./config";
import { createFetcher } from "./fetcher";

/* **************************************************
 * Fetcher
 **************************************************/
const fetcher = createFetcher<Issue[]>("issues");

/* **************************************************
 * useIssues Hook
 **************************************************/
export function useIssues() {
  const { data, error, isLoading, mutate, isValidating } = useSWR<Issue[]>(
    "/api/issues",
    fetcher,
    swrConfig,
  );

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
