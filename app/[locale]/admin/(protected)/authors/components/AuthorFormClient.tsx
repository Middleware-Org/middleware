/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useEffect, useRef } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { createAuthorAction, updateAuthorAction, type ActionResult } from "../actions";
import styles from "../styles";
import baseStyles from "../../styles";
import type { Author } from "@/lib/github/types";
import { useAuthor } from "@/hooks/swr";

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
  const editing = !!authorSlug;
  
  // Usa SWR per ottenere l'autore (cache pre-popolata dal server)
  const { author } = useAuthor(authorSlug || null);
  
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState<ActionResult<Author> | null, FormData>(
    editing ? updateAuthorAction : createAuthorAction,
    null,
  );

  // Reset form and navigate on success
  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      router.push("/admin/authors");
      router.refresh();
    }
  }, [state, router]);

  return (
    <>
      {state && !state.success && (
        <div className={state.errorType === "warning" ? styles.errorWarning : styles.error}>
          {state.error}
        </div>
      )}

      {state?.success && state.message && (
        <div className={baseStyles.successMessageGreen}>{state.message}</div>
      )}

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

        {!editing && (
          <div className={styles.field}>
            <label htmlFor="slug" className={styles.label}>
              Slug (opzionale)
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              className={styles.input}
              placeholder="auto-generato se vuoto"
            />
          </div>
        )}

        <div className={styles.formActions}>
          <SubmitButton editing={editing} />
          {editing && (
            <button
              type="button"
              onClick={() => router.push("/admin/authors")}
              className={styles.cancelButton}
            >
              Annulla
            </button>
          )}
        </div>
      </form>
    </>
  );
}

