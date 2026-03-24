"use client";

/* **************************************************
 * Imports
 **************************************************/
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";

import { TableCell } from "@/components/table";
import { usePages } from "@/hooks/swr";
import { toast } from "@/hooks/use-toast";
import type { Page } from "@/lib/github/types";
import { useLocalizedPath } from "@/lib/i18n/client";
import { cn } from "@/lib/utils/classes";

import { adminListCopy } from "../../components/adminListCopy";
import CrudListShell from "../../shared/CrudListShell";
import { entityCrudStyles } from "../../shared/entityCrudStyles";
import { useCrudList } from "../../shared/useCrudList";
import { deletePageAction, deletePagesAction } from "../actions";

/* **************************************************
 * Column Configuration
 **************************************************/
const columnConfig = [
  { key: "slug", label: "Slug", defaultVisible: true },
  { key: "preview", label: "Anteprima", defaultVisible: true },
  { key: "actions", label: "Azioni", defaultVisible: true },
] as const;

/* **************************************************
 * Page List Client Component
 **************************************************/
export default function PageListClient() {
  const router = useRouter();
  const toLocale = useLocalizedPath();
  const { pages = [], isLoading } = usePages();

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
    data: pages,
    columnConfig: [...columnConfig],
    searchKeys: ["slug"],
    getItemId: (page) => page.slug,
    tableStateOptions: { initialSort: { key: "slug", direction: "asc" } },
  });

  async function handleDeleteConfirm() {
    if (!deleteDialog.item) return;
    const { slug } = deleteDialog.item;
    closeDeleteDialog();
    startTransition(async () => {
      const result = await deletePageAction(slug);
      if (!result.success) {
        toast.actionResult(result, { errorTitle: copy.deleteErrorTitle });
      } else {
        toast.success(result.message || copy.deleteSuccess);
        mutate("/api/pages");
        mutate(`/api/pages/${slug}`);
        mutate("/api/github/merge/check");
        clearSelection();
      }
    });
  }

  async function handleDeleteMultipleConfirm() {
    if (selectedIds.length === 0) return;
    closeDeleteMultipleDialog();
    startTransition(async () => {
      const result = await deletePagesAction(selectedIds);
      if (!result.success) {
        toast.actionResult(result, { errorTitle: copy.deleteManyErrorTitle });
      } else {
        toast.success(result.message || copy.deleteManySuccess);
        mutate("/api/pages");
        selectedIds.forEach((slug) => mutate(`/api/pages/${slug}`));
        mutate("/api/github/merge/check");
        clearSelection();
      }
    });
  }

  function renderCell(page: Page, columnKey: string) {
    switch (columnKey) {
      case "slug":
        return (
          <TableCell>
            <span className="text-xs text-secondary/60 font-mono bg-secondary/10 px-2 py-1">
              {page.slug}
            </span>
          </TableCell>
        );
      case "preview":
        return (
          <TableCell className="max-w-md">
            <div className="font-medium text-secondary mb-1">{page.title}</div>
            <div className="text-sm text-secondary/80 line-clamp-2">
              {page.excerpt || page.content.substring(0, 100)}...
            </div>
          </TableCell>
        );
      case "actions":
        return (
          <TableCell>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(toLocale(`/admin/pages/${page.slug}/edit`))}
                className={entityCrudStyles.iconButton}
                disabled={isPending}
                aria-label={adminListCopy.common.edit}
                title={adminListCopy.common.edit}
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => openDeleteDialog(page)}
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

  const copy = adminListCopy.pages;

  return (
    <CrudListShell<Page>
      isLoading={isLoading}
      loadingText={copy.loading}
      isPending={isPending}
      data={tableData}
      emptyText={copy.empty}
      getItemKey={(p) => p.slug}
      getItemLabel={(p) => p.title || p.slug}
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
      searchPlaceholder={copy.searchPlaceholder}
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
        message: copy.deleteDialogMessage(
          deleteDialog.item?.title || deleteDialog.item?.slug || "",
        ),
        confirmText: adminListCopy.common.delete,
        onConfirm: handleDeleteConfirm,
        onClose: closeDeleteDialog,
      }}
      deleteMultipleDialog={{
        isOpen: deleteMultipleDialog.isOpen,
        title: copy.deleteManyDialogTitle,
        message: copy.deleteManyDialogMessage(deleteMultipleDialog.count),
        confirmText: adminListCopy.common.delete,
        onConfirm: handleDeleteMultipleConfirm,
        onClose: closeDeleteMultipleDialog,
      }}
      cancelText={adminListCopy.common.cancel}
    />
  );
}
