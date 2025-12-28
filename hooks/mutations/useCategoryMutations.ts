/**
 * Category Mutations Hook
 * Hook client per gestire le mutations delle categorie con useTransition
 */
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  deleteCategoriesAction,
  type ActionResult,
} from '@/lib/actions/category.actions';
import type { Category } from '@/lib/github/types';

export function useCategoryMutations() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const create = async (formData: FormData): Promise<Category | null> => {
    setError(null);
    return new Promise((resolve) => {
      startTransition(async () => {
        const result = await createCategoryAction(null, formData);
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

  const update = async (formData: FormData): Promise<Category | null> => {
    setError(null);
    return new Promise((resolve) => {
      startTransition(async () => {
        const result = await updateCategoryAction(null, formData);
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
        const result = await deleteCategoryAction(slug);
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
        const result = await deleteCategoriesAction(slugs);
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
