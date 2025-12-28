/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, useMemo, useEffect, Fragment } from "react";
import { Hash, Pencil, Trash2, X } from "lucide-react";
import { deletePageAction, deletePagesAction } from "../actions";
import { useTableState } from "@/hooks/useTableState";
import { useTableSelection } from "@/hooks/useTableSelection";
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
import { SearchInput } from "@/components/search";
import { Pagination } from "@/components/pagination";
import ConfirmDialog from "@/components/molecules/confirmDialog";
import { cn } from "@/lib/utils/classes";
import styles from "../styles";
import baseStyles from "../../styles";
import type { Page } from "@/lib/github/types";

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
export default function PageListClient({ initialPages }: PageListClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<{ message: string; type: "error" | "warning" } | null>(null);
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
    router.push(`/admin/pages/${page.slug}/edit`);
  }

  function handleDeleteClick(page: Page) {
    setDeleteDialog({ isOpen: true, page });
  }

  async function handleDeleteConfirm() {
    if (!deleteDialog.page) return;

    const { slug } = deleteDialog.page;
    setError(null);
    setDeleteDialog({ isOpen: false, page: null });

    startTransition(async () => {
      const result = await deletePageAction(slug);

      if (!result.success) {
        setError({
          message: result.error,
          type: result.errorType || "error",
        });
      } else {
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

    setError(null);
    setDeleteMultipleDialog({ isOpen: false, count: 0 });

    startTransition(async () => {
      const result = await deletePagesAction(selectedIds);

      if (!result.success) {
        setError({
          message: result.error,
          type: result.errorType || "error",
        });
      } else {
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
                aria-label="Modifica"
                title="Modifica"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteClick(page)}
                className={cn(styles.iconButton, styles.iconButtonDanger)}
                disabled={isPending}
                aria-label="Elimina"
                title="Elimina"
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

  return (
    <div className={baseStyles.container}>
      {error && (
        <div className={error.type === "warning" ? baseStyles.errorWarning : baseStyles.error}>
          ⚠️ {error.message}
        </div>
      )}

      {/* Search and Filters */}
      <div className={baseStyles.searchContainer}>
        <div className={baseStyles.searchRow}>
          <div className={baseStyles.searchInputWrapper}>
            <SearchInput value={search} onChange={setSearch} placeholder="Cerca per slug..." />
          </div>
          <ColumnSelector
            columns={columnConfig}
            visibleColumns={visibleColumns}
            onColumnsChange={setVisibleColumns}
          />
          <ItemsPerPageSelector value={itemsPerPage} onChange={setItemsPerPage} />
          <div
            className="flex items-center h-[34px] gap-1.5 px-2 py-1 border border-secondary"
            title={`${totalItems} ${totalItems === 1 ? "pagina" : "pagine"}`}
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
                  ariaLabel="Seleziona tutti"
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
                  Nessuna pagina trovata
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
            {selectedCount} {selectedCount === 1 ? "pagina selezionata" : "pagine selezionate"}
          </span>
          <button
            onClick={handleDeleteMultipleClick}
            disabled={isPending}
            className={cn(styles.iconButton, styles.iconButtonDanger, "ml-auto")}
            aria-label="Elimina selezionate"
            title="Elimina selezionate"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={clearSelection}
            disabled={isPending}
            className={cn(styles.iconButton)}
            aria-label="Deseleziona tutto"
            title="Deseleziona tutto"
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
          title="Elimina Pagina"
          message={`Sei sicuro di voler eliminare la pagina "${deleteDialog.page.title || deleteDialog.page.slug}"? Questa azione non può essere annullata.`}
          confirmText="Elimina"
          cancelText="Annulla"
          confirmButtonClassName={styles.deleteButton}
          isLoading={isPending}
        />
      )}

      {/* Delete Multiple Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteMultipleDialog.isOpen}
        onClose={() => setDeleteMultipleDialog({ isOpen: false, count: 0 })}
        onConfirm={handleDeleteMultipleConfirm}
        title="Elimina Pagine"
        message={`Sei sicuro di voler eliminare ${deleteMultipleDialog.count} pagin${deleteMultipleDialog.count === 1 ? "a" : "e"}? Questa azione non può essere annullata.`}
        confirmText="Elimina"
        cancelText="Annulla"
        confirmButtonClassName={styles.deleteButton}
        isLoading={isPending}
      />
    </div>
  );
}
