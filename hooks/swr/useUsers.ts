/* **************************************************
 * Imports
 **************************************************/
import useSWR from "swr";
import type { User } from "@/lib/github/users";
import { createLogger } from "@/lib/logger";
import { createFetcher } from "./fetcher";
import { swrConfig } from "./config";

const logger = createLogger("SWR");

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
    onSuccess: (data, key) => {
      logger.debug(`Dati caricati per: ${key}`, {
        timestamp: new Date().toISOString(),
        itemsCount: Array.isArray(data) ? data.length : 1,
        fromCache: !isValidating && data !== undefined,
      });
    },
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
