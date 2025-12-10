/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Music, FileJson, Search, X } from "lucide-react";
import styles from "../styles";
import baseStyles from "../../styles";
import Image from "next/image";
import { useMedia } from "@/hooks/swr";
import { cn } from "@/lib/utils/classes";
import type { MediaFile } from "@/lib/github/media";
import MediaDialog from "./MediaDialog";

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

  function handleFileClick(file: MediaFile) {
    setSelectedFile(file);
    setIsDialogOpen(true);
  }

  function handleDialogClose() {
    setIsDialogOpen(false);
    setSelectedFile(null);
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
          <div className={styles.grid}>
            {visibleFiles.map((file) => (
              <div
                key={file.name}
                className={cn(styles.imageCard, "cursor-pointer")}
                onClick={() => handleFileClick(file)}
              >
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
            ))}
          </div>
        </>
      )}

      {/* Media Dialog */}
      <MediaDialog isOpen={isDialogOpen} onClose={handleDialogClose} file={selectedFile} />
    </div>
  );
}
