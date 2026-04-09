/* **************************************************
 * Imports
 **************************************************/
"use client";

import { Music, FileJson, Search, X, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState, useMemo, useEffect, useTransition } from "react";
import { mutate } from "swr";

import ConfirmDialog from "@/components/molecules/confirmDialog";
import { TableCheckbox } from "@/components/table/TableCheckbox";
import { useMedia } from "@/hooks/swr";
import { toast } from "@/hooks/use-toast";
import { useTableSelection } from "@/hooks/useTableSelection";
import type { ApiMediaFile } from "@/lib/github/types";
import { cn } from "@/lib/utils/classes";

import MediaDialog from "./MediaDialog";
import { adminListCopy } from "../../components/adminListCopy";
import { useCrudDeleteDialogs } from "../../components/useCrudDeleteDialogs";
import { useInfiniteScrollList } from "../../shared/useInfiniteScrollList";
import baseStyles from "../../styles";
import { deleteMediaFilesAction } from "../actions";
import styles from "../styles";

/* **************************************************
 * Media List Client Component
 **************************************************/
export default function MediaListClient() {
  const [selectedFile, setSelectedFile] = useState<ApiMediaFile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "image" | "audio" | "json">("all");
  const [isPending, startTransition] = useTransition();
  const { deleteMultipleDialog, openDeleteMultipleDialog, closeDeleteMultipleDialog } =
    useCrudDeleteDialogs<ApiMediaFile>();

  // Usa SWR per ottenere i file media (cache pre-popolata dal server)
  const { mediaFiles = [], isLoading } = useMedia();

  // Filtra i file in base alla ricerca e al tipo
  const filteredFiles = useMemo(() => {
    let filtered: ApiMediaFile[] = mediaFiles;
    if (filterType !== "all") {
      filtered = filtered.filter((file) => file.type === filterType);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (file) =>
          file.name.toLowerCase().includes(query) || file.path.toLowerCase().includes(query),
      );
    }
    return filtered;
  }, [mediaFiles, searchQuery, filterType]);

  const {
    visibleItems: visibleFiles,
    hasMore,
    sentinelRef,
    reset: resetScroll,
  } = useInfiniteScrollList(filteredFiles);

  // Multi-selection (scoped to visible files)
  const {
    selectedIds,
    isAllSelected,
    isIndeterminate,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    isSelected,
    selectedCount,
  } = useTableSelection(visibleFiles, (file) => file.name);

  // Clear selection and reset scroll when filters change
  useEffect(() => {
    clearSelection();
    resetScroll();
  }, [searchQuery, filterType, clearSelection, resetScroll]);

  function handleFileClick(file: ApiMediaFile, event?: React.MouseEvent) {
    // If clicking on checkbox, don't open dialog
    if (event && (event.target as HTMLElement).closest('input[type="checkbox"]')) {
      return;
    }
    setSelectedFile(file);
    setIsDialogOpen(true);
  }

  function handleDialogClose() {
    setIsDialogOpen(false);
    setSelectedFile(null);
  }

  function handleDeleteMultipleClick() {
    openDeleteMultipleDialog(selectedCount);
  }

  async function handleDeleteMultipleConfirm() {
    if (selectedIds.length === 0) return;

    closeDeleteMultipleDialog();

    startTransition(async () => {
      const result = await deleteMediaFilesAction(selectedIds);

      if (!result.success) {
        toast.actionResult(result, { errorTitle: adminListCopy.media.deleteManyErrorTitle });
      } else {
        toast.success(result.message || adminListCopy.media.deleteManySuccess);
        // Invalida la cache SWR e attende il refetch
        await Promise.all([mutate("/api/media"), mutate("/api/github/merge/check")]);
        clearSelection();
      }
    });
  }

  // Mostra loading solo se non ci sono dati (prima richiesta)
  if (isLoading && mediaFiles.length === 0) {
    return (
      <div className={baseStyles.container}>
        <div className={baseStyles.loadingText}>{adminListCopy.media.loading}</div>
      </div>
    );
  }

  return (
    <div className={baseStyles.container}>
      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        {/* Search Bar and Select All */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={adminListCopy.media.searchPlaceholder}
              className={cn(styles.input, "pl-10 pr-10")}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-secondary/10 transition-colors"
                title={adminListCopy.media.clearSearch}
              >
                <X className="w-4 h-4 text-secondary" />
              </button>
            )}
          </div>
          {filteredFiles.length > 0 && (
            <div className="flex items-center gap-2">
              <TableCheckbox
                checked={isAllSelected}
                indeterminate={isIndeterminate}
                onChange={toggleSelectAll}
                ariaLabel={adminListCopy.media.selectAllLabel}
              />
              <span className="text-sm text-secondary/60">
                {adminListCopy.media.selectAllLabel}
              </span>
            </div>
          )}
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-secondary/80">{adminListCopy.media.filterByType}</span>
          <div className="flex gap-2">
            {(["all", "image", "audio", "json"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFilterType(type)}
                className={cn(
                  "px-3 py-1 text-sm border transition-all duration-150",
                  filterType === type
                    ? "bg-tertiary text-white border-tertiary"
                    : "border-secondary hover:bg-tertiary/10 hover:border-tertiary",
                )}
              >
                {type === "all"
                  ? adminListCopy.media.filterAll
                  : type === "image"
                    ? adminListCopy.media.filterImages
                    : type === "audio"
                      ? adminListCopy.media.filterAudio
                      : adminListCopy.media.filterJson}
              </button>
            ))}
          </div>
          {(searchQuery || filterType !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setFilterType("all");
              }}
              className="px-3 py-1 text-sm text-secondary/60 hover:text-secondary border border-secondary hover:border-tertiary transition-all duration-150"
            >
              {adminListCopy.media.resetFilters}
            </button>
          )}
        </div>

        {/* Results count */}
        <div className="text-sm text-secondary/60">
          {filteredFiles.length === 0 ? (
            adminListCopy.media.noFileFound
          ) : (
            <>
              {adminListCopy.media.showing} {visibleFiles.length} {adminListCopy.media.of}{" "}
              {filteredFiles.length} {adminListCopy.media.files}
              {mediaFiles.length !== filteredFiles.length &&
                ` (${adminListCopy.media.of} ${mediaFiles.length} ${adminListCopy.media.totalSuffix})`}
            </>
          )}
        </div>
      </div>

      {mediaFiles.length === 0 ? (
        <div className={styles.empty}>
          <p>{adminListCopy.media.emptyTitle}</p>
          <p className={baseStyles.emptyStateText}>{adminListCopy.media.emptyDescription}</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className={styles.empty}>
          <p>{adminListCopy.media.filteredEmptyTitle}</p>
          <p className={baseStyles.emptyStateText}>
            {adminListCopy.media.filteredEmptyDescription}
          </p>
        </div>
      ) : (
        <>
          {/* Bulk Actions */}
          {selectedCount > 0 && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-tertiary/10 border border-tertiary rounded">
              <span className="text-sm text-secondary">
                {selectedCount}{" "}
                {selectedCount === 1
                  ? adminListCopy.media.selectedSingular
                  : adminListCopy.media.selectedPlural}
              </span>
              <button
                onClick={handleDeleteMultipleClick}
                disabled={isPending}
                className={cn(
                  "ml-auto px-3 py-1 text-sm bg-tertiary text-white hover:bg-tertiary/90",
                  "focus:outline-none focus:ring-2 focus:ring-tertiary transition-all duration-150",
                  "disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2",
                )}
                aria-label={adminListCopy.media.deleteSelected}
                title={adminListCopy.media.deleteSelected}
              >
                <Trash2 className="w-4 h-4" />
                {adminListCopy.media.deleteButton}
              </button>
              <button
                onClick={clearSelection}
                disabled={isPending}
                className={cn(
                  "px-3 py-1 text-sm border border-secondary hover:bg-tertiary hover:text-white",
                  "transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-tertiary",
                  "disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2",
                )}
                aria-label={adminListCopy.common.deselectAll}
                title={adminListCopy.common.deselectAll}
              >
                <X className="w-4 h-4" />
                {adminListCopy.media.cancelSelection}
              </button>
            </div>
          )}

          <div className={styles.grid}>
            {visibleFiles.map((file) => {
              const isFileSelected = isSelected(file.name);
              return (
                <div
                  key={file.name}
                  className={cn(
                    styles.imageCard,
                    "cursor-pointer relative",
                    isFileSelected ? "ring-2 ring-tertiary" : "",
                  )}
                  onClick={(e) => handleFileClick(file, e)}
                >
                  {/* Checkbox overlay */}
                  <div className="absolute top-2 left-2 z-10" onClick={(e) => e.stopPropagation()}>
                    <TableCheckbox
                      checked={isFileSelected}
                      onChange={() => toggleSelection(file.name)}
                      disabled={isPending}
                      ariaLabel={`Seleziona ${file.name}`}
                    />
                  </div>

                  {file.type === "image" ? (
                    <Image
                      width={400}
                      height={300}
                      src={file.url}
                      alt={file.name}
                      className={styles.imageCardImg}
                      unoptimized
                    />
                  ) : file.type === "audio" ? (
                    <div className="w-full h-48 bg-secondary/10 flex items-center justify-center">
                      <Music className="w-16 h-16 text-secondary/60" />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-secondary/10 flex items-center justify-center">
                      <FileJson className="w-16 h-16 text-secondary/60" />
                    </div>
                  )}
                  <div className={styles.imageCardName}>{file.name}</div>
                </div>
              );
            })}
          </div>

          {/* Sentinel for infinite scroll */}
          {hasMore && <div ref={sentinelRef} className="w-full h-10" aria-hidden="true" />}
        </>
      )}

      {/* Media Dialog */}
      <MediaDialog isOpen={isDialogOpen} onClose={handleDialogClose} file={selectedFile} />

      {/* Delete Multiple Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteMultipleDialog.isOpen}
        onClose={closeDeleteMultipleDialog}
        onConfirm={handleDeleteMultipleConfirm}
        title={adminListCopy.media.deleteDialogTitle}
        message={adminListCopy.media.deleteDialogMessage(deleteMultipleDialog.count)}
        confirmText={adminListCopy.media.deleteButton}
        cancelText={adminListCopy.common.cancel}
        confirmButtonClassName={styles.deleteButton}
        isLoading={isPending}
      />
    </div>
  );
}
