/* **************************************************
 * Imports
 **************************************************/
import useSWR from "swr";

import type { ApiMediaFile } from "@/lib/github/types";

import { swrConfig } from "./config";
import { createFetcher } from "./fetcher";

/* **************************************************
 * Fetcher
 **************************************************/
const fetcher = createFetcher<ApiMediaFile[]>("media");

/* **************************************************
 * useMedia Hook
 **************************************************/
export function useMedia() {
  const { data, error, isLoading, mutate, isValidating } = useSWR<ApiMediaFile[]>(
    "/api/media",
    fetcher,
    swrConfig,
  );

  return {
    mediaFiles: data,
    isLoading,
    isError: error,
    isValidating,
    mutate,
  };
}
