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
import { deleteCategoryAction, reorderCategoriesAction } from "../actions";
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
import type { Category } from "@/lib/github/types";

/* **************************************************
 * Types
 **************************************************/
interface CategoryListClientProps {
  categories: Category[];
}

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
export default function CategoryListClient({ categories }: CategoryListClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<{ message: string; type: "error" | "warning" } | null>(null);
  const [localCategories, setLocalCategories] = useState<Category[]>(categories);

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
  } = useTableState<Category>({
    data: localCategories,
    searchKeys: ["name", "slug", "description"],
    itemsPerPage: 10,
  });

  // Get visible column configs
  const visibleColumnConfigs = useMemo(() => {
    return columnConfig.filter((col) => visibleColumns.includes(col.key));
  }, [visibleColumns]);

  // Sync local categories with props when they change
  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  function handleEdit(category: Category) {
    router.push(`/admin/categories/${category.slug}/edit`);
  }

  async function handleDelete(slug: string, name: string) {
    if (!confirm(`Sei sicuro di voler eliminare la categoria "${name}"?`)) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await deleteCategoryAction(slug);

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

    // Trova gli indici nelle categorie locali (non paginate)
    const oldIndex = localCategories.findIndex((cat) => String(cat.slug) === String(active.id));
    const newIndex = localCategories.findIndex((cat) => String(cat.slug) === String(over.id));

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
    const newCategories = arrayMove(localCategories, oldIndex, newIndex);
    setLocalCategories(newCategories);

    // Update order on server
    startTransition(async () => {
      const slugs = newCategories.map((cat) => cat.slug);
      const result = await reorderCategoriesAction(slugs);

      if (!result.success) {
        setError({
          message: result.error,
          type: result.errorType || "error",
        });
        // Revert on error
        setLocalCategories(categories);
      } else {
        router.refresh();
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
            <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
              {category.slug}
            </span>
          </TableCell>
        );
      case "description":
        return <TableCell className="text-gray-600">{category.description}</TableCell>;
      case "actions":
        return (
          <TableCell>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEdit(category)}
                className={styles.editButton}
                disabled={isPending}
              >
                Modifica
              </button>
              <button
                onClick={() => handleDelete(category.slug, category.name)}
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
              placeholder="Cerca per nome, slug o descrizione..."
            />
          </div>
          <ColumnSelector
            columns={columnConfig}
            visibleColumns={visibleColumns}
            onColumnsChange={setVisibleColumns}
          />
          <Link
            href="/admin/categories/new"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          >
            + Nuova Categoria
          </Link>
          <div className="text-sm text-gray-600">
            {totalItems} {totalItems === 1 ? "categoria" : "categorie"}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <DndTableWrapper
          items={tableData.map((cat) => cat.slug)}
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
                    Nessuna categoria trovata
                  </TableCell>
                </TableRow>
              ) : (
                tableData.map((category) => (
                  <SortableTableRow key={category.slug} id={category.slug}>
                    {visibleColumnConfigs.map((column) => (
                      <Fragment key={column.key}>{renderCell(category, column.key)}</Fragment>
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
