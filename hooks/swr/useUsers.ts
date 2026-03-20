/* **************************************************
 * Imports
 **************************************************/
import useSWR from "swr";

import type { User } from "@/lib/github/users";

import { swrConfig } from "./config";
import { createFetcher } from "./fetcher";

/* **************************************************
 * Fetcher
 **************************************************/
const fetcher = createFetcher<User[]>("users");

/* **************************************************
 * useUsers Hook
 **************************************************/
export function useUsers() {
  const { data, error, isLoading, mutate, isValidating } = useSWR<User[]>("/api/users", fetcher, {
    ...swrConfig,
  });

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
  const fetcherSingle = createFetcher<User>("user");
  const { data, error, isLoading, mutate, isValidating } = useSWR<User>(
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
