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
import { deleteIssueAction, reorderIssuesAction } from "../actions";
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
import type { Issue } from "@/lib/github/types";
import Image from "next/image";
import { useIssues } from "@/hooks/swr";
import { mutate } from "swr";

/* **************************************************
 * Types
 **************************************************/
// Non più necessario - i dati vengono da SWR

/* **************************************************
 * Column Configuration
 **************************************************/
const columnConfig: ColumnConfig[] = [
  { key: "cover", label: "Cover", defaultVisible: true },
  { key: "title", label: "Titolo", defaultVisible: true },
  { key: "slug", label: "Slug", defaultVisible: true },
  { key: "date", label: "Data", defaultVisible: true },
  { key: "color", label: "Colore", defaultVisible: false },
  { key: "description", label: "Descrizione", defaultVisible: false },
  { key: "actions", label: "Azioni", defaultVisible: true },
];

/* **************************************************
 * Issue List Client Component
 **************************************************/
export default function IssueListClient() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<{ message: string; type: "error" | "warning" } | null>(null);

  // Usa SWR per ottenere le issues (cache pre-popolata dal server)
  const { issues = [], isLoading } = useIssues();
  const [localIssues, setLocalIssues] = useState<Issue[]>(issues);

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
  } = useTableState<Issue>({
    data: localIssues, // Use localIssues for table state
    searchKeys: ["title", "slug", "description"],
    itemsPerPage: 10,
    initialSort: { key: "order", direction: "asc" }, // Initial sort by order
  });

  // Get visible column configs
  const visibleColumnConfigs = useMemo(() => {
    return columnConfig.filter((col) => visibleColumns.includes(col.key));
  }, [visibleColumns]);

  // Sync local issues with SWR data when they change
  useEffect(() => {
    setLocalIssues(issues);
  }, [issues]);

  function handleEdit(issue: Issue) {
    router.push(`/admin/issues/${issue.slug}/edit`);
  }

  async function handleDelete(slug: string, title: string) {
    if (!confirm(`Sei sicuro di voler eliminare l'issue "${title}"?`)) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await deleteIssueAction(slug);

      if (!result.success) {
        setError({
          message: result.error,
          type: result.errorType || "error",
        });
      } else {
        // Invalida la cache SWR per forzare il refetch
        mutate("/api/issues");
        router.refresh();
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

    // Trova gli indici nelle issue locali (non paginate)
    const oldIndex = localIssues.findIndex((iss) => String(iss.slug) === String(active.id));
    const newIndex = localIssues.findIndex((iss) => String(iss.slug) === String(over.id));

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // Update local state immediately for better UX
    const newIssues = arrayMove(localIssues, oldIndex, newIndex);
    setLocalIssues(newIssues);

    // Update order on server
    startTransition(async () => {
      const slugs = newIssues.map((iss) => iss.slug);
      const result = await reorderIssuesAction(slugs);

      if (!result.success) {
        setError({
          message: result.error,
          type: result.errorType || "error",
        });
        // Revert on error
        setLocalIssues(issues);
      } else {
        // Invalida la cache SWR per forzare il refetch
        mutate("/api/issues");
        router.refresh();
      }
    });
  }

  function renderCell(issue: Issue, columnKey: string) {
    switch (columnKey) {
      case "cover":
        return (
          <TableCell>
            {issue.cover ? (
              <Image
                src={issue.cover}
                width={64}
                height={64}
                alt={issue.title}
                className="w-16 h-16 object-cover border border-secondary"
              />
            ) : (
              <div className="w-16 h-16 bg-secondary/20 border border-secondary flex items-center justify-center text-xs text-secondary/60">
                No image
              </div>
            )}
          </TableCell>
        );
      case "title":
        return <TableCell className="font-medium">{issue.title}</TableCell>;
      case "slug":
        return (
          <TableCell>
            <span className="text-xs text-secondary/60 font-mono bg-secondary/10 px-2 py-1">
              {issue.slug}
            </span>
          </TableCell>
        );
      case "date":
        return <TableCell>{new Date(issue.date).toLocaleDateString("it-IT")}</TableCell>;
      case "color":
        return (
          <TableCell>
            <div className={baseStyles.buttonGroup}>
              <div
                className="w-6 h-6 border border-secondary"
                style={{ backgroundColor: issue.color }}
              />
              <span className="text-xs text-secondary/80 font-mono">{issue.color}</span>
            </div>
          </TableCell>
        );
      case "description":
        return (
          <TableCell className="text-secondary/80 max-w-md truncate">{issue.description}</TableCell>
        );
      case "actions":
        return (
          <TableCell>
            <div className={baseStyles.buttonGroup}>
              <button
                onClick={() => handleEdit(issue)}
                className={styles.editButton}
                disabled={isPending}
              >
                Modifica
              </button>
              <button
                onClick={() => handleDelete(issue.slug, issue.title)}
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
  if (isLoading && issues.length === 0) {
    return (
      <div className={baseStyles.container}>
        <div className={baseStyles.loadingText}>Caricamento issues...</div>
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
              placeholder="Cerca per titolo, slug o descrizione..."
            />
          </div>
          <ColumnSelector
            columns={columnConfig}
            visibleColumns={visibleColumns}
            onColumnsChange={setVisibleColumns}
          />
          <Link href="/admin/issues/new" className={baseStyles.newButton}>
            + Nuova Issue
          </Link>
          <div className={baseStyles.textSecondary}>
            {totalItems} {totalItems === 1 ? "issue" : "issues"}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={baseStyles.tableContainer}>
        <DndTableWrapper
          items={tableData.map((iss) => iss.slug)}
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
                    Nessuna issue trovata
                  </TableCell>
                </TableRow>
              ) : (
                tableData.map((issue) => (
                  <SortableTableRow key={issue.slug} id={issue.slug}>
                    {visibleColumnConfigs.map((column) => (
                      <Fragment key={column.key}>{renderCell(issue, column.key)}</Fragment>
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
