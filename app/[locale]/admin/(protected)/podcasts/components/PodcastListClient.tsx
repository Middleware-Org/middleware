/* **************************************************
 * Imports
 **************************************************/
"use client";

import { Pencil, Trash2, X, Hash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition, useMemo, Fragment, useEffect } from "react";
import { mutate } from "swr";

import ConfirmDialog from "@/components/molecules/confirmDialog";
import { Pagination } from "@/components/pagination";
import { SearchInput } from "@/components/search";
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
import { ItemsPerPageSelector } from "@/components/table/ItemsPerPageSelector";
import { TableCheckbox } from "@/components/table/TableCheckbox";
import { usePodcasts } from "@/hooks/swr";
import { toast } from "@/hooks/use-toast";
import { useTableSelection } from "@/hooks/useTableSelection";
import { useTableState } from "@/hooks/useTableState";
import type { Podcast } from "@/lib/github/types";
import { useLocalizedPath } from "@/lib/i18n/client";
import { cn } from "@/lib/utils/classes";

import { adminListCopy } from "../../components/adminListCopy";
import { useCrudDeleteDialogs } from "../../components/useCrudDeleteDialogs";
import baseStyles from "../../styles";
import { deletePodcastAction, deletePodcastsAction } from "../actions";
import styles from "../styles";

/* **************************************************
 * Column Configuration
 **************************************************/
const columnConfig: ColumnConfig[] = [
  { key: "cover", label: "Cover", defaultVisible: true },
  { key: "title", label: "Titolo", defaultVisible: true },
  { key: "slug", label: "Slug", defaultVisible: true },
  { key: "date", label: "Data", defaultVisible: true },
  { key: "published", label: "Pubblicato", defaultVisible: false },
  { key: "actions", label: "Azioni", defaultVisible: true },
];

/* **************************************************
 * Podcast List Client Component
 **************************************************/
