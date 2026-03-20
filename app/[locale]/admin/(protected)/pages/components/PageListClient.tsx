/* **************************************************
 * Imports
 **************************************************/
"use client";

import { Hash, Pencil, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition, useMemo, useEffect, Fragment } from "react";
import { mutate } from "swr";

import ConfirmDialog from "@/components/molecules/confirmDialog";
import { Pagination } from "@/components/pagination";
import { SearchInput } from "@/components/search";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  SortableHeader,
  ColumnSelector,
  ItemsPerPageSelector,
  type ColumnConfig,
} from "@/components/table";
import { TableCheckbox } from "@/components/table/TableCheckbox";
import { usePages } from "@/hooks/swr";
import { toast } from "@/hooks/use-toast";
import { useTableSelection } from "@/hooks/useTableSelection";
import { useTableState } from "@/hooks/useTableState";
import type { Page } from "@/lib/github/types";
import { useLocalizedPath } from "@/lib/i18n/client";
import { cn } from "@/lib/utils/classes";

import { adminListCopy } from "../../components/adminListCopy";
import baseStyles from "../../styles";
import { deletePageAction, deletePagesAction } from "../actions";
import styles from "../styles";

/* **************************************************
 * Column Configuration
 **************************************************/
const columnConfig: ColumnConfig[] = [
  { key: "slug", label: "Slug", defaultVisible: true },
  { key: "preview", label: "Anteprima", defaultVisible: true },
  { key: "actions", label: "Azioni", defaultVisible: true },
];

/* **************************************************
 * Page List Client Component
 **************************************************/
