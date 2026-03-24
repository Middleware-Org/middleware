"use client";

/* **************************************************
 * Imports
 **************************************************/
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";

import { TableCell } from "@/components/table";
import { usePodcasts } from "@/hooks/swr";
import { toast } from "@/hooks/use-toast";
import type { Podcast } from "@/lib/github/types";
import { useLocalizedPath } from "@/lib/i18n/client";
import { cn } from "@/lib/utils/classes";

import { adminListCopy } from "../../components/adminListCopy";
import CrudListShell from "../../shared/CrudListShell";
import { entityCrudStyles } from "../../shared/entityCrudStyles";
import { useCrudList } from "../../shared/useCrudList";
import { deletePodcastAction, deletePodcastsAction } from "../actions";

/* **************************************************
 * Column Configuration
 **************************************************/
const columnConfig = [
  { key: "title", label: "Titolo", defaultVisible: true },
  { key: "slug", label: "Slug", defaultVisible: true },
  { key: "date", label: "Data", defaultVisible: true },
  { key: "published", label: "Pubblicato", defaultVisible: false },
  { key: "actions", label: "Azioni", defaultVisible: true },
] as const;

/* **************************************************
 * Podcast List Client Component
 **************************************************/
export default function PodcastListClient() {
  const router = useRouter();
  const toLocale = useLocalizedPath();
  const { podcasts = [], isLoading } = usePodcasts();

  const {
    isPending,
    startTransition,
    deleteDialog,
    deleteMultipleDialog,
    openDeleteDialog,
    closeDeleteDialog,
    openDeleteMultipleDialog,
    closeDeleteMultipleDialog,
    visibleColumns,
    setVisibleColumns,
    tableData,
    totalItems,
    totalPages,
    currentPage,
    itemsPerPage,
    search,
    sort,
    setSearch,
    setSort,
    setPage,
    setItemsPerPage,
    selectedIds,
    isAllSelected,
    isIndeterminate,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    isSelected,
    selectedCount,
  } = useCrudList({
    data: podcasts,
    columnConfig: [...columnConfig],
    searchKeys: ["title", "slug", "description"],
    getItemId: (podcast) => podcast.slug,
    tableStateOptions: { initialSort: { key: "date", direction: "desc" } },
  });

  async function handleDeleteConfirm() {
    if (!deleteDialog.item) return;
    const { slug } = deleteDialog.item;
    closeDeleteDialog();
    startTransition(async () => {
      const result = await deletePodcastAction(slug);
      if (!result.success) {
        toast.actionResult(result, { errorTitle: copy.deleteErrorTitle });
      } else {
        toast.success(result.message || copy.deleteSuccess);
        mutate("/api/podcasts");
        mutate("/api/github/merge/check");
        clearSelection();
      }
    });
  }

  async function handleDeleteMultipleConfirm() {
    if (selectedIds.length === 0) return;
    closeDeleteMultipleDialog();
    startTransition(async () => {
      const result = await deletePodcastsAction(selectedIds);
      if (!result.success) {
        toast.actionResult(result, { errorTitle: copy.deleteManyErrorTitle });
      } else {
        toast.success(result.message || copy.deleteManySuccess);
        mutate("/api/podcasts");
        mutate("/api/github/merge/check");
        clearSelection();
      }
    });
  }

  function renderCell(podcast: Podcast, columnKey: string) {
    switch (columnKey) {
      case "title":
        return <TableCell className="font-medium">{podcast.title}</TableCell>;
      case "slug":
        return (
          <TableCell>
            <span className="text-xs text-secondary/60 font-mono bg-secondary/10 px-2 py-1">
              {podcast.slug}
            </span>
          </TableCell>
        );
      case "date":
        return <TableCell>{new Date(podcast.date).toLocaleDateString("it-IT")}</TableCell>;
      case "published":
        return (
          <TableCell>
            {podcast.published ? (
              <span className="px-2 py-1 text-xs bg-green-100 text-green-700">{copy.yes}</span>
            ) : (
              <span className="px-2 py-1 text-xs bg-secondary/10 text-secondary/60">{copy.no}</span>
            )}
          </TableCell>
        );
      case "actions":
        return (
          <TableCell>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(toLocale(`/admin/podcasts/${podcast.slug}/edit`))}
                className={entityCrudStyles.iconButton}
                disabled={isPending}
                aria-label={adminListCopy.common.edit}
                title={adminListCopy.common.edit}
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => openDeleteDialog(podcast)}
                className={cn(entityCrudStyles.iconButton, entityCrudStyles.iconButtonDanger)}
                disabled={isPending}
                aria-label={adminListCopy.common.delete}
                title={adminListCopy.common.delete}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </TableCell>
        );
      default:
        return null;
    }
  }

  const copy = adminListCopy.podcasts;

  return (
    <CrudListShell<Podcast>
      isLoading={isLoading}
      loadingText={copy.loading}
      isPending={isPending}
      data={tableData}
      emptyText={copy.empty}
      getItemKey={(p) => p.slug}
      getItemLabel={(p) => p.title}
      renderCell={renderCell}
      columnConfig={[...columnConfig]}
      visibleColumns={visibleColumns}
      onColumnsChange={setVisibleColumns}
      sort={sort}
      onSort={setSort}
      itemsPerPage={itemsPerPage}
      onItemsPerPageChange={setItemsPerPage}
      totalPages={totalPages}
      currentPage={currentPage}
      onPageChange={setPage}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder={adminListCopy.common.searchPodcastPlaceholder}
      totalItems={totalItems}
      countTitle={`${totalItems} ${totalItems === 1 ? copy.singular : copy.plural}`}
      isAllSelected={isAllSelected}
      isIndeterminate={isIndeterminate}
      onToggleSelectAll={toggleSelectAll}
      isSelected={isSelected}
      onToggleSelection={toggleSelection}
      selectedCount={selectedCount}
      selectedLabel={selectedCount === 1 ? copy.selectedSingular : copy.selectedPlural}
      onDeleteMultiple={() => openDeleteMultipleDialog(selectedCount)}
      onClearSelection={clearSelection}
      deleteDialog={{
        isOpen: deleteDialog.isOpen,
        title: copy.deleteDialogTitle,
        message: copy.deleteDialogMessage(deleteDialog.item?.title ?? ""),
        confirmText: copy.deleteDialogConfirm,
        onConfirm: handleDeleteConfirm,
        onClose: closeDeleteDialog,
      }}
      deleteMultipleDialog={{
        isOpen: deleteMultipleDialog.isOpen,
        title: copy.deleteManyDialogTitle,
        message: copy.deleteManyDialogMessage(deleteMultipleDialog.count),
        confirmText: copy.deleteDialogConfirm,
        onConfirm: handleDeleteMultipleConfirm,
        onClose: closeDeleteMultipleDialog,
      }}
      cancelText={adminListCopy.common.cancel}
    />
  );
}
