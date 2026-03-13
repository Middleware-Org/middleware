/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, useMemo, useEffect, Fragment } from "react";
import { Hash, Pencil, Trash2, X } from "lucide-react";
import { deleteCategoryAction, deleteCategoriesAction } from "../actions";
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
import type { Category } from "@/lib/github/types";
import { useCategories } from "@/hooks/swr";
import { mutate } from "swr";
import { toast } from "@/hooks/use-toast";
import { useLocalizedPath } from "@/lib/i18n/client";

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
 * Category List Client Component
 **************************************************/
export default function CategoryListClient() {
  const router = useRouter();
  const toLocale = useLocalizedPath();
  const [isPending, startTransition] = useTransition();
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; category: Category | null }>({
    isOpen: false,
    category: null,
  });
  const [deleteMultipleDialog, setDeleteMultipleDialog] = useState<{
    isOpen: boolean;
    count: number;
  }>({
    isOpen: false,
    count: 0,
  });

  // Usa SWR per ottenere le categorie (cache pre-popolata dal server)
  const { categories = [], isLoading } = useCategories();
  const [localCategories, setLocalCategories] = useState<Category[]>(categories);

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
  } = useTableState<Category>({
    data: localCategories,
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
  } = useTableSelection(tableData, (category) => category.slug);

  // Get visible column configs
  const visibleColumnConfigs = useMemo(() => {
    return columnConfig.filter((col) => visibleColumns.includes(col.key));
  }, [visibleColumns]);

  // Sync local categories with SWR data when they change
  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  // Clear selection when search or page changes
  useEffect(() => {
    clearSelection();
  }, [search, currentPage, clearSelection]);

  function handleEdit(category: Category) {
    router.push(toLocale(`/admin/categories/${category.slug}/edit`));
  }

  function handleDeleteClick(category: Category) {
    setDeleteDialog({ isOpen: true, category });
  }

  async function handleDeleteConfirm() {
    if (!deleteDialog.category) return;

    const { slug } = deleteDialog.category;
    setDeleteDialog({ isOpen: false, category: null });

    startTransition(async () => {
      const result = await deleteCategoryAction(slug);

      if (!result.success) {
        toast.actionResult(result, { errorTitle: "Impossibile eliminare categoria" });
      } else {
        toast.success(result.message || "Categoria eliminata con successo");
        // Invalida la cache SWR per forzare il refetch
        mutate("/api/categories");
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
      const result = await deleteCategoriesAction(selectedIds);

      if (!result.success) {
        toast.actionResult(result, { errorTitle: "Eliminazione multipla non completata" });
      } else {
        toast.success(result.message || "Categorie eliminate con successo");
        // Invalida la cache SWR per forzare il refetch
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
            <div className={baseStyles.buttonGroup}>
              <button
                onClick={() => handleEdit(category)}
                className={styles.iconButton}
                disabled={isPending}
                aria-label="Modifica"
                title="Modifica"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteClick(category)}
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

  // Mostra loading solo se non ci sono dati (prima richiesta)
  if (isLoading && categories.length === 0) {
    return (
      <div className={baseStyles.container}>
        <div className={baseStyles.loadingText}>Caricamento categorie...</div>
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
              placeholder="Cerca per nome, slug o descrizione..."
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
            title={`${totalItems} ${totalItems === 1 ? "categoria" : "categorie"}`}
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
                  Nessuna categoria trovata
                </TableCell>
              </TableRow>
            ) : (
              tableData.map((category) => (
                <TableRow key={category.slug}>
                  <TableCell>
                    <TableCheckbox
                      checked={isSelected(category.slug)}
                      onChange={() => toggleSelection(category.slug)}
                      disabled={isPending}
                      ariaLabel={`Seleziona ${category.name}`}
                    />
                  </TableCell>
                  {visibleColumnConfigs.map((column) => (
                    <Fragment key={column.key}>{renderCell(category, column.key)}</Fragment>
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
            {selectedCount === 1 ? "categoria selezionata" : "categorie selezionate"}
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
      {deleteDialog.category && (
        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          onClose={() => setDeleteDialog({ isOpen: false, category: null })}
          onConfirm={handleDeleteConfirm}
          title="Elimina Categoria"
          message={`Sei sicuro di voler eliminare la categoria "${deleteDialog.category.name}"? Questa azione non può essere annullata.`}
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
        title="Elimina Categorie"
        message={`Sei sicuro di voler eliminare ${deleteMultipleDialog.count} categor${deleteMultipleDialog.count === 1 ? "ia" : "ie"}? Questa azione non può essere annullata.`}
        confirmText="Elimina"
        cancelText="Annulla"
        confirmButtonClassName={styles.deleteButton}
        isLoading={isPending}
      />
    </div>
  );
}
