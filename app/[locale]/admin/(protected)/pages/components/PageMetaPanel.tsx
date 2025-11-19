/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deletePageAction } from "../actions";
import styles from "../styles";
import baseStyles from "../../styles";
import type { Page } from "@/lib/github/types";
import { mutate } from "swr";

/* **************************************************
 * Types
 **************************************************/
interface PageMetaPanelProps {
  page?: Page | null;
  formData: {
    title: string;
    excerpt: string;
  };
  onFormDataChange: (field: string, value: string) => void;
  editing: boolean;
  formRef: React.RefObject<HTMLFormElement | null>;
}

/* **************************************************
 * Page Meta Panel Component
 **************************************************/
export default function PageMetaPanel({
  page,
  formData,
  onFormDataChange,
  editing,
}: PageMetaPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<{ message: string; type: "error" | "warning" } | null>(null);

  async function handleDelete() {
    if (!page) return;

    if (!confirm(`Sei sicuro di voler eliminare la pagina "${page.title}"?`)) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await deletePageAction(page.slug);

      if (!result.success) {
        setError({
          message: result.error,
          type: result.errorType || "error",
        });
      } else {
        // Invalida la cache SWR per forzare il refetch della lista
        mutate("/api/pages");
        mutate(`/api/pages/${page.slug}`);
        router.push("/admin/pages");
      }
    });
  }

  return (
    <div className={styles.metaPanel}>
      <div className={styles.metaCard}>
        <h3 className={styles.metaCardTitle}>Metadati</h3>

        {/* Title */}
        <div className={styles.field}>
          <label htmlFor="title" className={styles.label}>
            Titolo *
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => onFormDataChange("title", e.target.value)}
            className={styles.input}
            required
            placeholder="Titolo della pagina"
          />
          <input type="hidden" name="title" value={formData.title} />
        </div>

        {/* Excerpt */}
        <div className={styles.field}>
          <label htmlFor="excerpt" className={styles.label}>
            Excerpt
          </label>
          <textarea
            id="excerpt"
            value={formData.excerpt}
            onChange={(e) => onFormDataChange("excerpt", e.target.value)}
            className={styles.textarea}
            rows={3}
            placeholder="Breve descrizione della pagina"
          />
          <input type="hidden" name="excerpt" value={formData.excerpt} />
        </div>

        {/* Slug field (hidden for edit, visible for create) */}
        {!editing && (
          <div className={styles.field}>
            <label htmlFor="slug" className={styles.label}>
              Slug *
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              className={styles.input}
              required
              placeholder="es: about-us"
            />
          </div>
        )}

        {/* New Slug field (only for edit) */}
        {editing && (
          <>
            <input type="hidden" name="slug" value={page?.slug} />
            <div className={styles.field}>
              <label htmlFor="newSlug" className={styles.label}>
                Slug
              </label>
              <input
                type="text"
                id="newSlug"
                name="newSlug"
                defaultValue={page?.slug}
                className={styles.input}
                placeholder="es: about-us"
              />
            </div>
          </>
        )}

        {/* Error Message */}
        {error && (
          <div className={error.type === "warning" ? baseStyles.errorWarning : baseStyles.error}>
            ⚠️ {error.message}
          </div>
        )}

        {/* Delete Button (only in edit mode) */}
        {editing && page && (
          <div className={styles.field}>
            <button
              type="button"
              onClick={handleDelete}
              className={styles.deleteButton}
              disabled={isPending}
            >
              {isPending ? "Eliminazione..." : "Elimina Pagina"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
