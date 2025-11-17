/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteIssueAction } from "../actions";
import styles from "../styles";
import type { Issue } from "@/lib/github/types";

/* **************************************************
 * Types
 **************************************************/
interface IssueDeleteButtonProps {
  issue: Issue;
}

/* **************************************************
 * Issue Delete Button Component
 **************************************************/
export default function IssueDeleteButton({ issue }: IssueDeleteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<{ message: string; type: "error" | "warning" } | null>(null);

  async function handleDelete() {
    if (!confirm(`Sei sicuro di voler eliminare l'issue "${issue.title}"?`)) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await deleteIssueAction(issue.slug);

      if (!result.success) {
        setError({
          message: result.error,
          type: result.errorType || "error",
        });
      } else {
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

