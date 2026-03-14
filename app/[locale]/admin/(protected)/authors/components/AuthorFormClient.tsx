/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import type { ActionResult } from "@/lib/actions/types";
import { createAuthorAction, updateAuthorAction, deleteAuthorAction } from "../actions";
import ConfirmDialog from "@/components/molecules/confirmDialog";
import styles from "../styles";
import type { Author } from "@/lib/github/types";
import { useAuthor } from "@/hooks/swr";
import { mutate } from "swr";
import { toast } from "@/hooks/use-toast";
import { useLocalizedPath } from "@/lib/i18n/client";
import { generateSlug } from "@/lib/utils/slug";

/* **************************************************
 * Types
 **************************************************/
interface AuthorFormClientProps {
  authorSlug?: string; // Slug per edit mode
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
 * Author Form Client Component
 **************************************************/
export default function AuthorFormClient({ authorSlug }: AuthorFormClientProps) {
  const router = useRouter();
  const toLocale = useLocalizedPath();
  const editing = !!authorSlug;

  // Usa SWR per ottenere l'autore (cache pre-popolata dal server)
  const { author } = useAuthor(authorSlug || null);

  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState<ActionResult<Author> | null, FormData>(
    editing ? updateAuthorAction : createAuthorAction,
    null,
  );
  const handledStateRef = useRef<ActionResult<Author> | null>(null);

  // State per il campo slug (per poterlo aggiornare dinamicamente)
  const [slugValue, setSlugValue] = useState(author?.slug || "");
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Reset form and navigate on success
  useEffect(() => {
    if (!state) {
      return;
    }
    if (handledStateRef.current === state) {
      return;
    }
    handledStateRef.current = state;

    if (!state.success) {
      toast.actionResult(state, { errorTitle: "Operazione non riuscita" });
      return;
    }

    toast.success(state.message || (editing ? "Autore aggiornato" : "Autore creato"));
    formRef.current?.reset();
    mutate("/api/authors");
    if (editing && authorSlug) {
      mutate(`/api/authors/${authorSlug}`);
    }
    mutate("/api/github/merge/check");
    router.push(toLocale("/admin/authors"));
  }, [state, router, editing, authorSlug, toLocale]);

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
    if (author) {
      setIsDeleteDialogOpen(true);
    }
  }

  // Handler per confermare l'eliminazione
  async function handleDeleteConfirm() {
    if (!authorSlug || !author) return;

    setIsDeleteDialogOpen(false);

    startDeleteTransition(async () => {
      const result = await deleteAuthorAction(authorSlug);

      if (!result.success) {
        toast.actionResult(result, { errorTitle: "Impossibile eliminare autore" });
      } else {
        toast.success(result.message || "Autore eliminato con successo");
        // Invalida la cache SWR per forzare il refetch
        mutate("/api/authors");
        mutate(`/api/authors/${authorSlug}`);
        mutate("/api/github/merge/check");
        router.push(toLocale("/admin/authors"));
      }
    });
  }

  return (
    <>
      <form ref={formRef} action={formAction} className={styles.form}>
        <h2 className={styles.formTitle}>{editing ? "Modifica Autore" : "Nuovo Autore"}</h2>

        {editing && authorSlug && <input type="hidden" name="slug" value={authorSlug} />}

        <div className={styles.field}>
          <label htmlFor="name" className={styles.label}>
            Nome *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={author?.name || ""}
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
            defaultValue={author?.description || ""}
            required
            className={styles.textarea}
            rows={3}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor={editing ? "newSlug" : "slug"} className={styles.label}>
            Slug {editing ? "(modificabile)" : "(opzionale)"}
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
                editing ? author?.slug || "auto-generato se vuoto" : "auto-generato se vuoto"
              }
            />
            <button
              type="button"
              onClick={handleGenerateSlug}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-tertiary/10 transition-colors duration-150"
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
                onClick={() => router.push(toLocale("/admin/authors"))}
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
      {editing && author && (
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Elimina Autore"
          message={`Sei sicuro di voler eliminare l'autore "${author.name}"? Questa azione non può essere annullata.`}
          confirmText="Elimina"
          cancelText="Annulla"
          confirmButtonClassName={styles.deleteButton}
          isLoading={isDeleting}
        />
      )}
    </>
  );
}
