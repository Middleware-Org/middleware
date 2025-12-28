/* **************************************************
 * useAuthorMutations Hook
 ************************************************** */
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteAuthorAction } from "@/lib/actions";

export function useAuthorMutations() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const deleteAuthor = async (slug: string) => {
    setError(null);
    return new Promise<boolean>((resolve) => {
      startTransition(async () => {
        const result = await deleteAuthorAction(slug);
        if (result.success) {
          router.refresh();
          resolve(true);
        } else {
          setError(result.error || "Unknown error");
          resolve(false);
        }
      });
    });
  };

  return {
    deleteAuthor,
    isPending,
    error,
    clearError: () => setError(null),
  };
}