export default function PodcastListClient() {
  const router = useRouter();
  const toLocale = useLocalizedPath();
  const [isPending, startTransition] = useTransition();
  const {
    deleteDialog,
    deleteMultipleDialog,
    openDeleteDialog,
    closeDeleteDialog,
    openDeleteMultipleDialog,
    closeDeleteMultipleDialog,
  } = useCrudDeleteDialogs<Podcast>();

  // Usa SWR per ottenere i podcasts (cache pre-popolata dal server)
  const { podcasts = [], isLoading } = usePodcasts();

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
  } = useTableState<Podcast>({
    data: podcasts,
    searchKeys: ["title", "slug", "description"],
    itemsPerPage: 10,
    initialSort: { key: "date", direction: "desc" },
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
  } = useTableSelection(tableData, (podcast) => podcast.slug);

  // Clear selection when search or page changes
  useEffect(() => {
    clearSelection();
  }, [search, currentPage, clearSelection]);

  // Get visible column configs
  const visibleColumnConfigs = useMemo(() => {
    return columnConfig.filter((col) => visibleColumns.includes(col.key));
  }, [visibleColumns]);

  function handleEdit(podcast: Podcast) {
    router.push(toLocale(`/admin/podcasts/${podcast.slug}/edit`));
  }

  function handleDeleteClick(podcast: Podcast) {
    openDeleteDialog(podcast);
  }

  async function handleDeleteConfirm() {
    if (!deleteDialog.item) return;

    const { slug } = deleteDialog.item;
    closeDeleteDialog();

    startTransition(async () => {
      const result = await deletePodcastAction(slug);

      if (!result.success) {
        toast.actionResult(result, { errorTitle: adminListCopy.podcasts.deleteErrorTitle });
      } else {
        toast.success(result.message || adminListCopy.podcasts.deleteSuccess);
        mutate("/api/podcasts");
        mutate("/api/github/merge/check");
        clearSelection();
      }
    });
  }

  function handleDeleteMultipleClick() {
    openDeleteMultipleDialog(selectedCount);
  }

  async function handleDeleteMultipleConfirm() {
    if (selectedIds.length === 0) return;

    closeDeleteMultipleDialog();

    startTransition(async () => {
      const result = await deletePodcastsAction(selectedIds);

      if (!result.success) {
        toast.actionResult(result, { errorTitle: adminListCopy.podcasts.deleteManyErrorTitle });
      } else {
        toast.success(result.message || adminListCopy.podcasts.deleteManySuccess);
        mutate("/api/podcasts");
        mutate("/api/github/merge/check");
        clearSelection();
      }
    });
  }

  function renderCell(podcast: Podcast, columnKey: string) {
    switch (columnKey) {
      case "title":
        return <TableCell className="font-medium">{podcast.title}</TableCell>;
      case "slug":
        return (
          <TableCell>
            <span className="text-xs text-secondary/60 font-mono bg-secondary/10 px-2 py-1">
              {podcast.slug}
            </span>
          </TableCell>
        );
      case "date":
        return <TableCell>{new Date(podcast.date).toLocaleDateString("it-IT")}</TableCell>;
      case "published":
        return (
          <TableCell>
            {podcast.published ? (
              <span className="px-2 py-1 text-xs bg-green-100 text-green-700">
                {adminListCopy.podcasts.yes}
              </span>
            ) : (
              <span className="px-2 py-1 text-xs bg-secondary/10 text-secondary/60">
                {adminListCopy.podcasts.no}
              </span>
            )}
          </TableCell>
        );
      case "actions":
        return (
          <TableCell>
            <div className={baseStyles.buttonGroup}>
              <button
                onClick={() => handleEdit(podcast)}
                className={styles.iconButton}
                disabled={isPending}
                aria-label={adminListCopy.common.edit}
                title={adminListCopy.common.edit}
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteClick(podcast)}
                className={cn(styles.iconButton, styles.iconButtonDanger)}
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

  // Mostra loading solo se non ci sono dati (prima richiesta)
  if (isLoading && podcasts.length === 0) {
    return (
      <div className={baseStyles.container}>
        <div className={baseStyles.loadingText}>{adminListCopy.podcasts.loading}</div>
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
              placeholder={adminListCopy.common.searchPodcastPlaceholder}
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
            title={`${totalItems} ${totalItems === 1 ? adminListCopy.podcasts.singular : adminListCopy.podcasts.plural}`}
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
                  ariaLabel={adminListCopy.common.selectAll}
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
                  {adminListCopy.podcasts.empty}
                </TableCell>
              </TableRow>
            ) : (
              tableData.map((podcast) => (
                <TableRow key={podcast.slug}>
                  <TableCell>
                    <TableCheckbox
                      checked={isSelected(podcast.slug)}
                      onChange={() => toggleSelection(podcast.slug)}
                      disabled={isPending}
                      ariaLabel={`Seleziona ${podcast.title}`}
                    />
                  </TableCell>
                  {visibleColumnConfigs.map((column) => (
                    <Fragment key={column.key}>{renderCell(podcast, column.key)}</Fragment>
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
            {selectedCount === 1
              ? adminListCopy.podcasts.selectedSingular
              : adminListCopy.podcasts.selectedPlural}
          </span>
          <button
            onClick={handleDeleteMultipleClick}
            disabled={isPending}
            className={cn(styles.iconButton, styles.iconButtonDanger, "ml-auto")}
            aria-label={adminListCopy.common.deleteSelected}
            title={adminListCopy.common.deleteSelected}
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={clearSelection}
            disabled={isPending}
            className={cn(styles.iconButton)}
            aria-label={adminListCopy.common.deselectAll}
            title={adminListCopy.common.deselectAll}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialog.item && (
        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          onClose={closeDeleteDialog}
          onConfirm={handleDeleteConfirm}
          title={adminListCopy.podcasts.deleteDialogTitle}
          message={adminListCopy.podcasts.deleteDialogMessage(deleteDialog.item?.title ?? "")}
          confirmText={adminListCopy.podcasts.deleteDialogConfirm}
          cancelText={adminListCopy.common.cancel}
          confirmButtonClassName={styles.deleteButton}
          isLoading={isPending}
        />
      )}

      {/* Delete Multiple Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteMultipleDialog.isOpen}
        onClose={closeDeleteMultipleDialog}
        onConfirm={handleDeleteMultipleConfirm}
        title={adminListCopy.podcasts.deleteManyDialogTitle}
        message={adminListCopy.podcasts.deleteManyDialogMessage(deleteMultipleDialog.count)}
        confirmText={adminListCopy.podcasts.deleteDialogConfirm}
        cancelText={adminListCopy.common.cancel}
        confirmButtonClassName={styles.deleteButton}
        isLoading={isPending}
      />
    </div>
  );
}
