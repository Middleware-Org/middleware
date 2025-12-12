/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useState, useMemo, useEffect, useRef, useTransition } from "react";
import { Music, FileJson, Search, X, Trash2 } from "lucide-react";
import styles from "../styles";
import baseStyles from "../../styles";
import Image from "next/image";
import { useMedia } from "@/hooks/swr";
import { cn } from "@/lib/utils/classes";
import type { MediaFile } from "@/lib/github/media";
import MediaDialog from "./MediaDialog";
import { useTableSelection } from "@/hooks/useTableSelection";
import { TableCheckbox } from "@/components/table/TableCheckbox";
import { deleteMediaFilesAction } from "../actions";
import { mutate } from "swr";
import ConfirmDialog from "@/components/molecules/confirmDialog";

/* **************************************************
 * Media List Client Component
 **************************************************/
const ITEMS_PER_PAGE = 20;

export default function MediaListClient() {
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "image" | "audio" | "json">("all");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<{ message: string; type: "error" | "warning" } | null>(null);
  const [deleteMultipleDialog, setDeleteMultipleDialog] = useState<{
    isOpen: boolean;
    count: number;
  }>({
    isOpen: false,
    count: 0,
  });

  // Usa SWR per ottenere i file media (cache pre-popolata dal server)
  const { mediaFiles = [], isLoading } = useMedia();

  // Filtra i file in base alla ricerca e al tipo
  const filteredFiles = useMemo(() => {
    let filtered: MediaFile[] = mediaFiles;

    // Filtra per tipo
    if (filterType !== "all") {
      filtered = filtered.filter((file) => file.type === filterType);
    }

    // Filtra per ricerca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (file) =>
          file.name.toLowerCase().includes(query) || file.path.toLowerCase().includes(query),
      );
    }

    return filtered;
  }, [mediaFiles, searchQuery, filterType]);

  // Reset visible count when filters change
  useEffect(() => {
    setTimeout(() => {
      setVisibleCount(ITEMS_PER_PAGE);
    }, 0);
  }, [searchQuery, filterType]);

  // Get visible files
  const visibleFiles = useMemo(() => {
    return filteredFiles.slice(0, visibleCount);
  }, [filteredFiles, visibleCount]);

  const hasMore = visibleCount < filteredFiles.length;

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
  } = useTableSelection(visibleFiles, (file) => file.name);

  // Clear selection when filters change
  useEffect(() => {
    clearSelection();
  }, [searchQuery, filterType, clearSelection]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasMore || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredFiles.length));
        }
      },
      {
        root: null,
        rootMargin: "100px", // Start loading 100px before reaching the sentinel
        threshold: 0.1,
      },
    );

    observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, filteredFiles.length]);

  function handleFileClick(file: MediaFile, event?: React.MouseEvent) {
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
    if (selectedCount === 0) return;
    setDeleteMultipleDialog({ isOpen: true, count: selectedCount });
  }

  async function handleDeleteMultipleConfirm() {
    if (selectedIds.length === 0) return;

    setError(null);
    setDeleteMultipleDialog({ isOpen: false, count: 0 });

    startTransition(async () => {
      const result = await deleteMediaFilesAction(selectedIds);

      if (!result.success) {
        setError({
          message: result.error,
          type: result.errorType || "error",
        });
      } else {
        // Invalida la cache SWR per forzare il refetch
        mutate("/api/media");
        mutate("/api/github/merge/check");
        clearSelection();
      }
    });
  }

  // Mostra loading solo se non ci sono dati (prima richiesta)
  if (isLoading && mediaFiles.length === 0) {
    return (
      <div className={baseStyles.container}>
        <div className={baseStyles.loadingText}>Caricamento file media...</div>
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
              placeholder="Cerca file per nome..."
              className={cn(styles.input, "pl-10 pr-10")}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-secondary/10 transition-colors"
                title="Pulisci ricerca"
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
                ariaLabel="Seleziona tutti"
              />
              <span className="text-sm text-secondary/60">Seleziona tutti</span>
            </div>
          )}
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-secondary/80">Filtra per tipo:</span>
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
                  ? "Tutti"
                  : type === "image"
                    ? "Immagini"
                    : type === "audio"
                      ? "Audio"
                      : "JSON"}
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
              Reset filtri
            </button>
          )}
        </div>

        {/* Results count */}
        <div className="text-sm text-secondary/60">
          {filteredFiles.length === 0 ? (
            "Nessun file trovato"
          ) : (
            <>
              Mostrando {visibleFiles.length} di {filteredFiles.length} file
              {mediaFiles.length !== filteredFiles.length && ` (su ${mediaFiles.length} totali)`}
            </>
          )}
        </div>
      </div>

      {mediaFiles.length === 0 ? (
        <div className={styles.empty}>
          <p>Nessun file trovato.</p>
          <p className={baseStyles.emptyStateText}>
            Carica il tuo primo file usando il form sopra.
          </p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className={styles.empty}>
          <p>Nessun file corrisponde ai filtri selezionati.</p>
          <p className={baseStyles.emptyStateText}>
            Prova a modificare la ricerca o il filtro tipo.
          </p>
        </div>
      ) : (
        <>
          {/* Bulk Actions */}
          {selectedCount > 0 && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-tertiary/10 border border-tertiary rounded">
              <span className="text-sm text-secondary">
                {selectedCount} {selectedCount === 1 ? "file selezionato" : "file selezionati"}
              </span>
              <button
                onClick={handleDeleteMultipleClick}
                disabled={isPending}
                className={cn(
                  "ml-auto px-3 py-1 text-sm bg-tertiary text-white hover:bg-tertiary/90",
                  "focus:outline-none focus:ring-2 focus:ring-tertiary transition-all duration-150",
                  "disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2",
                )}
                aria-label="Elimina selezionati"
                title="Elimina selezionati"
              >
                <Trash2 className="w-4 h-4" />
                Elimina
              </button>
              <button
                onClick={clearSelection}
                disabled={isPending}
                className={cn(
                  "px-3 py-1 text-sm border border-secondary hover:bg-tertiary hover:text-white",
                  "transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-tertiary",
                  "disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2",
                )}
                aria-label="Deseleziona tutto"
                title="Deseleziona tutto"
              >
                <X className="w-4 h-4" />
                Annulla
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
                    isFileSelected && "ring-2 ring-tertiary",
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
        </>
      )}

      {/* Media Dialog */}
      <MediaDialog isOpen={isDialogOpen} onClose={handleDialogClose} file={selectedFile} />

      {/* Delete Multiple Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteMultipleDialog.isOpen}
        onClose={() => setDeleteMultipleDialog({ isOpen: false, count: 0 })}
        onConfirm={handleDeleteMultipleConfirm}
        title="Elimina File"
        message={`Sei sicuro di voler eliminare ${deleteMultipleDialog.count} file? Questa azione non può essere annullata.`}
        confirmText="Elimina"
        cancelText="Annulla"
        confirmButtonClassName={styles.deleteButton}
        isLoading={isPending}
      />
    </div>
  );
}
