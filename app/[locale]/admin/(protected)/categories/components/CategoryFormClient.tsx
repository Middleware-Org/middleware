/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  type ActionResult,
} from "../actions";
import ConfirmDialog from "@/components/molecules/confirmDialog";
import styles from "../styles";
import baseStyles from "../../styles";
import type { Category } from "@/lib/github/types";
import { useCategory } from "@/hooks/swr";
import { mutate } from "swr";

/* **************************************************
 * Types
 **************************************************/
interface CategoryFormClientProps {
  categorySlug?: string; // Slug per edit mode
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
 * Submit Button Component
 **************************************************/
function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={styles.submitButton}>
      {pending ? "Salvataggio..." : editing ? "Aggiorna" : "Crea"}
    </button>
  );
}

/* **************************************************
 * Category Form Client Component
 **************************************************/
export default function CategoryFormClient({ categorySlug }: CategoryFormClientProps) {
  const router = useRouter();
  const editing = !!categorySlug;

  // Usa SWR per ottenere la categoria (cache pre-popolata dal server)
  const { category } = useCategory(categorySlug || null);

  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState<ActionResult<Category> | null, FormData>(
    editing ? updateCategoryAction : createCategoryAction,
    null,
  );

  // State per il campo slug (per poterlo aggiornare dinamicamente)
  // Initialize with category slug if available
  const [slugValue, setSlugValue] = useState(category?.slug || "");
  const [deleteError, setDeleteError] = useState<{
    message: string;
    type: "error" | "warning";
  } | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Reset form and navigate on success
  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      // Invalida la cache SWR per forzare il refetch della lista
      mutate("/api/categories");
      if (editing && categorySlug) {
        mutate(`/api/categories/${categorySlug}`);
      }
      router.push("/admin/categories");
    }
  }, [state, router, editing, categorySlug]);

  // Handler per generare lo slug dal nome
  function handleGenerateSlug() {
    const nameInput = formRef.current?.querySelector('input[name="name"]') as HTMLInputElement;
    const name = nameInput?.value?.trim();

    if (name) {
      const generatedSlug = generateSlug(name);
      setSlugValue(generatedSlug);
    }
  }

  // Handler per aprire il dialog di conferma eliminazione
  function handleDeleteClick() {
    if (category) {
      setIsDeleteDialogOpen(true);
    }
  }

  // Handler per confermare l'eliminazione
  async function handleDeleteConfirm() {
    if (!categorySlug || !category) return;

    setDeleteError(null);
    setIsDeleteDialogOpen(false);

    startDeleteTransition(async () => {
      const result = await deleteCategoryAction(categorySlug);

      if (!result.success) {
        setDeleteError({
          message: result.error,
          type: result.errorType || "error",
        });
      } else {
        // Invalida la cache SWR per forzare il refetch
        mutate("/api/categories");
        mutate(`/api/categories/${categorySlug}`);
        router.push("/admin/categories");
      }
    });
  }

  return (
    <>
      {state && !state.success && (
        <div className={state.errorType === "warning" ? styles.errorWarning : styles.error}>
          {state.error}
        </div>
      )}

      {deleteError && (
        <div className={deleteError.type === "warning" ? styles.errorWarning : styles.error}>
          ⚠️ {deleteError.message}
        </div>
      )}

      {state?.success && state.message && (
        <div className={baseStyles.successMessageGreen}>{state.message}</div>
      )}

      <form ref={formRef} action={formAction} className={styles.form}>
        <h2 className={styles.formTitle}>{editing ? "Modifica Categoria" : "Nuova Categoria"}</h2>

        {editing && categorySlug && <input type="hidden" name="slug" value={categorySlug} />}

        <div className={styles.field}>
          <label htmlFor="name" className={styles.label}>
            Nome *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={category?.name || ""}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="description" className={styles.label}>
            Descrizione *
          </label>
          <textarea
            id="description"
            name="description"
            defaultValue={category?.description || ""}
            required
            className={styles.textarea}
            rows={3}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor={editing ? "newSlug" : "slug"} className={styles.label}>
            Slug
          </label>
          <div className="relative">
            <input
              id={editing ? "newSlug" : "slug"}
              name={editing ? "newSlug" : "slug"}
              type="text"
              value={slugValue}
              onChange={(e) => setSlugValue(e.target.value)}
              className={styles.input}
              placeholder={
                editing ? category?.slug || "auto-generato se vuoto" : "auto-generato se vuoto"
              }
            />
            <button
              type="button"
              onClick={handleGenerateSlug}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-tertiary/10 rounded transition-colors duration-150"
              title="Genera slug dal nome"
            >
              <Sparkles className="w-4 h-4 text-secondary" />
            </button>
          </div>
        </div>

        <div className={styles.formActions}>
          <SubmitButton editing={editing} />
          {editing && (
            <>
              <button
                type="button"
                onClick={() => router.push("/admin/categories")}
                className={styles.cancelButton}
              >
                Annulla
              </button>
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
            </>
          )}
        </div>
      </form>

      {/* Delete Confirmation Dialog */}
      {editing && category && (
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Elimina Categoria"
          message={`Sei sicuro di voler eliminare la categoria "${category.name}"? Questa azione non può essere annullata.`}
          confirmText="Elimina"
          cancelText="Annulla"
          confirmButtonClassName={styles.deleteButton}
          isLoading={isDeleting}
        />
      )}
    </>
  );
}
