/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { mutate } from "swr";

import ConfirmDialog from "@/components/molecules/confirmDialog";
import { useCategory } from "@/hooks/swr";
import { toast } from "@/hooks/use-toast";
import { useLocalizedPath } from "@/lib/i18n/client";

import { adminFormCopy } from "../../components/adminFormCopy";
import { deleteCategoryAction } from "../actions";
import styles from "../styles";

/* **************************************************
 * Types
 **************************************************/
interface CategoryDeleteButtonProps {
  categorySlug: string;
}

/* **************************************************
 * Category Delete Button Component
 **************************************************/
export default function CategoryDeleteButton({ categorySlug }: CategoryDeleteButtonProps) {
  const router = useRouter();
  const toLocale = useLocalizedPath();
  const [isPending, startTransition] = useTransition();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Usa SWR per ottenere la categoria (cache pre-popolata dal server)
  const { category } = useCategory(categorySlug);

  async function handleDelete() {
    if (!category) return;

    setIsConfirmOpen(false);

    startTransition(async () => {
      const result = await deleteCategoryAction(categorySlug);

      if (!result.success) {
        toast.actionResult(result, { errorTitle: adminFormCopy.deleteButtons.deleteCategoryError });
      } else {
        toast.success(result.message || adminFormCopy.deleteButtons.deleteCategorySuccess);
        // Invalida la cache SWR per forzare il refetch
        mutate("/api/categories");
        mutate(`/api/categories/${categorySlug}`);
        router.push(toLocale("/admin/categories"));
      }
    });
  }

  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold mb-4 text-red-700">
        {adminFormCopy.deleteButtons.dangerZone}
      </h3>
      <button
        onClick={() => setIsConfirmOpen(true)}
        className={styles.deleteButton}
        disabled={isPending}
      >
        {isPending
          ? adminFormCopy.deleteButtons.deleting
          : adminFormCopy.deleteButtons.deleteCategory}
      </button>

      {category && (
        <ConfirmDialog
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleDelete}
          title={adminFormCopy.deleteButtons.deleteCategory}
          message={adminFormCopy.deleteButtons.confirmDeleteCategory(category.name)}
          confirmText={adminFormCopy.common.delete}
          cancelText={adminFormCopy.common.cancel}
          confirmButtonClassName={styles.deleteButton}
          isLoading={isPending}
        />
      )}
    </div>
  );
}
