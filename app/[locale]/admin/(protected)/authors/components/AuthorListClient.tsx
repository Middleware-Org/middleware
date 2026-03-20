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
import { useAuthors } from "@/hooks/swr";
import { toast } from "@/hooks/use-toast";
import { useTableSelection } from "@/hooks/useTableSelection";
import { useTableState } from "@/hooks/useTableState";
import type { Author } from "@/lib/github/types";
import { useLocalizedPath } from "@/lib/i18n/client";
import { cn } from "@/lib/utils/classes";

import { adminListCopy } from "../../components/adminListCopy";
import baseStyles from "../../styles";
import { deleteAuthorAction, deleteAuthorsAction } from "../actions";
import styles from "../styles";

/* **************************************************
 * Column Configuration
 **************************************************/
const columnConfig: ColumnConfig[] = [
  { key: "name", label: "Nome", defaultVisible: true },
  { key: "slug", label: "Slug", defaultVisible: true },
  { key: "description", label: "Descrizione", defaultVisible: true },
  { key: "actions", label: "Azioni", defaultVisible: true },
];

/* **************************************************
 * Author List Client Component
 **************************************************/
export default function AuthorListClient() {
  const router = useRouter();
  const toLocale = useLocalizedPath();
  const [isPending, startTransition] = useTransition();
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; author: Author | null }>({
    isOpen: false,
    author: null,
  });
  const [deleteMultipleDialog, setDeleteMultipleDialog] = useState<{
    isOpen: boolean;
    count: number;
  }>({
    isOpen: false,
    count: 0,
  });

  // Usa SWR per ottenere gli autori (cache pre-popolata dal server)
  const { authors = [], isLoading } = useAuthors();
  const [localAuthors, setLocalAuthors] = useState<Author[]>(authors);

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
  } = useTableState<Author>({
    data: localAuthors,
    searchKeys: ["name", "slug", "description"],
    itemsPerPage: 10,
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
  } = useTableSelection(tableData, (author) => author.slug);

  // Get visible column configs
  const visibleColumnConfigs = useMemo(() => {
    return columnConfig.filter((col) => visibleColumns.includes(col.key));
  }, [visibleColumns]);

  // Sync local authors with SWR data when they change
  useEffect(() => {
    setLocalAuthors(authors);
  }, [authors]);

  // Clear selection when search or page changes
  useEffect(() => {
    clearSelection();
  }, [search, currentPage, clearSelection]);

  function handleEdit(author: Author) {
    router.push(toLocale(`/admin/authors/${author.slug}/edit`));
  }

  function handleDeleteClick(author: Author) {
    setDeleteDialog({ isOpen: true, author });
  }

  async function handleDeleteConfirm() {
    if (!deleteDialog.author) return;

    const { slug } = deleteDialog.author;
    setDeleteDialog({ isOpen: false, author: null });

    startTransition(async () => {
      const result = await deleteAuthorAction(slug);

      if (!result.success) {
        toast.actionResult(result, { errorTitle: adminListCopy.authors.deleteErrorTitle });
      } else {
        toast.success(result.message || adminListCopy.authors.deleteSuccess);
        // Invalida la cache SWR per forzare il refetch
        mutate("/api/authors");
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
      const result = await deleteAuthorsAction(selectedIds);

      if (!result.success) {
        toast.actionResult(result, { errorTitle: adminListCopy.authors.deleteManyErrorTitle });
      } else {
        toast.success(result.message || adminListCopy.authors.deleteManySuccess);
        // Invalida la cache SWR per forzare il refetch
        mutate("/api/authors");
        mutate("/api/github/merge/check");
        clearSelection();
      }
    });
  }

  function renderCell(author: Author, columnKey: string) {
    switch (columnKey) {
      case "name":
        return <TableCell className="font-medium">{author.name}</TableCell>;
      case "slug":
        return (
          <TableCell>
            <span className="text-xs text-secondary/60 font-mono bg-secondary/10 px-2 py-1">
              {author.slug}
            </span>
          </TableCell>
        );
      case "description":
        return <TableCell className="text-secondary/80">{author.description}</TableCell>;
      case "actions":
        return (
          <TableCell>
            <div className={baseStyles.buttonGroup}>
              <button
                onClick={() => handleEdit(author)}
                className={styles.iconButton}
                disabled={isPending}
                aria-label={adminListCopy.common.edit}
                title={adminListCopy.common.edit}
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteClick(author)}
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
  if (isLoading && authors.length === 0) {
    return (
      <div className={baseStyles.container}>
        <div className={baseStyles.loadingText}>{adminListCopy.authors.loading}</div>
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
              placeholder={adminListCopy.common.searchAuthorPlaceholder}
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
            title={`${totalItems} ${totalItems === 1 ? adminListCopy.authors.singular : adminListCopy.authors.plural}`}
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
                  {adminListCopy.authors.empty}
                </TableCell>
              </TableRow>
            ) : (
              tableData.map((author) => (
                <TableRow key={author.slug}>
                  <TableCell>
                    <TableCheckbox
                      checked={isSelected(author.slug)}
                      onChange={() => toggleSelection(author.slug)}
                      disabled={isPending}
                      ariaLabel={`Seleziona ${author.name}`}
                    />
                  </TableCell>
                  {visibleColumnConfigs.map((column) => (
                    <Fragment key={column.key}>{renderCell(author, column.key)}</Fragment>
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
              ? adminListCopy.authors.selectedSingular
              : adminListCopy.authors.selectedPlural}
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
      {deleteDialog.author && (
        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          onClose={() => setDeleteDialog({ isOpen: false, author: null })}
          onConfirm={handleDeleteConfirm}
          title={adminListCopy.authors.deleteDialogTitle}
          message={adminListCopy.authors.deleteDialogMessage(deleteDialog.author.name)}
          confirmText={adminListCopy.authors.deleteDialogConfirm}
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
        title={adminListCopy.authors.deleteManyDialogTitle}
        message={adminListCopy.authors.deleteManyDialogMessage(deleteMultipleDialog.count)}
        confirmText={adminListCopy.authors.deleteDialogConfirm}
        cancelText={adminListCopy.common.cancel}
        confirmButtonClassName={styles.deleteButton}
        isLoading={isPending}
      />
    </div>
  );
}