export default function PageListClient() {
  const router = useRouter();
  const toLocale = useLocalizedPath();
  const [isPending, startTransition] = useTransition();
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; page: Page | null }>({
    isOpen: false,
    page: null,
  });
  const [deleteMultipleDialog, setDeleteMultipleDialog] = useState<{
    isOpen: boolean;
    count: number;
  }>({
    isOpen: false,
    count: 0,
  });

  // Usa SWR per ottenere le pagine (cache pre-popolata dal server)
  const { pages = [], isLoading } = usePages();

  // Initialize visible columns from defaultVisible
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() =>
    columnConfig.filter((col) => col.defaultVisible !== false).map((col) => col.key),
  );

  const {
    data: tableData,
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
  } = useTableState<Page>({
    data: pages,
    searchKeys: ["slug"],
    itemsPerPage: 10,
    initialSort: { key: "slug", direction: "asc" },
  });

  // Multi-selection
  const {
    selectedIds,
    isAllSelected,
    isIndeterminate,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    isSelected,
    selectedCount,
  } = useTableSelection(tableData, (page) => page.slug);

  // Get visible column configs
  const visibleColumnConfigs = useMemo(() => {
    return columnConfig.filter((col) => visibleColumns.includes(col.key));
  }, [visibleColumns]);

  // Clear selection when search or page changes
  useEffect(() => {
    clearSelection();
  }, [search, currentPage, clearSelection]);

  function handleEdit(page: Page) {
    router.push(toLocale(`/admin/pages/${page.slug}/edit`));
  }

  function handleDeleteClick(page: Page) {
    setDeleteDialog({ isOpen: true, page });
  }

  async function handleDeleteConfirm() {
    if (!deleteDialog.page) return;

    const { slug } = deleteDialog.page;
    setDeleteDialog({ isOpen: false, page: null });

    startTransition(async () => {
      const result = await deletePageAction(slug);

      if (!result.success) {
        toast.actionResult(result, { errorTitle: adminListCopy.pages.deleteErrorTitle });
      } else {
        toast.success(result.message || adminListCopy.pages.deleteSuccess);
        // Invalida la cache SWR per forzare il refetch
        mutate("/api/pages");
        mutate(`/api/pages/${slug}`);
        mutate("/api/github/merge/check");
        clearSelection();
      }
    });
  }

  function handleDeleteMultipleClick() {
    if (selectedCount === 0) return;
    setDeleteMultipleDialog({ isOpen: true, count: selectedCount });
  }

  async function handleDeleteMultipleConfirm() {
    if (selectedIds.length === 0) return;

    setDeleteMultipleDialog({ isOpen: false, count: 0 });

    startTransition(async () => {
      const result = await deletePagesAction(selectedIds);

      if (!result.success) {
        toast.actionResult(result, { errorTitle: adminListCopy.pages.deleteManyErrorTitle });
      } else {
        toast.success(result.message || adminListCopy.pages.deleteManySuccess);
        // Invalida la cache SWR per forzare il refetch
        mutate("/api/pages");
        // Invalida anche le singole pagine
        selectedIds.forEach((slug) => {
          mutate(`/api/pages/${slug}`);
        });
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
            <div className={baseStyles.buttonGroup}>
              <button
                onClick={() => handleEdit(page)}
                className={styles.iconButton}
                disabled={isPending}
                aria-label={adminListCopy.common.edit}
                title={adminListCopy.common.edit}
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteClick(page)}
                className={cn(styles.iconButton, styles.iconButtonDanger)}
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

  // Mostra loading solo se non ci sono dati (prima richiesta)
  if (isLoading && pages.length === 0) {
    return (
      <div className={baseStyles.container}>
        <div className={baseStyles.loadingText}>{adminListCopy.pages.loading}</div>
      </div>
    );
  }

  return (
    <div className={baseStyles.container}>
      {/* Search and Filters */}
      <div className={baseStyles.searchContainer}>
        <div className={baseStyles.searchRow}>
          <div className={baseStyles.searchInputWrapper}>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder={adminListCopy.pages.searchPlaceholder}
            />
          </div>
          <ColumnSelector
            columns={columnConfig}
            visibleColumns={visibleColumns}
            onColumnsChange={setVisibleColumns}
          />
          <ItemsPerPageSelector value={itemsPerPage} onChange={setItemsPerPage} />
          <div
            className="flex items-center h-[34px] gap-1.5 px-2 py-1 border border-secondary"
            title={`${totalItems} ${totalItems === 1 ? adminListCopy.pages.singular : adminListCopy.pages.plural}`}
          >
            <Hash className="h-4 w-4 text-secondary/60" />
            <span className="text-xs text-secondary/80">{totalItems}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={baseStyles.tableContainer}>
        <Table>
          <TableHeader>
            <TableRow>
              <th className={baseStyles.tableHeaderCell} style={{ width: "40px" }}>
                <TableCheckbox
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onChange={toggleSelectAll}
                  ariaLabel={adminListCopy.common.selectAll}
                />
              </th>
              {visibleColumnConfigs.map((column) => {
                if (column.key === "actions") {
                  return (
                    <th key={column.key} className={baseStyles.tableHeaderCell}>
                      {column.label}
                    </th>
                  );
                }
                return (
                  <SortableHeader
                    key={column.key}
                    sortKey={column.key}
                    currentSort={sort || undefined}
                    onSort={setSort}
                  >
                    {column.label}
                  </SortableHeader>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumnConfigs.length + 1}
                  className={baseStyles.tableEmptyCell}
                >
                  {adminListCopy.pages.empty}
                </TableCell>
              </TableRow>
            ) : (
              tableData.map((page) => (
                <TableRow key={page.slug}>
                  <TableCell>
                    <TableCheckbox
                      checked={isSelected(page.slug)}
                      onChange={() => toggleSelection(page.slug)}
                      disabled={isPending}
                      ariaLabel={`Seleziona ${page.title || page.slug}`}
                    />
                  </TableCell>
                  {visibleColumnConfigs.map((column) => (
                    <Fragment key={column.key}>{renderCell(page, column.key)}</Fragment>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
        )}
      </div>

      {/* Bulk Actions */}
      {selectedCount > 0 && (
        <div className="mt-4 flex items-center gap-2 p-3 bg-tertiary/10 border border-tertiary rounded">
          <span className="text-sm text-secondary">
            {selectedCount}{" "}
            {selectedCount === 1
              ? adminListCopy.pages.selectedSingular
              : adminListCopy.pages.selectedPlural}
          </span>
          <button
            onClick={handleDeleteMultipleClick}
            disabled={isPending}
            className={cn(styles.iconButton, styles.iconButtonDanger, "ml-auto")}
            aria-label={adminListCopy.common.deleteSelected}
            title={adminListCopy.common.deleteSelected}
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={clearSelection}
            disabled={isPending}
            className={cn(styles.iconButton)}
            aria-label={adminListCopy.common.deselectAll}
            title={adminListCopy.common.deselectAll}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialog.page && (
        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          onClose={() => setDeleteDialog({ isOpen: false, page: null })}
          onConfirm={handleDeleteConfirm}
          title={adminListCopy.pages.deleteDialogTitle}
          message={adminListCopy.pages.deleteDialogMessage(
            deleteDialog.page.title || deleteDialog.page.slug,
          )}
          confirmText={adminListCopy.common.delete}
          cancelText={adminListCopy.common.cancel}
          confirmButtonClassName={styles.deleteButton}
          isLoading={isPending}
        />
      )}

      {/* Delete Multiple Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteMultipleDialog.isOpen}
        onClose={() => setDeleteMultipleDialog({ isOpen: false, count: 0 })}
        onConfirm={handleDeleteMultipleConfirm}
        title={adminListCopy.pages.deleteManyDialogTitle}
        message={adminListCopy.pages.deleteManyDialogMessage(deleteMultipleDialog.count)}
        confirmText={adminListCopy.common.delete}
        cancelText={adminListCopy.common.cancel}
        confirmButtonClassName={styles.deleteButton}
        isLoading={isPending}
      />
    </div>
  );
}
