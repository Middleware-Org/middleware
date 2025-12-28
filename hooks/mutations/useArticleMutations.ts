/* **************************************************
 * useArticleMutations Hook
 *
 * Hook client-side per gestire le mutations degli articoli.
 * Utilizza useTransition per gestire lo stato di loading.
 ************************************************** */
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteArticleAction,
  publishArticleAction,
  unpublishArticleAction,
} from "@/lib/actions";
import type { Article } from "@/lib/github/types";

/**
 * Hook per gestire le mutations degli articoli
 */
export function useArticleMutations() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const deleteArticle = async (slug: string) => {
    setError(null);
    return new Promise<boolean>((resolve) => {
      startTransition(async () => {
        const result = await deleteArticleAction(slug);
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

  const publishArticle = async (slug: string) => {
    setError(null);
    return new Promise<Article | null>((resolve) => {
      startTransition(async () => {
        const result = await publishArticleAction(slug);
        if (result.success && result.data) {
          router.refresh();
          resolve(result.data);
        } else {
          setError(result.error || "Unknown error");
          resolve(null);
        }
      });
    });
  };

  const unpublishArticle = async (slug: string) => {
    setError(null);
    return new Promise<Article | null>((resolve) => {
      startTransition(async () => {
        const result = await unpublishArticleAction(slug);
        if (result.success && result.data) {
          router.refresh();
          resolve(result.data);
        } else {
          setError(result.error || "Unknown error");
          resolve(null);
        }
      });
    });
  };

  return {
    deleteArticle,
    publishArticle,
    unpublishArticle,
    isPending,
    error,
    clearError: () => setError(null),
  };
}
