/* **************************************************
 * Imports
 **************************************************/
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, useMemo, useEffect, Fragment } from "react";
import { ExternalLink, Hash, Pencil, Trash2 } from "lucide-react";
import { deleteCategoryAction } from "../actions";
import { useTableState } from "@/hooks/useTableState";
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
import { SearchInput } from "@/components/search";
import { Pagination } from "@/components/pagination";
import ConfirmDialog from "@/components/molecules/confirmDialog";
import { cn } from "@/lib/utils/classes";
import styles from "../styles";
import baseStyles from "../../styles";
import type { Category } from "@/lib/github/types";
import { useCategories } from "@/hooks/swr";
import { mutate } from "swr";

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
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<{ message: string; type: "error" | "warning" } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; category: Category | null }>({
    isOpen: false,
    category: null,
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

  // Get visible column configs
  const visibleColumnConfigs = useMemo(() => {
    return columnConfig.filter((col) => visibleColumns.includes(col.key));
  }, [visibleColumns]);

  // Sync local categories with SWR data when they change
  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  function handleEdit(category: Category) {
    router.push(`/admin/categories/${category.slug}/edit`);
  }

  function handleDeleteClick(category: Category) {
    setDeleteDialog({ isOpen: true, category });
  }

  async function handleDeleteConfirm() {
    if (!deleteDialog.category) return;

    const { slug } = deleteDialog.category;
    setError(null);
    setDeleteDialog({ isOpen: false, category: null });

    startTransition(async () => {
      const result = await deleteCategoryAction(slug);

      if (!result.success) {
        setError({
          message: result.error,
          type: result.errorType || "error",
        });
      } else {
        // Invalida la cache SWR per forzare il refetch
        mutate("/api/categories");
        mutate("/api/github/merge/check");
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
              <Link
                href={`/categories?category=${category.slug}`}
                target="_blank"
                className={styles.iconButton}
                aria-label="Anteprima"
                title="Anteprima"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
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
      {error && (
        <div className={error.type === "warning" ? baseStyles.errorWarning : baseStyles.error}>
          ⚠️ {error.message}
        </div>
      )}

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
                  colSpan={visibleColumnConfigs.length}
                  className={baseStyles.tableEmptyCell}
                >
                  Nessuna categoria trovata
                </TableCell>
              </TableRow>
            ) : (
              tableData.map((category) => (
                <TableRow key={category.slug}>
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
    </div>
  );
}
