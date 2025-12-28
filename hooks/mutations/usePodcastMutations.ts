/* **************************************************
 * usePodcastMutations Hook
 ************************************************** */
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deletePodcastAction,
  publishPodcastAction,
  unpublishPodcastAction,
} from "@/lib/actions";
import type { Podcast } from "@/lib/github/types";

export function usePodcastMutations() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const deletePodcast = async (slug: string) => {
    setError(null);
    return new Promise<boolean>((resolve) => {
      startTransition(async () => {
        const result = await deletePodcastAction(slug);
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

  const publishPodcast = async (slug: string) => {
    setError(null);
    return new Promise<Podcast | null>((resolve) => {
      startTransition(async () => {
        const result = await publishPodcastAction(slug);
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

  const unpublishPodcast = async (slug: string) => {
    setError(null);
    return new Promise<Podcast | null>((resolve) => {
      startTransition(async () => {
        const result = await unpublishPodcastAction(slug);
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
    deletePodcast,
    publishPodcast,
    unpublishPodcast,
    isPending,
    error,
    clearError: () => setError(null),
  };
}
