"use client";

/* **************************************************
 * Imports
 **************************************************/
import { Filter, Pencil, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useMemo, useRef, useEffect } from "react";
import { mutate } from "swr";

import { TableCell } from "@/components/table";
import { useArticles, useIssues, useCategories, useAuthors } from "@/hooks/swr";
import { toast } from "@/hooks/use-toast";
import type { Article } from "@/lib/github/types";
import { useLocalizedPath } from "@/lib/i18n/client";
import { cn } from "@/lib/utils/classes";

import SelectSearch, { type SelectSearchOption } from "./SelectSearch";
import { adminListCopy } from "../../components/adminListCopy";
import CrudListShell from "../../shared/CrudListShell";
import { entityCrudStyles } from "../../shared/entityCrudStyles";
import { useCrudList } from "../../shared/useCrudList";
import { deleteArticleAction, deleteArticlesAction } from "../actions";

/* **************************************************
 * Column Configuration
 **************************************************/
const columnConfig = [
  { key: "title", label: "Titolo", defaultVisible: true },
  { key: "slug", label: "Slug", defaultVisible: true },
  { key: "date", label: "Data", defaultVisible: true },
  { key: "author", label: "Autore", defaultVisible: true },
  { key: "category", label: "Categoria", defaultVisible: true },
  { key: "issue", label: "Issue", defaultVisible: true },
  { key: "in_evidence", label: "In Evidenza", defaultVisible: false },
  { key: "actions", label: "Azioni", defaultVisible: true },
] as const;

/* **************************************************
 * Article List Client Component
 **************************************************/
