/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/classes";
import { deletePageAction } from "../actions";
import ConfirmDialog from "@/components/molecules/confirmDialog";
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
 * Slug Generation Utility (Client-side)
 **************************************************/
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD") // Normalize to decomposed form for handling accents
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
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
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [slugValue, setSlugValue] = useState(page?.slug || "");

  // Sync slug value when page changes
  useEffect(() => {
    if (page?.slug) {
      setSlugValue(page.slug);
    }
  }, [page?.slug]);

  // Update hidden input when slugValue changes
  useEffect(() => {
    const slugInput = formRef.current?.querySelector(
      editing ? 'input[name="newSlug"]' : 'input[name="slug"]',
    ) as HTMLInputElement;
    if (slugInput) {
      slugInput.value = slugValue;
    }
  }, [slugValue, formRef, editing]);

  // Handler per generare lo slug dal titolo
  function handleGenerateSlug() {
    if (formData.title) {
      const generatedSlug = generateSlug(formData.title);
      setSlugValue(generatedSlug);
    }
  }

  // Handler per aprire il dialog di conferma eliminazione
  function handleDeleteClick() {
    if (page) {
      setIsDeleteDialogOpen(true);
    }
  }

  // Handler per confermare l'eliminazione
  async function handleDeleteConfirm() {
    if (!page) return;

    setError(null);
    setIsDeleteDialogOpen(false);

    startDeleteTransition(async () => {
      const result = await deletePageAction(page.slug);

      if (!result.success) {
        setError({
          message: result.error,
          type: result.errorType || "error",
        });
      } else {
        // Invalida la cache SWR per forzare il refetch
        mutate("/api/pages");
        mutate(`/api/pages/${page.slug}`);
        router.push("/admin/pages");
      }
    });
  }

  return (
    <div className={styles.metaPanel}>
      {/* Scrollable Metadata Section */}
      <div className={cn(styles.metaCard, "flex-1 overflow-y-auto min-h-0")}>
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
          <div className="relative">
            <input
              type="text"
              id={editing ? "newSlug" : "slug"}
              name={editing ? "newSlug" : "slug"}
              value={slugValue}
              onChange={(e) => setSlugValue(e.target.value)}
              className={styles.input}
              placeholder={
                editing ? page?.slug || "auto-generato se vuoto" : "auto-generato se vuoto"
              }
            />
            <button
              type="button"
              onClick={handleGenerateSlug}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-tertiary/10 transition-colors duration-150"
              title="Genera slug dal titolo"
            >
              <Sparkles className="w-4 h-4 text-secondary" />
            </button>
          </div>
        </div>
      </div>

      {/* Fixed Actions Section */}
      <div className={cn(styles.metaCard, "shrink-0")}>
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
          {editing && (
            <div className="flex justify-end w-full">
              <button
                type="button"
                onClick={handleDeleteClick}
                className={styles.deleteButton}
                disabled={isDeleting}
              >
                Elimina
              </button>
            </div>
          )}
        </div>

        {editing && page && error && (
          <div
            className={`mt-4 ${error.type === "warning" ? baseStyles.errorWarning : baseStyles.error}`}
          >
            ⚠️ {error.message}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {editing && page && (
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Elimina Pagina"
          message={`Sei sicuro di voler eliminare la pagina "${page.title || page.slug}"? Questa azione non può essere annullata.`}
          confirmText="Elimina"
          cancelText="Annulla"
          confirmButtonClassName={styles.deleteButton}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}
