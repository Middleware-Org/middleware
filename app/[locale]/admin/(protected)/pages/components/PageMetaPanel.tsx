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
  formRef,
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

        {/* Slug field */}
        <div className={styles.field}>
          <label htmlFor={editing ? "newSlug" : "slug"} className={styles.label}>
            Slug {editing ? "(modificabile)" : "(opzionale)"}
          </label>
          {editing && <input type="hidden" name="slug" value={page?.slug} />}
          <input
            type="text"
            id={editing ? "newSlug" : "slug"}
            name={editing ? "newSlug" : "slug"}
            defaultValue={editing ? page?.slug : ""}
            className={styles.input}
            placeholder={
              editing ? page?.slug || "auto-generato se vuoto" : "auto-generato se vuoto"
            }
          />
        </div>
      </div>

      {/* Actions Card */}
      <div className={styles.metaCard}>
        <h3 className={styles.metaCardTitle}>Azioni</h3>
        <div className={styles.formActions}>
          <button
            type="button"
            onClick={() => {
              formRef.current?.requestSubmit();
            }}
            className={styles.submitButton}
            disabled={isPending}
          >
            {isPending ? "Salvataggio..." : editing ? "Aggiorna" : "Crea"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/pages")}
            className={styles.cancelButton}
            disabled={isPending}
          >
            Annulla
          </button>
        </div>

        {editing && page && (
          <>
            {error && (
              <div
                className={`mt-4 ${error.type === "warning" ? baseStyles.errorWarning : baseStyles.error}`}
              >
                ⚠️ {error.message}
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-secondary">
              <h4 className="text-sm font-semibold mb-2 text-tertiary">Zona Pericolosa</h4>
              <button onClick={handleDelete} className={styles.deleteButton} disabled={isPending}>
                {isPending ? "Eliminazione..." : "Elimina Pagina"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
