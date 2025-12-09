/* **************************************************
 * Imports
 **************************************************/
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, useMemo, useEffect, Fragment } from "react";
import { ExternalLink, Hash, Pencil, Trash2 } from "lucide-react";
import { deleteAuthorAction } from "../actions";
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
import type { Author } from "@/lib/github/types";
import { useAuthors } from "@/hooks/swr";
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
 * Author List Client Component
 **************************************************/
export default function AuthorListClient() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<{ message: string; type: "error" | "warning" } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; author: Author | null }>({
    isOpen: false,
    author: null,
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

  // Get visible column configs
  const visibleColumnConfigs = useMemo(() => {
    return columnConfig.filter((col) => visibleColumns.includes(col.key));
  }, [visibleColumns]);

  // Sync local authors with SWR data when they change
  useEffect(() => {
    setLocalAuthors(authors);
  }, [authors]);

  function handleEdit(author: Author) {
    router.push(`/admin/authors/${author.slug}/edit`);
  }

  function handleDeleteClick(author: Author) {
    setDeleteDialog({ isOpen: true, author });
  }

  async function handleDeleteConfirm() {
    if (!deleteDialog.author) return;

    const { slug } = deleteDialog.author;
    setError(null);
    setDeleteDialog({ isOpen: false, author: null });

    startTransition(async () => {
      const result = await deleteAuthorAction(slug);

      if (!result.success) {
        setError({
          message: result.error,
          type: result.errorType || "error",
        });
      } else {
        // Invalida la cache SWR per forzare il refetch
        mutate("/api/authors");
        mutate("/api/github/merge/check");
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
              <Link
                href={`/authors?author=${author.slug}`}
                target="_blank"
                className={styles.iconButton}
                aria-label="Anteprima"
                title="Anteprima"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
              <button
                onClick={() => handleEdit(author)}
                className={styles.iconButton}
                disabled={isPending}
                aria-label="Modifica"
                title="Modifica"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteClick(author)}
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
  if (isLoading && authors.length === 0) {
    return (
      <div className={baseStyles.container}>
        <div className={baseStyles.loadingText}>Caricamento autori...</div>
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
            title={`${totalItems} ${totalItems === 1 ? "autore" : "autori"}`}
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
                  Nessun autore trovato
                </TableCell>
              </TableRow>
            ) : (
              tableData.map((author) => (
                <TableRow key={author.slug}>
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

      {/* Delete Confirmation Dialog */}
      {deleteDialog.author && (
        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          onClose={() => setDeleteDialog({ isOpen: false, author: null })}
          onConfirm={handleDeleteConfirm}
          title="Elimina Autore"
          message={`Sei sicuro di voler eliminare l'autore "${deleteDialog.author.name}"? Questa azione non può essere annullata.`}
          confirmText="Elimina"
          cancelText="Annulla"
          confirmButtonClassName={styles.deleteButton}
          isLoading={isPending}
        />
      )}
    </div>
  );
}
