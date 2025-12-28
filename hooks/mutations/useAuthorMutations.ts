/**
 * Author Mutations Hook
 * Hook client per gestire le mutations degli autori con useTransition
 */
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  createAuthorAction,
  updateAuthorAction,
  deleteAuthorAction,
  deleteAuthorsAction,
  type ActionResult,
} from '@/lib/actions/author.actions';
import type { Author } from '@/lib/github/types';

export function useAuthorMutations() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const create = async (formData: FormData): Promise<Author | null> => {
    setError(null);
    return new Promise((resolve) => {
      startTransition(async () => {
        const result = await createAuthorAction(null, formData);
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

  const update = async (formData: FormData): Promise<Author | null> => {
    setError(null);
    return new Promise((resolve) => {
      startTransition(async () => {
        const result = await updateAuthorAction(null, formData);
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
        const result = await deleteAuthorAction(slug);
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
        const result = await deleteAuthorsAction(slugs);
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
