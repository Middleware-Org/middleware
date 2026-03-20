/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { mutate } from "swr";

import ConfirmDialog from "@/components/molecules/confirmDialog";
import { useAuthor } from "@/hooks/swr";
import { toast } from "@/hooks/use-toast";
import { useLocalizedPath } from "@/lib/i18n/client";

import { adminFormCopy } from "../../components/adminFormCopy";
import { deleteAuthorAction } from "../actions";
import styles from "../styles";

/* **************************************************
 * Types
 **************************************************/
interface AuthorDeleteButtonProps {
  authorSlug: string;
}

/* **************************************************
 * Author Delete Button Component
 **************************************************/
export default function AuthorDeleteButton({ authorSlug }: AuthorDeleteButtonProps) {
  const router = useRouter();
  const toLocale = useLocalizedPath();
  const [isPending, startTransition] = useTransition();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Usa SWR per ottenere l'autore (cache pre-popolata dal server)
  const { author } = useAuthor(authorSlug);

  async function handleDelete() {
    if (!author) return;

    setIsConfirmOpen(false);

    startTransition(async () => {
      const result = await deleteAuthorAction(authorSlug);

      if (!result.success) {
        toast.actionResult(result, { errorTitle: adminFormCopy.deleteButtons.deleteAuthorError });
      } else {
        toast.success(result.message || adminFormCopy.deleteButtons.deleteAuthorSuccess);
        // Invalida la cache SWR per forzare il refetch
        mutate("/api/authors");
        mutate(`/api/authors/${authorSlug}`);
        router.push(toLocale("/admin/authors"));
      }
    });
  }

  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold mb-4 text-red-700">
        {adminFormCopy.deleteButtons.dangerZone}
      </h3>
      <button
        onClick={() => setIsConfirmOpen(true)}
        className={styles.deleteButton}
        disabled={isPending}
      >
        {isPending
          ? adminFormCopy.deleteButtons.deleting
          : adminFormCopy.deleteButtons.deleteAuthor}
      </button>

      {author && (
        <ConfirmDialog
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleDelete}
          title={adminFormCopy.deleteButtons.deleteAuthor}
          message={adminFormCopy.deleteButtons.confirmDeleteAuthor(author.name)}
          confirmText={adminFormCopy.common.delete}
          cancelText={adminFormCopy.common.cancel}
          confirmButtonClassName={styles.deleteButton}
          isLoading={isPending}
        />
      )}
    </div>
  );
}
