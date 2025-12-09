/* **************************************************
 * Imports
 **************************************************/
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, useMemo, Fragment, useRef, useEffect } from "react";
import { ExternalLink, Filter, Pencil, Trash2, X, Hash } from "lucide-react";
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
import ConfirmDialog from "@/components/molecules/confirmDialog";
import SelectSearch, { type SelectSearchOption } from "./SelectSearch";
import { cn } from "@/lib/utils/classes";
import styles from "../styles";
import baseStyles from "../../styles";
import type { Article } from "@/lib/github/types";
import { useArticles, useIssues, useCategories, useAuthors } from "@/hooks/swr";
import { mutate } from "swr";
import { ItemsPerPageSelector } from "@/components/table/ItemsPerPageSelector";

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
export default function ArticleListClient() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<{ message: string; type: "error" | "warning" } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; article: Article | null }>({
    isOpen: false,
    article: null,
  });

  // Usa SWR per ottenere gli articoli (cache pre-popolata dal server)
  const { articles = [], isLoading } = useArticles();
  const { issues = [] } = useIssues();
  const { categories = [] } = useCategories();
  const { authors = [] } = useAuthors();

  // Initialize visible columns from defaultVisible
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() =>
    columnConfig.filter((col) => col.defaultVisible !== false).map((col) => col.key),
  );

  // State for advanced filters modal
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);

  const {
    data: tableData,
    totalItems,
    totalPages,
    currentPage,
    itemsPerPage,
    search,
    sort,
    filters,
    setSearch,
    setSort,
    setFilter,
    setPage,
    setItemsPerPage,
  } = useTableState<Article>({
    data: articles,
    searchKeys: ["title", "slug", "excerpt"],
    itemsPerPage: 10,
    initialSort: { key: "date", direction: "desc" },
  });

  // Close filters modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setIsFiltersOpen(false);
      }
    }

    if (isFiltersOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFiltersOpen]);

  // Get visible column configs
  const visibleColumnConfigs = useMemo(() => {
    return columnConfig.filter((col) => visibleColumns.includes(col.key));
  }, [visibleColumns]);

  // Prepare options for SelectSearch components
  const issueOptions: SelectSearchOption[] = useMemo(() => {
    return [
      { value: "", label: "Tutte le issue" },
      ...issues.map((issue) => ({
        value: issue.slug,
        label: issue.title,
      })),
    ];
  }, [issues]);

  const categoryOptions: SelectSearchOption[] = useMemo(() => {
    return [
      { value: "", label: "Tutte le categorie" },
      ...categories.map((category) => ({
        value: category.slug,
        label: category.name,
      })),
    ];
  }, [categories]);

  const authorOptions: SelectSearchOption[] = useMemo(() => {
    return [
      { value: "", label: "Tutti gli autori" },
      ...authors.map((author) => ({
        value: author.slug,
        label: author.name,
      })),
    ];
  }, [authors]);

  // Get active filters count
  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter(
      (value) => value !== null && value !== "" && value !== undefined,
    ).length;
  }, [filters]);

  // Get filter labels for display
  const getFilterLabel = (key: string, value: string) => {
    switch (key) {
      case "issue":
        const issue = issues.find((i) => i.slug === value);
        return issue ? issue.title : value;
      case "category":
        const category = categories.find((c) => c.slug === value);
        return category ? category.name : value;
      case "author":
        const author = authors.find((a) => a.slug === value);
        return author ? author.name : value;
      default:
        return value;
    }
  };

  function handleClearFilter(key: string) {
    setFilter(key, null);
  }

  function handleClearAllFilters() {
    setFilter("issue", null);
    setFilter("category", null);
    setFilter("author", null);
  }

  function handleEdit(article: Article) {
    router.push(`/admin/articles/${article.slug}/edit`);
  }

  function handleDeleteClick(article: Article) {
    setDeleteDialog({ isOpen: true, article });
  }

  async function handleDeleteConfirm() {
    if (!deleteDialog.article) return;

    const { slug } = deleteDialog.article;
    setError(null);
    setDeleteDialog({ isOpen: false, article: null });

    startTransition(async () => {
      const result = await deleteArticleAction(slug);

      if (!result.success) {
        setError({
          message: result.error,
          type: result.errorType || "error",
        });
      } else {
        // Invalida la cache SWR per forzare il refetch
        mutate("/api/articles");
        mutate("/api/github/merge/check");
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
            <span className="text-xs text-secondary/60 font-mono bg-secondary/10 px-2 py-1">
              {article.slug}
            </span>
          </TableCell>
        );
      case "date":
        return <TableCell>{new Date(article.date).toLocaleDateString("it-IT")}</TableCell>;
      case "author":
        const author = authors.find((a) => a.slug === article.author);
        return <TableCell>{author?.name || article.author}</TableCell>;
      case "category":
        const category = categories.find((c) => c.slug === article.category);
        return <TableCell>{category?.name || article.category}</TableCell>;
      case "issue":
        const issue = issues.find((i) => i.slug === article.issue);
        return <TableCell>{issue?.title || article.issue}</TableCell>;
      case "in_evidence":
        return (
          <TableCell>
            {article.in_evidence ? (
              <span className="px-2 py-1 text-xs bg-green-100 text-green-700">Sì</span>
            ) : (
              <span className="px-2 py-1 text-xs bg-secondary/10 text-secondary/60">No</span>
            )}
          </TableCell>
        );
      case "actions":
        return (
          <TableCell>
            <div className={baseStyles.buttonGroup}>
              <Link
                href={`/articles/${article.slug}`}
                target="_blank"
                className={styles.iconButton}
                aria-label="Anteprima"
                title="Anteprima"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
              <button
                onClick={() => handleEdit(article)}
                className={styles.iconButton}
                disabled={isPending}
                aria-label="Modifica"
                title="Modifica"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteClick(article)}
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
  if (isLoading && articles.length === 0) {
    return (
      <div className={baseStyles.container}>
        <div className={baseStyles.loadingText}>Caricamento articoli...</div>
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
              placeholder="Cerca per titolo, slug o excerpt..."
            />
          </div>
          <div className="relative" ref={filtersRef}>
            <button
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              title="Filtri avanzati"
              className={cn(
                "flex items-center justify-center p-2 border border-secondary h-[34px] relative",
                "hover:bg-tertiary/10 focus:outline-none focus:ring-2 focus:ring-tertiary",
                "transition-all duration-150",
                activeFiltersCount > 0 ? "bg-tertiary/20 border-tertiary" : undefined,
              )}
            >
              <Filter className="h-4 w-4" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs bg-tertiary text-white min-w-[18px] text-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {isFiltersOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-primary border border-secondary shadow-lg z-50">
                <div className="p-4 border-b border-secondary">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-secondary">Filtri Avanzati</h3>
                    <button
                      onClick={() => setIsFiltersOpen(false)}
                      className="text-secondary/60 hover:text-secondary transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  {/* Issue Filter */}
                  <SelectSearch
                    id="filter-issue"
                    label="Issue"
                    value={(filters.issue as string) || ""}
                    options={issueOptions}
                    onChange={(value) => setFilter("issue", value || null)}
                    placeholder="Seleziona un'issue"
                    emptyMessage="Nessuna issue disponibile"
                  />

                  {/* Category Filter */}
                  <SelectSearch
                    id="filter-category"
                    label="Categoria"
                    value={(filters.category as string) || ""}
                    options={categoryOptions}
                    onChange={(value) => setFilter("category", value || null)}
                    placeholder="Seleziona una categoria"
                    emptyMessage="Nessuna categoria disponibile"
                  />

                  {/* Author Filter */}
                  <SelectSearch
                    id="filter-author"
                    label="Autore"
                    value={(filters.author as string) || ""}
                    options={authorOptions}
                    onChange={(value) => setFilter("author", value || null)}
                    placeholder="Seleziona un autore"
                    emptyMessage="Nessun autore disponibile"
                  />

                  {activeFiltersCount > 0 && (
                    <button
                      onClick={handleClearAllFilters}
                      className="w-full px-3 py-2 text-sm text-secondary/60 hover:text-secondary border border-secondary hover:border-tertiary transition-all duration-150"
                    >
                      Rimuovi tutti i filtri
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
          <ColumnSelector
            columns={columnConfig}
            visibleColumns={visibleColumns}
            onColumnsChange={setVisibleColumns}
          />
          <ItemsPerPageSelector value={itemsPerPage} onChange={setItemsPerPage} />
          <div
            className="flex items-center h-[34px] gap-1.5 px-2 py-1 border border-secondary"
            title={`${totalItems} ${totalItems === 1 ? "articolo" : "articoli"}`}
          >
            <Hash className="h-4 w-4 text-secondary/60" />
            <span className="text-xs text-secondary/80">{totalItems}</span>
          </div>
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (value === null || value === "" || value === undefined) return null;
              return (
                <div
                  key={key}
                  className="flex items-center gap-2 px-3 py-1 bg-tertiary/20 border border-tertiary text-sm"
                >
                  <span className="text-secondary/60 capitalize">{key}:</span>
                  <span className="text-secondary">{getFilterLabel(key, value as string)}</span>
                  <button
                    onClick={() => handleClearFilter(key)}
                    className="text-secondary/60 hover:text-secondary transition-colors"
                    title="Rimuovi filtro"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
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

      {/* Delete Confirmation Dialog */}
      {deleteDialog.article && (
        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          onClose={() => setDeleteDialog({ isOpen: false, article: null })}
          onConfirm={handleDeleteConfirm}
          title="Elimina Articolo"
          message={`Sei sicuro di voler eliminare l'articolo "${deleteDialog.article.title}"? Questa azione non può essere annullata.`}
          confirmText="Elimina"
          cancelText="Annulla"
          confirmButtonClassName={styles.deleteButton}
          isLoading={isPending}
        />
      )}
    </div>
  );
}
