/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteCategoryAction } from "../actions";
import styles from "../styles";
import { useCategory } from "@/hooks/swr";
import { mutate } from "swr";
import { toast } from "@/hooks/use-toast";

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
  const [isPending, startTransition] = useTransition();

  // Usa SWR per ottenere la categoria (cache pre-popolata dal server)
  const { category } = useCategory(categorySlug);

  async function handleDelete() {
    if (!category) return;

    if (!confirm(`Sei sicuro di voler eliminare la categoria "${category.name}"?`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteCategoryAction(categorySlug);

      if (!result.success) {
        toast.actionResult(result, { errorTitle: "Impossibile eliminare categoria" });
      } else {
        toast.success(result.message || "Categoria eliminata con successo");
        // Invalida la cache SWR per forzare il refetch
        mutate("/api/categories");
        mutate(`/api/categories/${categorySlug}`);
        router.push("/admin/categories");
      }
    });
  }

  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold mb-4 text-red-700">Zona Pericolosa</h3>
      <button onClick={handleDelete} className={styles.deleteButton} disabled={isPending}>
        {isPending ? "Eliminazione..." : "Elimina Categoria"}
      </button>
    </div>
  );
}
