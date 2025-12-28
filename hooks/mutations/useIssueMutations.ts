/**
 * Issue Mutations Hook
 * Hook client per gestire le mutations dei numeri con useTransition
 */
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  createIssueAction,
  updateIssueAction,
  deleteIssueAction,
  deleteIssuesAction,
  type ActionResult,
} from '@/lib/actions/issue.actions';
import type { Issue } from '@/lib/github/types';

export function useIssueMutations() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const create = async (formData: FormData): Promise<Issue | null> => {
    setError(null);
    return new Promise((resolve) => {
      startTransition(async () => {
        const result = await createIssueAction(null, formData);
        if (result.success && result.data) {
          router.refresh();
          resolve(result.data);
        } else {
          setError(result.error);
          resolve(null);
        }
      });
    });
  };

  const update = async (formData: FormData): Promise<Issue | null> => {
    setError(null);
    return new Promise((resolve) => {
      startTransition(async () => {
        const result = await updateIssueAction(null, formData);
        if (result.success && result.data) {
          router.refresh();
          resolve(result.data);
        } else {
          setError(result.error);
          resolve(null);
        }
      });
    });
  };

  const remove = async (slug: string): Promise<boolean> => {
    setError(null);
    return new Promise((resolve) => {
      startTransition(async () => {
        const result = await deleteIssueAction(slug);
        if (result.success) {
          router.refresh();
          resolve(true);
        } else {
          setError(result.error);
          resolve(false);
        }
      });
    });
  };

  const removeMultiple = async (slugs: string[]): Promise<ActionResult<{ deleted: number; failed: number }>> => {
    setError(null);
    return new Promise((resolve) => {
      startTransition(async () => {
        const result = await deleteIssuesAction(slugs);
        if (result.success) {
          router.refresh();
        } else if (result.error) {
          setError(result.error);
        }
        resolve(result);
      });
    });
  };

  return {
    create,
    update,
    remove,
    removeMultiple,
    isPending,
    error,
    clearError: () => setError(null),
  };
}
