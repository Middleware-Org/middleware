/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { mutate } from "swr";

import ConfirmDialog from "@/components/molecules/confirmDialog";
import { useUser } from "@/hooks/swr";
import { toast } from "@/hooks/use-toast";
import type { ActionResult } from "@/lib/actions/types";
import type { User } from "@/lib/github/users";
import { useLocalizedPath } from "@/lib/i18n/client";

import { createUserAction, updateUserAction, deleteUserAction } from "../actions";
import PasswordInput, { isPasswordStrongEnough } from "./PasswordInput";
import styles from "../styles";




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
  const toLocale = useLocalizedPath();
  const editing = !!userId;

  // Usa SWR per ottenere l'utente (cache pre-popolata dal server)
  const { user } = useUser(userId || null);

  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState<ActionResult<User> | null, FormData>(
    editing ? updateUserAction : createUserAction,
    null,
  );
  const handledStateRef = useRef<ActionResult<User> | null>(null);

  const [isDeleting, startDeleteTransition] = useTransition();
  const [, startSubmitTransition] = useTransition();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

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

    toast.success(state.message || (editing ? "Utente aggiornato" : "Utente creato"));
    formRef.current?.reset();
    // Invalida la cache SWR per forzare il refetch della lista
    mutate("/api/users");
    if (editing && userId) {
      mutate(`/api/users/${userId}`);
    }
    router.push(toLocale("/admin/users"));
  }, [state, router, editing, userId, toLocale]);

  // Validazione password prima del submit
  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordError(null);

    const formData = new FormData(e.currentTarget);
    const passwordValue = password; // Usa lo state invece del formData

    // Se siamo in modalità edit e la password è vuota, va bene - invia direttamente
    if (editing && (!passwordValue || passwordValue.trim().length === 0)) {
      formData.set("password", ""); // Assicurati che sia vuoto
      startSubmitTransition(() => {
        formAction(formData);
      });
      return;
    }

    // Se siamo in modalità create o la password è stata inserita, deve essere forte
    if (!editing || (passwordValue && passwordValue.trim().length > 0)) {
      if (!passwordValue || passwordValue.length < 8) {
        setPasswordError("La password deve essere di almeno 8 caratteri");
        return;
      }

      if (!isPasswordStrongEnough(passwordValue)) {
        setPasswordError("La password non è abbastanza sicura. Deve essere almeno 'Forte'");
        return;
      }
    }

    // Se la validazione passa, aggiungi la password al FormData e invia
    formData.set("password", passwordValue);
    startSubmitTransition(() => {
      formAction(formData);
    });
  }

  // Handler per aprire il dialog di conferma eliminazione
  function handleDeleteClick() {
    if (user) {
      setIsDeleteDialogOpen(true);
    }
  }

  // Handler per confermare l'eliminazione
  async function handleDeleteConfirm() {
    if (!userId || !user) return;

    setIsDeleteDialogOpen(false);

    startDeleteTransition(async () => {
      const result = await deleteUserAction(userId);

      if (!result.success) {
        toast.actionResult(result, { errorTitle: "Impossibile eliminare utente" });
      } else {
        toast.success(result.message || "Utente eliminato con successo");
        // Invalida la cache SWR per forzare il refetch
        mutate("/api/users");
        mutate(`/api/users/${userId}`);
        router.push(toLocale("/admin/users"));
      }
    });
  }

  return (
    <>
      <form ref={formRef} action={formAction} onSubmit={handleFormSubmit} className={styles.form}>
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
          <label htmlFor="role" className={styles.label}>
            Ruolo *
          </label>
          <select
            id="role"
            name="role"
            defaultValue={user?.role || "EDITOR"}
            className={styles.input}
            required
          >
            <option value="EDITOR">Editor</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="password" className={styles.label}>
            Password {editing ? "(lascia vuoto per non modificare)" : "*"}
          </label>
          <PasswordInput
            id="password"
            name="password-display"
            value={password}
            onChange={setPassword}
            required={!editing}
            placeholder={editing ? "Lascia vuoto per non modificare" : ""}
          />
          {passwordError && <div className={styles.passwordError}>{passwordError}</div>}
        </div>

        <div className={styles.formActions}>
          <SubmitButton editing={editing} />
          {editing && (
            <>
              <button
                type="button"
                onClick={() => router.push(toLocale("/admin/users"))}
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
