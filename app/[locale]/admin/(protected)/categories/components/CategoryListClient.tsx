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
interface CategoryListClientProps {
  categories: Category[];
}

/* **************************************************
 * Category List Client Component
 **************************************************/
export default function CategoryListClient({ categories }: CategoryListClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<{ message: string; type: "error" | "warning" } | null>(null);

  function handleEdit(category: Category) {
    router.push(`/admin/categories/${category.slug}/edit`);
  }

  async function handleDelete(slug: string, name: string) {
    if (!confirm(`Sei sicuro di voler eliminare la categoria "${name}"?`)) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await deleteCategoryAction(slug);

      if (!result.success) {
        setError({
          message: result.error,
          type: result.errorType || "error",
        });
      } else {
        router.refresh();
      }
    });
  }

  return (
    <>
      {error && (
        <div className={error.type === "warning" ? styles.errorWarning : styles.error}>
          ⚠️ {error.message}
        </div>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Categorie ({categories.length})</h2>
        {categories.length === 0 ? (
          <p className={styles.empty}>Nessuna categoria trovata</p>
        ) : (
          <ul className={styles.list}>
            {categories.map((category) => (
              <li key={category.slug} className={styles.listItem}>
                <div className={styles.itemHeader}>
                  <div>
                    <span className={styles.itemTitle}>{category.name}</span>
                    <span className={styles.itemSlug}>{category.slug}</span>
                  </div>
                  <div className={styles.itemActions}>
                    <button
                      onClick={() => handleEdit(category)}
                      className={styles.editButton}
                      disabled={isPending}
                    >
                      Modifica
                    </button>
                    <button
                      onClick={() => handleDelete(category.slug, category.name)}
                      className={styles.deleteButton}
                      disabled={isPending}
                    >
                      Elimina
                    </button>
                  </div>
                </div>
                <p className={styles.itemDescription}>{category.description}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