export default function ArticleListClient() {
  const router = useRouter();
  const toLocale = useLocalizedPath();
  const { articles = [], isLoading } = useArticles();
  const { issues = [] } = useIssues();
  const { categories = [] } = useCategories();
  const { authors = [] } = useAuthors();

  const copy = adminListCopy.articles;

  // Filter panel visibility (local UI state, not part of CRUD state)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);

  const {
    isPending,
    startTransition,
    deleteDialog,
    deleteMultipleDialog,
    openDeleteDialog,
    closeDeleteDialog,
    openDeleteMultipleDialog,
    closeDeleteMultipleDialog,
    visibleColumns,
    setVisibleColumns,
    tableData,
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
    selectedIds,
    isAllSelected,
    isIndeterminate,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    isSelected,
    selectedCount,
  } = useCrudList({
    data: articles,
    columnConfig: [...columnConfig],
    searchKeys: ["title", "slug", "excerpt"],
    getItemId: (article) => article.slug,
    tableStateOptions: { initialSort: { key: "date", direction: "desc" } },
  });

  // Close filter panel on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setIsFiltersOpen(false);
      }
    }
    if (isFiltersOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFiltersOpen]);

  async function handleDeleteConfirm() {
    if (!deleteDialog.item) return;
    const { slug } = deleteDialog.item;
    closeDeleteDialog();
    startTransition(async () => {
      const result = await deleteArticleAction(slug);
      if (!result.success) {
        toast.actionResult(result, { errorTitle: copy.deleteErrorTitle });
      } else {
        toast.success(result.message || copy.deleteSuccess);
        mutate("/api/articles");
        mutate("/api/github/merge/check");
        clearSelection();
      }
    });
  }

  async function handleDeleteMultipleConfirm() {
    if (selectedIds.length === 0) return;
    closeDeleteMultipleDialog();
    startTransition(async () => {
      const result = await deleteArticlesAction(selectedIds);
      if (!result.success) {
        toast.actionResult(result, { errorTitle: copy.deleteManyErrorTitle });
      } else {
        toast.success(result.message || copy.deleteManySuccess);
        mutate("/api/articles");
        mutate("/api/github/merge/check");
        clearSelection();
      }
    });
  }

  const issueOptions: SelectSearchOption[] = useMemo(
    () => [
      { value: "", label: copy.allIssues },
      ...issues.map((i) => ({ value: i.id, label: i.title })),
    ],
    [copy, issues],
  );

  const categoryOptions: SelectSearchOption[] = useMemo(
    () => [
      { value: "", label: copy.allCategories },
      ...categories.map((c) => ({ value: c.id, label: c.name })),
    ],
    [copy, categories],
  );

  const authorOptions: SelectSearchOption[] = useMemo(
    () => [
      { value: "", label: copy.allAuthors },
      ...authors.map((a) => ({ value: a.id, label: a.name })),
    ],
    [copy, authors],
  );

  const activeFiltersCount = useMemo(
    () => Object.values(filters).filter((v) => v !== null && v !== "" && v !== undefined).length,
    [filters],
  );

  function getFilterLabel(key: string, value: string) {
    if (key === "issueId") return issues.find((i) => i.id === value)?.title ?? value;
    if (key === "categoryId") return categories.find((c) => c.id === value)?.name ?? value;
    if (key === "authorId") return authors.find((a) => a.id === value)?.name ?? value;
    return value;
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
        return (
          <TableCell>
            {authors.find((a) => a.id === article.authorId)?.name || article.authorId}
          </TableCell>
        );
      case "category":
        return (
          <TableCell>
            {categories.find((c) => c.id === article.categoryId)?.name || article.categoryId}
          </TableCell>
        );
      case "issue":
        return <TableCell>{issues.find((i) => i.id === article.issueId)?.title || ""}</TableCell>;
      case "in_evidence":
        return (
          <TableCell>
            {article.in_evidence ? (
              <span className="px-2 py-1 text-xs bg-green-100 text-green-700">{copy.yes}</span>
            ) : (
              <span className="px-2 py-1 text-xs bg-secondary/10 text-secondary/60">{copy.no}</span>
            )}
          </TableCell>
        );
      case "actions":
        return (
          <TableCell>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(toLocale(`/admin/articles/${article.slug}/edit`))}
                className={entityCrudStyles.iconButton}
                disabled={isPending}
                aria-label={adminListCopy.common.edit}
                title={adminListCopy.common.edit}
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => openDeleteDialog(article)}
                className={cn(entityCrudStyles.iconButton, entityCrudStyles.iconButtonDanger)}
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

  /* --------------------------------------------------
   * Filter panel (toolbar slot)
   * -------------------------------------------------- */
  const filterButton = (
    <div className="relative" ref={filtersRef}>
      <button
        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
        title={copy.advancedFilters}
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
              <h3 className="text-sm font-semibold text-secondary">{copy.advancedFiltersTitle}</h3>
              <button
                onClick={() => setIsFiltersOpen(false)}
                className="text-secondary/60 hover:text-secondary transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <SelectSearch
              id="filter-issueId"
              label={copy.issueFilter}
              value={(filters.issueId as string) || ""}
              options={issueOptions}
              onChange={(value) => setFilter("issueId", value || null)}
              placeholder={copy.issuePlaceholder}
              emptyMessage={copy.emptyIssueFilter}
            />
            <SelectSearch
              id="filter-categoryId"
              label={copy.categoryFilter}
              value={(filters.categoryId as string) || ""}
              options={categoryOptions}
              onChange={(value) => setFilter("categoryId", value || null)}
              placeholder={copy.categoryPlaceholder}
              emptyMessage={copy.emptyCategoryFilter}
            />
            <SelectSearch
              id="filter-authorId"
              label={copy.authorFilter}
              value={(filters.authorId as string) || ""}
              options={authorOptions}
              onChange={(value) => setFilter("authorId", value || null)}
              placeholder={copy.authorPlaceholder}
              emptyMessage={copy.emptyAuthorFilter}
            />
            {activeFiltersCount > 0 && (
              <button
                onClick={() => {
                  setFilter("issueId", null);
                  setFilter("categoryId", null);
                  setFilter("authorId", null);
                }}
                className="w-full px-3 py-2 text-sm text-secondary/60 hover:text-secondary border border-secondary hover:border-tertiary transition-all duration-150"
              >
                {copy.clearAllFilters}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const activeFilterChips =
    activeFiltersCount > 0 ? (
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
                onClick={() => setFilter(key, null)}
                className="text-secondary/60 hover:text-secondary transition-colors"
                title={copy.clearFilter}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>
    ) : null;

  return (
    <CrudListShell<Article>
      isLoading={isLoading}
      loadingText={copy.loading}
      isPending={isPending}
      data={tableData}
      emptyText={copy.empty}
      getItemKey={(a) => a.slug}
      getItemLabel={(a) => a.title}
      renderCell={renderCell}
      columnConfig={[...columnConfig]}
      visibleColumns={visibleColumns}
      onColumnsChange={setVisibleColumns}
      sort={sort}
      onSort={setSort}
      itemsPerPage={itemsPerPage}
      onItemsPerPageChange={setItemsPerPage}
      totalPages={totalPages}
      currentPage={currentPage}
      onPageChange={setPage}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder={copy.searchPlaceholder}
      totalItems={totalItems}
      countTitle={`${totalItems} ${totalItems === 1 ? copy.singular : copy.plural}`}
      isAllSelected={isAllSelected}
      isIndeterminate={isIndeterminate}
      onToggleSelectAll={toggleSelectAll}
      isSelected={isSelected}
      onToggleSelection={toggleSelection}
      selectedCount={selectedCount}
      selectedLabel={selectedCount === 1 ? copy.selectedSingular : copy.selectedPlural}
      onDeleteMultiple={() => openDeleteMultipleDialog(selectedCount)}
      onClearSelection={clearSelection}
      toolbarExtra={filterButton}
      toolbarBelow={activeFilterChips}
      deleteDialog={{
        isOpen: deleteDialog.isOpen,
        title: copy.deleteDialogTitle,
        message: copy.deleteDialogMessage(deleteDialog.item?.title ?? ""),
        confirmText: adminListCopy.common.delete,
        onConfirm: handleDeleteConfirm,
        onClose: closeDeleteDialog,
      }}
      deleteMultipleDialog={{
        isOpen: deleteMultipleDialog.isOpen,
        title: copy.deleteManyDialogTitle,
        message: copy.deleteManyDialogMessage(deleteMultipleDialog.count),
        confirmText: adminListCopy.common.delete,
        onConfirm: handleDeleteMultipleConfirm,
        onClose: closeDeleteMultipleDialog,
      }}
      cancelText={adminListCopy.common.cancel}
    />
  );
}
