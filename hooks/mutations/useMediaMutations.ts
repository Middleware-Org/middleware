/**
 * Media Mutations Hook
 * Hook client per gestire le mutations dei media con useTransition
 */
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  uploadMediaAction,
  deleteMediaAction,
  deleteMediaFilesAction,
  renameMediaAction,
  type ActionResult,
} from '@/lib/actions/media.actions';

export function useMediaMutations() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const upload = async (formData: FormData): Promise<string | null> => {
    setError(null);
    return new Promise((resolve) => {
      startTransition(async () => {
        const result = await uploadMediaAction(null, formData);
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

  const remove = async (filename: string): Promise<boolean> => {
    setError(null);
    return new Promise((resolve) => {
      startTransition(async () => {
        const result = await deleteMediaAction(filename);
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

  const removeMultiple = async (filenames: string[]): Promise<ActionResult<{ deleted: number; failed: number }>> => {
    setError(null);
    return new Promise((resolve) => {
      startTransition(async () => {
        const result = await deleteMediaFilesAction(filenames);
        if (result.success) {
          router.refresh();
        } else if (result.error) {
          setError(result.error);
        }
        resolve(result);
      });
    });
  };

  const rename = async (oldFilename: string, newFilename: string): Promise<string | null> => {
    setError(null);
    return new Promise((resolve) => {
      startTransition(async () => {
        const result = await renameMediaAction(oldFilename, newFilename);
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

  return {
    upload,
    remove,
    removeMultiple,
    rename,
    isPending,
    error,
    clearError: () => setError(null),
  };
}
