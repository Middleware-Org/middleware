/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { mutate } from "swr";

import { useIssue } from "@/hooks/swr";
import { toast } from "@/hooks/use-toast";
import { useLocalizedPath } from "@/lib/i18n/client";

import { deleteIssueAction } from "../actions";
import styles from "../styles";

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
  const toLocale = useLocalizedPath();
  const [isPending, startTransition] = useTransition();

  // Usa SWR per ottenere l'issue (cache pre-popolata dal server)
  const { issue } = useIssue(issueSlug);

  async function handleDelete() {
    if (!issue) return;

    if (!confirm(`Sei sicuro di voler eliminare l'issue "${issue.title}"?`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteIssueAction(issueSlug);

      if (!result.success) {
        toast.actionResult(result, { errorTitle: "Impossibile eliminare issue" });
      } else {
        toast.success(result.message || "Issue eliminata con successo");
        // Invalida la cache SWR per forzare il refetch
        mutate("/api/issues");
        mutate(`/api/issues/${issueSlug}`);
        router.push(toLocale("/admin/issues"));
      }
    });
  }

  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold mb-4 text-red-700">Zona Pericolosa</h3>
      <button onClick={handleDelete} className={styles.deleteButton} disabled={isPending}>
        {isPending ? "Eliminazione..." : "Elimina Issue"}
      </button>
    </div>
  );
}
