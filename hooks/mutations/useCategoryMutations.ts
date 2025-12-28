/* **************************************************
 * useCategoryMutations Hook
 ************************************************** */
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCategoryAction } from "@/lib/actions";

export function useCategoryMutations() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const deleteCategory = async (slug: string) => {
    setError(null);
    return new Promise<boolean>((resolve) => {
      startTransition(async () => {
        const result = await deleteCategoryAction(slug);
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
    deleteCategory,
    isPending,
    error,
    clearError: () => setError(null),
  };
}
