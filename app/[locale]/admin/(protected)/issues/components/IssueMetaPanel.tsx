/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, useCallback, useMemo } from "react";
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { deleteIssueAction } from "../actions";
import { SortableTableRow } from "@/components/table/SortableTableRow";
import { TableCell } from "@/components/table";
import ConfirmDialog from "@/components/molecules/confirmDialog";
import styles from "../styles";
import type { Issue } from "@/lib/github/types";
import type { Article } from "@/lib/github/types";
import { useArticles } from "@/hooks/swr";
import { mutate } from "swr";
import { toast } from "@/hooks/use-toast";
import { useLocalizedPath } from "@/lib/i18n/client";
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Types
 **************************************************/
interface IssueMetaPanelProps {
  issue: Issue;
  issueSlug: string;
  formRef: React.RefObject<HTMLFormElement | null>;
  formId: string;
  showOrder: boolean;
  onShowOrderChange: (value: boolean) => void;
}

/* **************************************************
 * IssueMetaPanel Component
 **************************************************/
export default function IssueMetaPanel({
  issue,
  issueSlug,
  formRef,
  formId,
  showOrder,
  onShowOrderChange,
}: IssueMetaPanelProps) {
  const router = useRouter();
  const toLocale = useLocalizedPath();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [localOrder, setLocalOrder] = useState<string[] | null>(null);

  const { articles = [] } = useArticles();

  // Build the ordered article list for this issue
  const issueArticles = useMemo(
    () => articles.filter((a) => a.issueId === issue.id),
    [articles, issue.id],
  );
  const orderedIdsKey =
    issue.articlesOrder && issue.articlesOrder.length > 0 ? issue.articlesOrder.join("|") : "";
  const orderedIds = useMemo(
    () => (orderedIdsKey ? orderedIdsKey.split("|") : []),
    [orderedIdsKey],
  );

  const canonicalOrder = useMemo(() => {
    const inOrder = orderedIds.filter((id) => issueArticles.some((a) => a.id === id));
    const unordered = issueArticles.filter((a) => !orderedIds.includes(a.id)).map((a) => a.id);
    return [...inOrder, ...unordered];
  }, [orderedIds, issueArticles]);

  const effectiveOrder = useMemo(() => localOrder ?? canonicalOrder, [localOrder, canonicalOrder]);

  const articleMap = useMemo(
    () => new Map<string, Article>(issueArticles.map((a) => [a.id, a])),
    [issueArticles],
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = effectiveOrder.indexOf(active.id as string);
      const newIndex = effectiveOrder.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1) return;

      const newOrder = arrayMove(effectiveOrder, oldIndex, newIndex);
      setLocalOrder(newOrder);
    },
    [effectiveOrder],
  );

  function handleDeleteClick() {
    setIsDeleteDialogOpen(true);
  }

  async function handleDeleteConfirm() {
    setIsDeleteDialogOpen(false);

    startDeleteTransition(async () => {
      const result = await deleteIssueAction(issueSlug);

      if (!result.success) {
        toast.actionResult(result, { errorTitle: "Impossibile eliminare issue" });
      } else {
        toast.success(result.message || "Issue eliminata con successo");
        mutate("/api/issues");
        mutate(`/api/issues/${issueSlug}`);
        mutate("/api/github/merge/check");
        router.push(toLocale("/admin/issues"));
      }
    });
  }

  return (
    <div className={styles.metaPanel}>
      <input
        type="hidden"
        name="articlesOrder"
        form={formId}
        value={JSON.stringify(effectiveOrder)}
        readOnly
      />
      {/* Settings Card */}
      <div className={styles.metaCard}>
        <h3 className={styles.metaCardTitle}>Impostazioni</h3>
        <div className={styles.field}>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOrder}
              onChange={(e) => onShowOrderChange(e.target.checked)}
              className={styles.checkbox}
            />
            <span className={styles.label}>Mostra numerazione articoli</span>
          </label>
        </div>
      </div>

      {/* Articles Order Card */}
      <div className={cn(styles.metaCard, "flex-1 overflow-y-auto min-h-0")}>
        <h3 className={styles.metaCardTitle}>Articoli ({effectiveOrder.length})</h3>
        {effectiveOrder.length === 0 ? (
          <p className="text-sm text-secondary/60">
            Nessun articolo in questa issue. Assegna articoli dalla loro pagina di modifica.
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={effectiveOrder} strategy={verticalListSortingStrategy}>
              <div className="space-y-0">
                <table className="w-full">
                  <tbody>
                    {effectiveOrder.map((id) => {
                      const article = articleMap.get(id);
                      if (!article) return null;
                      return (
                        <SortableTableRow key={id} id={id} className="border-b border-secondary/20">
                          <TableCell className="py-2 text-sm truncate max-w-[180px] border-b border-secondary/20">
                            {article.title}
                          </TableCell>
                        </SortableTableRow>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Actions Card */}
      <div className={cn(styles.metaCard, "shrink-0")}>
        <h3 className={styles.metaCardTitle}>Azioni</h3>
        <div className={styles.formActions}>
          <button
            type="button"
            onClick={() => formRef.current?.requestSubmit()}
            className={styles.submitButton}
          >
            Aggiorna
          </button>
          <button
            type="button"
            onClick={() => router.push(toLocale("/admin/issues"))}
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
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Elimina Issue"
        message={`Sei sicuro di voler eliminare l'issue "${issue.title}"? Questa azione non può essere annullata.`}
        confirmText="Elimina"
        cancelText="Annulla"
        confirmButtonClassName={styles.deleteButton}
        isLoading={isDeleting}
      />
    </div>
  );
}
