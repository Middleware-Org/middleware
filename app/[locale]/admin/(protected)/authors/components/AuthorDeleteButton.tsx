/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteAuthorAction } from "../actions";
import styles from "../styles";
import { useAuthor } from "@/hooks/swr";
import { mutate } from "swr";

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
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<{ message: string; type: "error" | "warning" } | null>(null);
  
  // Usa SWR per ottenere l'autore (cache pre-popolata dal server)
  const { author } = useAuthor(authorSlug);

  async function handleDelete() {
    if (!author) return;
    
    if (!confirm(`Sei sicuro di voler eliminare l'autore "${author.name}"?`)) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await deleteAuthorAction(authorSlug);

      if (!result.success) {
        setError({
          message: result.error,
          type: result.errorType || "error",
        });
      } else {
        // Invalida la cache SWR per forzare il refetch
        mutate("/api/authors");
        mutate(`/api/authors/${authorSlug}`);
        router.push("/admin/authors");
        router.refresh();
      }
    });
  }

  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold mb-4 text-red-700">Zona Pericolosa</h3>
      {error && (
        <div className={`mb-4 ${error.type === "warning" ? styles.errorWarning : styles.error}`}>
          ⚠️ {error.message}
        </div>
      )}
      <button
        onClick={handleDelete}
        className={styles.deleteButton}
        disabled={isPending}
      >
        {isPending ? "Eliminazione..." : "Elimina Autore"}
      </button>
    </div>
  );
}

