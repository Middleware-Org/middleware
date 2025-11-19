/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useTransition, useMemo, useEffect, Fragment } from "react";
import { KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { DndTableWrapper } from "@/components/table/DndTableWrapper";
import { deleteAuthorAction, reorderAuthorsAction } from "../actions";
import { useTableState } from "@/hooks/useTableState";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  SortableHeader,
  ColumnSelector,
  SortableTableRow,
  type ColumnConfig,
} from "@/components/table";
import { SearchInput } from "@/components/search";
import { Pagination } from "@/components/pagination";
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

  // Usa SWR per ottenere gli autori (cache pre-popolata dal server)
  const { authors = [], isLoading } = useAuthors();
  const [localAuthors, setLocalAuthors] = useState<Author[]>(authors);

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px di movimento prima di attivare il drag
      },
    }),
    useSensor(KeyboardSensor),
  );

  // Initialize visible columns from defaultVisible
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() =>
    columnConfig.filter((col) => col.defaultVisible !== false).map((col) => col.key),
  );

  const {
    data: tableData,
    totalItems,
    totalPages,
    currentPage,
    search,
    sort,
    setSearch,
    setSort,
    setPage,
  } = useTableState<Author>({
    data: localAuthors, // Use localAuthors for table state
    searchKeys: ["name", "slug", "description"],
    itemsPerPage: 10,
    initialSort: { key: "order", direction: "asc" }, // Initial sort by order
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

  async function handleDelete(slug: string, name: string) {
    if (!confirm(`Sei sicuro di voler eliminare l'autore "${name}"?`)) {
      return;
    }

    setError(null);

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
      }
    });
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) {
      return;
    }

    if (active.id === over.id) {
      return;
    }

    // Trova gli indici negli autori locali (non paginati)
    const oldIndex = localAuthors.findIndex((auth) => String(auth.slug) === String(active.id));
    const newIndex = localAuthors.findIndex((auth) => String(auth.slug) === String(over.id));

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // Update local state immediately for better UX
    const newAuthors = arrayMove(localAuthors, oldIndex, newIndex);
    setLocalAuthors(newAuthors);

    // Update order on server
    startTransition(async () => {
      const slugs = newAuthors.map((auth) => auth.slug);
      const result = await reorderAuthorsAction(slugs);

      if (!result.success) {
        setError({
          message: result.error,
          type: result.errorType || "error",
        });
        // Revert on error
        setLocalAuthors(authors);
      } else {
        // Invalida la cache SWR per forzare il refetch
        mutate("/api/authors");
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
                className={styles.editButton}
                disabled={isPending}
              >
                Modifica
              </button>
              <button
                onClick={() => handleDelete(author.slug, author.name)}
                className={styles.deleteButton}
                disabled={isPending}
              >
                Elimina
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
          <Link href="/admin/authors/new" className={baseStyles.newButton}>
            + Nuovo Autore
          </Link>
          <div className={baseStyles.textSecondary}>
            {totalItems} {totalItems === 1 ? "autore" : "autori"}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={baseStyles.tableContainer}>
        <DndTableWrapper
          items={tableData.map((auth) => auth.slug)}
          onDragEnd={handleDragEnd}
          sensors={sensors}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <th className={`${baseStyles.tableHeaderCell} w-8`}>{/* Drag handle column */}</th>
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
                    Nessun autore trovato
                  </TableCell>
                </TableRow>
              ) : (
                tableData.map((author) => (
                  <SortableTableRow key={author.slug} id={author.slug}>
                    {visibleColumnConfigs.map((column) => (
                      <Fragment key={column.key}>{renderCell(author, column.key)}</Fragment>
                    ))}
                  </SortableTableRow>
                ))
              )}
            </TableBody>
          </Table>
        </DndTableWrapper>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
        )}
      </div>
    </div>
  );
}
