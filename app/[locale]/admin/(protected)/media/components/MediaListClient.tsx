/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useState, useTransition, useMemo } from "react";
import { deleteMediaAction } from "../actions";
import { Music, FileJson, Search, X } from "lucide-react";
import styles from "../styles";
import baseStyles from "../../styles";
import Image from "next/image";
import { useMedia } from "@/hooks/swr";
import { mutate } from "swr";
import { cn } from "@/lib/utils/classes";
import type { MediaFile } from "@/lib/github/media";

/* **************************************************
 * Media List Client Component
 **************************************************/
export default function MediaListClient() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<{ message: string; type: "error" | "warning" } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "image" | "audio" | "json">("all");

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

  async function handleDelete(filename: string) {
    if (!confirm(`Sei sicuro di voler eliminare il file "${filename}"?`)) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await deleteMediaAction(filename);

      if (!result.success) {
        setError({
          message: result.error,
          type: result.errorType || "error",
        });
      } else {
        // Invalida la cache SWR per forzare il refetch
        mutate("/api/media");
        mutate("/api/github/merge/check");
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
        {/* Search Bar */}
        <div className="relative">
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
        {(searchQuery || filterType !== "all") && (
          <div className="text-sm text-secondary/60">
            {filteredFiles.length === 0
              ? "Nessun file trovato"
              : `${filteredFiles.length} file${filteredFiles.length === 1 ? "" : ""} trovati`}
            {mediaFiles.length !== filteredFiles.length && ` (su ${mediaFiles.length} totali)`}
          </div>
        )}
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
        <div className={styles.grid}>
          {filteredFiles.map((file) => (
            <div key={file.name} className={styles.imageCard}>
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
              <div className={styles.imageCardOverlay}>
                <button
                  onClick={() => handleDelete(file.name)}
                  className={styles.deleteButton}
                  disabled={isPending}
                  title={`Elimina ${file.name}`}
                >
                  Elimina
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
