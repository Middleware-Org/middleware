/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteAuthorAction } from "../actions";
import styles from "../styles";
import { useAuthor } from "@/hooks/swr";
import { mutate } from "swr";
import { toast } from "@/hooks/use-toast";
import { useLocalizedPath } from "@/lib/i18n/client";

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

  // Usa SWR per ottenere l'autore (cache pre-popolata dal server)
  const { author } = useAuthor(authorSlug);

  async function handleDelete() {
    if (!author) return;

    if (!confirm(`Sei sicuro di voler eliminare l'autore "${author.name}"?`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteAuthorAction(authorSlug);

      if (!result.success) {
        toast.actionResult(result, { errorTitle: "Impossibile eliminare autore" });
      } else {
        toast.success(result.message || "Autore eliminato con successo");
        // Invalida la cache SWR per forzare il refetch
        mutate("/api/authors");
        mutate(`/api/authors/${authorSlug}`);
        router.push(toLocale("/admin/authors"));
      }
    });
  }

  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold mb-4 text-red-700">Zona Pericolosa</h3>
      <button onClick={handleDelete} className={styles.deleteButton} disabled={isPending}>
        {isPending ? "Eliminazione..." : "Elimina Autore"}
      </button>
    </div>
  );
}
