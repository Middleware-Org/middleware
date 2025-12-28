/**
 * Page Mutations Hook
 * Hook client per gestire le mutations delle pagine con useTransition
 */
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  createPageAction,
  updatePageAction,
  deletePageAction,
  deletePagesAction,
  type ActionResult,
} from '@/lib/actions/page.actions';
import type { Page } from '@/lib/github/types';

export function usePageMutations() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const create = async (formData: FormData): Promise<Page | null> => {
    setError(null);
    return new Promise((resolve) => {
      startTransition(async () => {
        const result = await createPageAction(null, formData);
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

  const update = async (formData: FormData): Promise<Page | null> => {
    setError(null);
    return new Promise((resolve) => {
      startTransition(async () => {
        const result = await updatePageAction(null, formData);
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
        const result = await deletePageAction(slug);
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
        const result = await deletePagesAction(slugs);
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
