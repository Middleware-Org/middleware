/* **************************************************
 * Imports
 **************************************************/
import useSWR from "swr";

import type { MediaFile } from "@/lib/github/media";

import { swrConfig } from "./config";
import { createFetcher } from "./fetcher";

/* **************************************************
 * Fetcher
 **************************************************/
const fetcher = createFetcher<MediaFile[]>("media");

/* **************************************************
 * useMedia Hook
 **************************************************/
export function useMedia() {
  const { data, error, isLoading, mutate, isValidating } = useSWR<MediaFile[]>(
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
