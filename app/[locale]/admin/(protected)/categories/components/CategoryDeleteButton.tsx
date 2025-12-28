/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteCategoryAction } from "../actions";
import styles from "../styles";
import type { Category } from "@/lib/github/types";

/* **************************************************
 * Types
 **************************************************/
interface CategoryDeleteButtonProps {
  category: Category;
}

/* **************************************************
 * Category Delete Button Component
 **************************************************/
export default function CategoryDeleteButton({ category }: CategoryDeleteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<{ message: string; type: "error" | "warning" } | null>(null);

  async function handleDelete() {
    if (!confirm(`Sei sicuro di voler eliminare la categoria "${category.name}"?`)) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await deleteCategoryAction(category.slug);

      if (!result.success) {
        setError({
          message: result.error,
          type: result.errorType || "error",
        });
      } else {
        router.push("/admin/categories");
        router.refresh();
      }
    });
  }

  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold mb-4 text-red-700">Zona Pericolosa</h3>
      {error && (
        <div className={`mb-4 ${error.type === "warning" ? styles.errorWarning : styles.error}`}>
          ⚠️ {error.message}
        </div>
      )}
      <button onClick={handleDelete} className={styles.deleteButton} disabled={isPending}>
        {isPending ? "Eliminazione..." : "Elimina Categoria"}
      </button>
    </div>
  );
}
