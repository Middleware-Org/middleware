/* **************************************************
 * useIssueMutations Hook
 ************************************************** */
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteIssueAction,
  publishIssueAction,
  unpublishIssueAction,
} from "@/lib/actions";
import type { Issue } from "@/lib/github/types";

export function useIssueMutations() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const deleteIssue = async (slug: string) => {
    setError(null);
    return new Promise<boolean>((resolve) => {
      startTransition(async () => {
        const result = await deleteIssueAction(slug);
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

  const publishIssue = async (slug: string) => {
    setError(null);
    return new Promise<Issue | null>((resolve) => {
      startTransition(async () => {
        const result = await publishIssueAction(slug);
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

  const unpublishIssue = async (slug: string) => {
    setError(null);
    return new Promise<Issue | null>((resolve) => {
      startTransition(async () => {
        const result = await unpublishIssueAction(slug);
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
    deleteIssue,
    publishIssue,
    unpublishIssue,
    isPending,
    error,
    clearError: () => setError(null),
  };
}
