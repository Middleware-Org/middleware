/* **************************************************
 * Imports
 **************************************************/
import useSWR from "swr";

import type { ApiMediaFile } from "@/lib/github/types";

import { swrConfig } from "./config";

/* **************************************************
 * Fetcher
 **************************************************/
const fetcher = async (url: string): Promise<ApiMediaFile[]> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to fetch media");
  }

  return res.json();
};

/* **************************************************
 * useMedia Hook
 **************************************************/
export function useMedia() {
  const { data, error, isLoading, mutate, isValidating } = useSWR<ApiMediaFile[]>(
    "/api/media",
    fetcher,
    {
      ...swrConfig,
      revalidateIfStale: true,
      dedupingInterval: 5_000,
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
