/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { mutate } from "swr";

import ConfirmDialog from "@/components/molecules/confirmDialog";
import { useIssue } from "@/hooks/swr";
import { toast } from "@/hooks/use-toast";
import { useLocalizedPath } from "@/lib/i18n/client";

import { adminFormCopy } from "../../components/adminFormCopy";
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
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Usa SWR per ottenere l'issue (cache pre-popolata dal server)
  const { issue } = useIssue(issueSlug);

  async function handleDelete() {
    if (!issue) return;

    setIsConfirmOpen(false);

    startTransition(async () => {
      const result = await deleteIssueAction(issueSlug);

      if (!result.success) {
        toast.actionResult(result, { errorTitle: adminFormCopy.deleteButtons.deleteIssueError });
      } else {
        toast.success(result.message || adminFormCopy.deleteButtons.deleteIssueSuccess);
        // Invalida la cache SWR per forzare il refetch
        mutate("/api/issues");
        mutate(`/api/issues/${issueSlug}`);
        router.push(toLocale("/admin/issues"));
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
        {isPending ? adminFormCopy.deleteButtons.deleting : adminFormCopy.deleteButtons.deleteIssue}
      </button>

      {issue && (
        <ConfirmDialog
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleDelete}
          title={adminFormCopy.deleteButtons.deleteIssue}
          message={adminFormCopy.deleteButtons.confirmDeleteIssue(issue.title)}
          confirmText={adminFormCopy.common.delete}
          cancelText={adminFormCopy.common.cancel}
          confirmButtonClassName={styles.deleteButton}
          isLoading={isPending}
        />
      )}
    </div>
  );
}
