/* **************************************************
 * Imports
 **************************************************/
import useSWR from "swr";
import type { MediaFile } from "@/lib/github/media";
import { createFetcher } from "./fetcher";
import { swrConfig } from "./config";

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
    mediaFiles: data,
    isLoading,
    isError: error,
    isValidating,
    mutate,
  };
}
