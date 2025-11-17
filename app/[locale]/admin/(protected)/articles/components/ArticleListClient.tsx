/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useTransition, useMemo, Fragment } from "react";
import { deleteArticleAction } from "../actions";
import { useTableState } from "@/hooks/useTableState";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  SortableHeader,
  ColumnSelector,
  type ColumnConfig,
} from "@/components/table";
import { SearchInput } from "@/components/search";
import { Pagination } from "@/components/pagination";
import styles from "../styles";
import type { Article } from "@/lib/github/types";

/* **************************************************
 * Types
 **************************************************/
interface ArticleListClientProps {
  articles: Article[];
}

/* **************************************************
 * Column Configuration
 **************************************************/
const columnConfig: ColumnConfig[] = [
  { key: "title", label: "Titolo", defaultVisible: true },
  { key: "slug", label: "Slug", defaultVisible: true },
  { key: "date", label: "Data", defaultVisible: true },
  { key: "author", label: "Autore", defaultVisible: true },
  { key: "category", label: "Categoria", defaultVisible: true },
  { key: "issue", label: "Issue", defaultVisible: true },
  { key: "in_evidence", label: "In Evidenza", defaultVisible: false },
  { key: "actions", label: "Azioni", defaultVisible: true },
];

/* **************************************************
 * Article List Client Component
 **************************************************/
export default function ArticleListClient({ articles }: ArticleListClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<{ message: string; type: "error" | "warning" } | null>(null);

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
  } = useTableState<Article>({
    data: articles,
    searchKeys: ["title", "slug", "excerpt"],
    itemsPerPage: 10,
    initialSort: { key: "date", direction: "desc" },
  });

  // Get visible column configs
  const visibleColumnConfigs = useMemo(() => {
    return columnConfig.filter((col) => visibleColumns.includes(col.key));
  }, [visibleColumns]);

  function handleEdit(article: Article) {
    router.push(`/admin/articles/${article.slug}/edit`);
  }

  async function handleDelete(slug: string, title: string) {
    if (!confirm(`Sei sicuro di voler eliminare l'articolo "${title}"?`)) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await deleteArticleAction(slug);

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

  function renderCell(article: Article, columnKey: string) {
    switch (columnKey) {
      case "title":
        return <TableCell className="font-medium">{article.title}</TableCell>;
      case "slug":
        return (
          <TableCell>
            <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
              {article.slug}
            </span>
          </TableCell>
        );
      case "date":
        return <TableCell>{new Date(article.date).toLocaleDateString("it-IT")}</TableCell>;
      case "author":
        return <TableCell>{article.author}</TableCell>;
      case "category":
        return <TableCell>{article.category}</TableCell>;
      case "issue":
        return <TableCell>{article.issue}</TableCell>;
      case "in_evidence":
        return (
          <TableCell>
            {article.in_evidence ? (
              <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">Sì</span>
            ) : (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">No</span>
            )}
          </TableCell>
        );
      case "actions":
        return (
          <TableCell>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEdit(article)}
                className={styles.submitButton}
                disabled={isPending}
              >
                Modifica
              </button>
              <button
                onClick={() => handleDelete(article.slug, article.title)}
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
              placeholder="Cerca per titolo, slug o excerpt..."
            />
          </div>
          <ColumnSelector
            columns={columnConfig}
            visibleColumns={visibleColumns}
            onColumnsChange={setVisibleColumns}
          />
          <Link
            href="/admin/articles/new"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          >
            + Nuovo Articolo
          </Link>
          <div className="text-sm text-gray-600">
            {totalItems} {totalItems === 1 ? "articolo" : "articoli"}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
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
                  colSpan={visibleColumnConfigs.length}
                  className="text-center py-8 text-gray-500"
                >
                  Nessun articolo trovato
                </TableCell>
              </TableRow>
            ) : (
              tableData.map((article) => (
                <TableRow key={article.slug}>
                  {visibleColumnConfigs.map((column) => (
                    <Fragment key={column.key}>{renderCell(article, column.key)}</Fragment>
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
    </div>
  );
}

