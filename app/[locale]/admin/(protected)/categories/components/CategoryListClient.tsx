"use client";

/* **************************************************
 * Imports
 **************************************************/
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";

import { TableCell } from "@/components/table";
import { useCategories } from "@/hooks/swr";
import { toast } from "@/hooks/use-toast";
import type { Category } from "@/lib/github/types";
import { useLocalizedPath } from "@/lib/i18n/client";
import { cn } from "@/lib/utils/classes";

import { adminListCopy } from "../../components/adminListCopy";
import CrudListShell from "../../shared/CrudListShell";
import { entityCrudStyles } from "../../shared/entityCrudStyles";
import { useCrudList } from "../../shared/useCrudList";
import { deleteCategoryAction, deleteCategoriesAction } from "../actions";

/* **************************************************
 * Column Configuration
 **************************************************/
const columnConfig = [
  { key: "name", label: "Nome", defaultVisible: true },
  { key: "slug", label: "Slug", defaultVisible: true },
  { key: "description", label: "Descrizione", defaultVisible: true },
  { key: "actions", label: "Azioni", defaultVisible: true },
] as const;

/* **************************************************
 * Category List Client Component
 **************************************************/
export default function CategoryListClient() {
  const router = useRouter();
  const toLocale = useLocalizedPath();
  const { categories = [], isLoading } = useCategories();

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
    data: categories,
    columnConfig: [...columnConfig],
    searchKeys: ["name", "slug", "description"],
    getItemId: (category) => category.slug,
  });

  async function handleDeleteConfirm() {
    if (!deleteDialog.item) return;
    const { slug } = deleteDialog.item;
    closeDeleteDialog();
    startTransition(async () => {
      const result = await deleteCategoryAction(slug);
      if (!result.success) {
        toast.actionResult(result, { errorTitle: copy.deleteErrorTitle });
      } else {
        toast.success(result.message || copy.deleteSuccess);
        mutate("/api/categories");
        mutate("/api/github/merge/check");
        clearSelection();
      }
    });
  }

  async function handleDeleteMultipleConfirm() {
    if (selectedIds.length === 0) return;
    closeDeleteMultipleDialog();
    startTransition(async () => {
      const result = await deleteCategoriesAction(selectedIds);
      if (!result.success) {
        toast.actionResult(result, { errorTitle: copy.deleteManyErrorTitle });
      } else {
        toast.success(result.message || copy.deleteManySuccess);
        mutate("/api/categories");
        mutate("/api/github/merge/check");
        clearSelection();
      }
    });
  }

  function renderCell(category: Category, columnKey: string) {
    switch (columnKey) {
      case "name":
        return <TableCell className="font-medium">{category.name}</TableCell>;
      case "slug":
        return (
          <TableCell>
            <span className="text-xs text-secondary/60 font-mono bg-secondary/10 px-2 py-1">
              {category.slug}
            </span>
          </TableCell>
        );
      case "description":
        return <TableCell className="text-secondary/80">{category.description}</TableCell>;
      case "actions":
        return (
          <TableCell>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(toLocale(`/admin/categories/${category.slug}/edit`))}
                className={entityCrudStyles.iconButton}
                disabled={isPending}
                aria-label={adminListCopy.common.edit}
                title={adminListCopy.common.edit}
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => openDeleteDialog(category)}
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

  const copy = adminListCopy.categories;

  return (
    <CrudListShell<Category>
      isLoading={isLoading}
      loadingText={copy.loading}
      isPending={isPending}
      data={tableData}
      emptyText={copy.empty}
      getItemKey={(c) => c.slug}
      getItemLabel={(c) => c.name}
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
      searchPlaceholder={adminListCopy.common.searchCategoryPlaceholder}
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
        message: copy.deleteDialogMessage(deleteDialog.item?.name ?? ""),
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
