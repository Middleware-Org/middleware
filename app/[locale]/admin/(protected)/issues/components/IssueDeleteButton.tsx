/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteIssueAction } from "../actions";
import styles from "../styles";
import { useIssue } from "@/hooks/swr";
import { mutate } from "swr";

/* **************************************************
 * Types
 **************************************************/
interface IssueDeleteButtonProps {
  issueSlug: string;
}

/* **************************************************
 * Issue Delete Button Component
 **************************************************/
export default function IssueDeleteButton({ issueSlug }: IssueDeleteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<{ message: string; type: "error" | "warning" } | null>(null);
  
  // Usa SWR per ottenere l'issue (cache pre-popolata dal server)
  const { issue } = useIssue(issueSlug);

  async function handleDelete() {
    if (!issue) return;
    
    if (!confirm(`Sei sicuro di voler eliminare l'issue "${issue.title}"?`)) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await deleteIssueAction(issueSlug);

      if (!result.success) {
        setError({
          message: result.error,
          type: result.errorType || "error",
        });
      } else {
        // Invalida la cache SWR per forzare il refetch
        mutate("/api/issues");
        mutate(`/api/issues/${issueSlug}`);
        router.push("/admin/issues");
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
        {isPending ? "Eliminazione..." : "Elimina Issue"}
      </button>
    </div>
  );
}

