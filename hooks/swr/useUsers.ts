/* **************************************************
 * Imports
 **************************************************/
import useSWR from "swr";

import type { ApiUser } from "@/lib/github/types";

import { swrConfig } from "./config";
import { createFetcher } from "./fetcher";

/* **************************************************
 * Fetcher
 **************************************************/
const fetcher = createFetcher<ApiUser[]>("users");

/* **************************************************
 * useUsers Hook
 **************************************************/
export function useUsers() {
  const { data, error, isLoading, mutate, isValidating } = useSWR<ApiUser[]>(
    "/api/users",
    fetcher,
    {
      ...swrConfig,
    },
  );

  return {
    users: data,
    isLoading,
    isError: error,
    isValidating,
    mutate,
  };
}

/* **************************************************
 * useUser Hook
 **************************************************/
export function useUser(id: string | null) {
  const fetcherSingle = createFetcher<ApiUser>("user");
  const { data, error, isLoading, mutate, isValidating } = useSWR<ApiUser>(
    id ? `/api/users/${id}` : null,
    fetcherSingle,
    swrConfig,
  );

  return {
    user: data,
    isLoading,
    isError: error,
    isValidating,
    mutate,
  };
}
