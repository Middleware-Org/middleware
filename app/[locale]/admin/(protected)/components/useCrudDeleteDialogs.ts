"use client";

import { useState } from "react";

interface DeleteDialogState<T> {
  isOpen: boolean;
  item: T | null;
}

interface DeleteMultipleDialogState {
  isOpen: boolean;
  count: number;
}

export function useCrudDeleteDialogs<T>() {
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState<T>>({
    isOpen: false,
    item: null,
  });

  const [deleteMultipleDialog, setDeleteMultipleDialog] = useState<DeleteMultipleDialogState>({
    isOpen: false,
    count: 0,
  });

  function openDeleteDialog(item: T) {
    setDeleteDialog({ isOpen: true, item });
  }

  function closeDeleteDialog() {
    setDeleteDialog({ isOpen: false, item: null });
  }

  function openDeleteMultipleDialog(count: number) {
    if (count === 0) {
      return;
    }
    setDeleteMultipleDialog({ isOpen: true, count });
  }

  function closeDeleteMultipleDialog() {
    setDeleteMultipleDialog({ isOpen: false, count: 0 });
  }

  return {
    deleteDialog,
    deleteMultipleDialog,
    openDeleteDialog,
    closeDeleteDialog,
    openDeleteMultipleDialog,
    closeDeleteMultipleDialog,
  };
}
