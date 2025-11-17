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
import { getGitHubImageUrl } from "@/lib/github/images";
import styles from "../styles";
import type { Issue } from "@/lib/github/types";

/* **************************************************
 * Types
 **************************************************/
interface IssueListClientProps {
  issues: Issue[];
}

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
export default function IssueListClient({ issues }: IssueListClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<{ message: string; type: "error" | "warning" } | null>(null);
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

  // Sync local issues with props when they change
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
      console.warn("Drag and drop: indices not found", {
        active: active.id,
        over: over.id,
        oldIndex,
        newIndex,
      });
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
              <img
                src={getGitHubImageUrl(issue.cover)}
                alt={issue.title}
                className="w-16 h-16 object-cover rounded border border-gray-300"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded border border-gray-300 flex items-center justify-center text-xs text-gray-500">
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
            <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
              {issue.slug}
            </span>
          </TableCell>
        );
      case "date":
        return <TableCell>{new Date(issue.date).toLocaleDateString("it-IT")}</TableCell>;
      case "color":
        return (
          <TableCell>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded border border-gray-300"
                style={{ backgroundColor: issue.color }}
              />
              <span className="text-xs text-gray-600 font-mono">{issue.color}</span>
            </div>
          </TableCell>
        );
      case "description":
        return (
          <TableCell className="text-gray-600 max-w-md truncate">{issue.description}</TableCell>
        );
      case "actions":
        return (
          <TableCell>
            <div className="flex items-center gap-2">
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

  return (
    <div className="space-y-4">
      {error && (
        <div className={error.type === "warning" ? styles.errorWarning : styles.error}>
          ⚠️ {error.message}
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center gap-4">
          <div className="flex-1">
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
          <Link
            href="/admin/issues/new"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          >
            + Nuova Issue
          </Link>
          <div className="text-sm text-gray-600">
            {totalItems} {totalItems === 1 ? "issue" : "issues"}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <DndTableWrapper
          items={tableData.map((iss) => iss.slug)}
          onDragEnd={handleDragEnd}
          sensors={sensors}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8">
                  {/* Drag handle column */}
                </th>
                {visibleColumnConfigs.map((column) => {
                  if (column.key === "actions") {
                    return (
                      <th
                        key={column.key}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
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
                    className="text-center py-8 text-gray-500"
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

