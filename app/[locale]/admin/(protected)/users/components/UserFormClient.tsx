/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import {
  createUserAction,
  updateUserAction,
  deleteUserAction,
  type ActionResult,
} from "../actions";
import ConfirmDialog from "@/components/molecules/confirmDialog";
import styles from "../styles";
import baseStyles from "../../styles";
import type { User } from "@/lib/github/users";
import { useUser } from "@/hooks/swr";
import { mutate } from "swr";

/* **************************************************
 * Types
 **************************************************/
interface UserFormClientProps {
  userId?: string; // ID per edit mode
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
 * User Form Client Component
 **************************************************/
export default function UserFormClient({ userId }: UserFormClientProps) {
  const router = useRouter();
  const editing = !!userId;

  // Usa SWR per ottenere l'utente (cache pre-popolata dal server)
  const { user } = useUser(userId || null);

  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState<ActionResult<User> | null, FormData>(
    editing ? updateUserAction : createUserAction,
    null,
  );

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
      mutate("/api/users");
      if (editing && userId) {
        mutate(`/api/users/${userId}`);
      }
      router.push("/admin/users");
    }
  }, [state, router, editing, userId]);

  // Handler per aprire il dialog di conferma eliminazione
  function handleDeleteClick() {
    if (user) {
      setIsDeleteDialogOpen(true);
    }
  }

  // Handler per confermare l'eliminazione
  async function handleDeleteConfirm() {
    if (!userId || !user) return;

    setDeleteError(null);
    setIsDeleteDialogOpen(false);

    startDeleteTransition(async () => {
      const result = await deleteUserAction(userId);

      if (!result.success) {
        setDeleteError({
          message: result.error,
          type: result.errorType || "error",
        });
      } else {
        // Invalida la cache SWR per forzare il refetch
        mutate("/api/users");
        mutate(`/api/users/${userId}`);
        router.push("/admin/users");
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
        <h2 className={styles.formTitle}>{editing ? "Modifica Utente" : "Nuovo Utente"}</h2>

        {editing && userId && <input type="hidden" name="id" value={userId} />}

        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={user?.email || ""}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="name" className={styles.label}>
            Nome
          </label>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={user?.name || ""}
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="password" className={styles.label}>
            Password {editing ? "(lascia vuoto per non modificare)" : "*"}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required={!editing}
            className={styles.input}
            placeholder={editing ? "Lascia vuoto per non modificare" : ""}
          />
        </div>

        <div className={styles.formActions}>
          <SubmitButton editing={editing} />
          {editing && (
            <>
              <button
                type="button"
                onClick={() => router.push("/admin/users")}
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
      {editing && user && (
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Elimina Utente"
          message={`Sei sicuro di voler eliminare l'utente "${user.email}"? Questa azione non può essere annullata.`}
          confirmText="Elimina"
          cancelText="Annulla"
          confirmButtonClassName={styles.deleteButton}
          isLoading={isDeleting}
        />
      )}
    </>
  );
}
