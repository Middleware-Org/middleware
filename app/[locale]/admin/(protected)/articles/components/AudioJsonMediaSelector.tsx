/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { Search, X, Music, FileJson } from "lucide-react";
import { upload } from "@vercel/blob/client";
import baseStyles from "../../styles";
import styles from "../../media/styles";
import { useMedia } from "@/hooks/swr";
import { mutate } from "swr";
import { cn } from "@/lib/utils/classes";
import type { MediaFile } from "@/lib/github/media";
import MediaDialog from "../../media/components/MediaDialog";

/* **************************************************
 * Types
 **************************************************/
interface AudioJsonMediaSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (fileUrl: string) => void;
  fileType: "audio" | "json";
  title: string;
}

/* **************************************************
 * Audio/JSON Media Selector Component
 **************************************************/
const ITEMS_PER_PAGE = 20;

export default function AudioJsonMediaSelector({
  isOpen,
  onClose,
  onSelect,
  fileType,
  title,
}: AudioJsonMediaSelectorProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filename, setFilename] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [selectedFileForDialog, setSelectedFileForDialog] = useState<MediaFile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Usa SWR per caricare i media files con cache
  const { mediaFiles: allMediaFiles = [], isLoading: loading, isError } = useMedia();

  // Filtra i file per tipo e ricerca
  const filteredMediaFiles = useMemo(() => {
    let filtered = allMediaFiles.filter((file) => file.type === fileType);

    // Filtra per ricerca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (file) =>
          file.name.toLowerCase().includes(query) || file.path.toLowerCase().includes(query),
      );
    }

    return filtered;
  }, [allMediaFiles, fileType, searchQuery]);

  // Reset visible count when search changes
  useEffect(() => {
    setTimeout(() => {
      setVisibleCount(ITEMS_PER_PAGE);
    }, 0);
  }, [searchQuery]);

  // Get visible files
  const visibleFiles = useMemo(() => {
    return filteredMediaFiles.slice(0, visibleCount);
  }, [filteredMediaFiles, visibleCount]);

  const hasMore = visibleCount < filteredMediaFiles.length;

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasMore || !sentinelRef.current || !isOpen) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredMediaFiles.length));
        }
      },
      {
        root: null,
        rootMargin: "100px",
        threshold: 0.1,
      },
    );

    observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, filteredMediaFiles.length, isOpen]);

  const error = isError ? "Failed to load media files" : null;

  function handleSelect(fileUrl: string) {
    onSelect(fileUrl);
    onClose();
  }

  function handleFileClick(file: MediaFile, event: React.MouseEvent) {
    event.stopPropagation();
    setSelectedFileForDialog(file);
    setIsDialogOpen(true);
  }

  function handleDialogClose() {
    setIsDialogOpen(false);
    setSelectedFileForDialog(null);
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (fileType === "audio") {
      if (!file.type.startsWith("audio/") && !file.name.match(/\.(mp3|wav)$/i)) {
        alert("Seleziona un file audio (MP3 o WAV)");
        return;
      }
    } else if (fileType === "json") {
      if (file.type !== "application/json" && !file.name.endsWith(".json")) {
        alert("Seleziona un file JSON");
        return;
      }
    }

    // Validate file size (max 50MB for audio, 10MB for JSON)
    const maxSize = fileType === "audio" ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`La dimensione del file deve essere inferiore a ${maxSize / 1024 / 1024}MB`);
      return;
    }

    // Set filename from file name (without extension)
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    setFilename(nameWithoutExt);

    // Save the original file for upload (more efficient than base64)
    setSelectedFile(file);

    // Create preview as base64 for display only
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreview(base64);
    };
    reader.readAsDataURL(file);
  }

  function handleClick() {
    fileInputRef.current?.click();
  }

  function handleRemove() {
    setPreview(null);
    setSelectedFile(null);
    setFilename("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleUpload() {
    if (!selectedFile) {
      setUploadError(
        `Seleziona un file ${fileType === "audio" ? "audio" : "JSON"} prima di caricare`,
      );
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      // Generate filename
      let finalFilename: string;
      if (filename) {
        const extensions = {
          audio: /\.(mp3|wav)$/i,
          json: /\.json$/i,
        };
        const defaultExt = {
          audio: "mp3",
          json: "json",
        };

        if (!filename.match(extensions[fileType])) {
          finalFilename = `${filename}.${defaultExt[fileType]}`;
        } else {
          finalFilename = filename;
        }
      } else {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 9);
        const extensions = {
          audio: "mp3",
          json: "json",
        };
        finalFilename = `file-${timestamp}-${random}.${extensions[fileType]}`;
      }

      // Upload file directly to Vercel Blob Storage using direct client upload
      const blob = await upload(`media/${finalFilename}`, selectedFile, {
        access: "public",
        contentType:
          selectedFile.type || (fileType === "audio" ? "audio/mpeg" : "application/json"),
        handleUploadUrl: "/api/media/upload-blob",
      });

      setUploadSuccess("File caricato con successo");
      // Invalida la cache SWR per forzare il refetch
      mutate("/api/media");
      // Seleziona automaticamente il file appena caricato
      handleSelect(blob.url);
      // Reset form
      setPreview(null);
      setSelectedFile(null);
      setFilename("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Errore durante il caricamento");
    } finally {
      setUploading(false);
    }
  }

  if (!isOpen) return null;

  const acceptTypes = fileType === "audio" ? "audio/*,.mp3,.wav" : ".json,application/json";
  const fileTypeLabel = fileType === "audio" ? "audio" : "JSON";

  return (
    <div className={baseStyles.modalOverlay}>
      <div className={baseStyles.modalContainer}>
        {/* Header */}
        <div className={baseStyles.modalHeader}>
          <h2 className={baseStyles.modalTitle}>{title}</h2>
          <button type="button" onClick={onClose} className={baseStyles.modalCloseButton}>
            ×
          </button>
        </div>

        {/* Content */}
        <div className={baseStyles.modalContent}>
          {/* Upload Section */}
          <div className="mb-6 p-4 border-b border-secondary">
            <h3 className="text-sm font-semibold text-secondary mb-3">
              Carica Nuovo File {fileTypeLabel.toUpperCase()}
            </h3>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptTypes}
                onChange={handleFileSelect}
                className="hidden"
              />

              {preview ? (
                <div className="relative">
                  <div className="p-4 border border-secondary bg-primary">
                    <p className="text-sm text-secondary">
                      File selezionato: {fileInputRef.current?.files?.[0]?.name || "file"}
                    </p>
                    <p className="text-xs text-secondary/60 mt-1">
                      Dimensione:{" "}
                      {fileInputRef.current?.files?.[0]
                        ? `${(fileInputRef.current.files[0].size / 1024 / 1024).toFixed(2)} MB`
                        : "N/A"}
                    </p>
                  </div>
                  <div className={`mt-2 ${baseStyles.buttonGroup}`}>
                    <input
                      type="text"
                      value={filename}
                      onChange={(e) => setFilename(e.target.value)}
                      placeholder="Nome file (opzionale)"
                      className={styles.input}
                    />
                    <button
                      type="button"
                      onClick={handleUpload}
                      disabled={uploading}
                      className={styles.submitButton}
                    >
                      {uploading ? "Caricamento..." : "Carica"}
                    </button>
                    <button
                      type="button"
                      onClick={handleRemove}
                      className={styles.cancelButton}
                      disabled={uploading}
                    >
                      Annulla
                    </button>
                  </div>
                </div>
              ) : (
                <div onClick={handleClick} className={styles.imageUpload}>
                  <div className="text-center py-8">
                    <p className={baseStyles.textSecondary}>
                      Clicca per selezionare un file {fileTypeLabel}
                    </p>
                    <p className="text-sm text-secondary/60 mt-2">
                      {fileType === "audio" ? "Audio (MP3, WAV)" : "JSON"}
                    </p>
                  </div>
                </div>
              )}

              {uploadError && <div className={`mt-2 ${baseStyles.error}`}>{uploadError}</div>}

              {uploadSuccess && (
                <div className={`mt-2 ${baseStyles.successMessageGreen}`}>{uploadSuccess}</div>
              )}
            </div>
          </div>

          {/* Media List */}
          <div>
            <h3 className="text-sm font-semibold text-secondary mb-3">
              File {fileTypeLabel.toUpperCase()} Disponibili
            </h3>

            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Cerca file ${fileTypeLabel}...`}
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

            {/* Results count */}
            <div className="text-sm text-secondary/60 mb-4">
              {filteredMediaFiles.length === 0 ? (
                "Nessun file trovato"
              ) : (
                <>
                  Mostrando {visibleFiles.length} di {filteredMediaFiles.length} file
                  {allMediaFiles.filter((f) => f.type === fileType).length !==
                    filteredMediaFiles.length &&
                    ` (su ${allMediaFiles.filter((f) => f.type === fileType).length} totali)`}
                </>
              )}
            </div>

            {loading && filteredMediaFiles.length === 0 && (
              <div className={baseStyles.loadingText}>Caricamento file {fileTypeLabel}...</div>
            )}

            {error && <div className={baseStyles.error}>{error}</div>}

            {!loading && !error && filteredMediaFiles.length === 0 && (
              <div className={styles.empty}>
                {searchQuery ? (
                  <>
                    <p>Nessun file corrisponde alla ricerca &quot;{searchQuery}&quot;</p>
                    <p className={baseStyles.emptyStateText}>
                      Prova a modificare i termini di ricerca.
                    </p>
                  </>
                ) : (
                  <>
                    <p>Nessun file {fileTypeLabel} disponibile.</p>
                    <p className={baseStyles.emptyStateText}>
                      Carica il primo file usando il form sopra.
                    </p>
                  </>
                )}
              </div>
            )}

            {!loading && !error && filteredMediaFiles.length > 0 && (
              <>
                <div className={styles.grid}>
                  {visibleFiles.map((file) => (
                    <div key={file.name} className={cn(styles.imageCard, "relative")}>
                      <div>
                        {file.type === "audio" ? (
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
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleSelect(file.url)}
                          className={cn(
                            "flex-1 px-3 py-2 text-sm bg-primary text-secondary hover:bg-primary/90",
                            "border border-secondary transition-all duration-150",
                            "font-medium",
                          )}
                        >
                          Seleziona
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleFileClick(file, e)}
                          className={cn(
                            "flex-1 px-3 py-2 text-sm bg-secondary/10 text-secondary hover:bg-secondary/20",
                            "border border-secondary transition-all duration-150",
                            "font-medium",
                          )}
                        >
                          Gestisci
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sentinel for infinite scroll */}
                {hasMore && (
                  <div
                    ref={sentinelRef}
                    className="w-full h-20 flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <div className="flex items-center gap-2 text-sm text-secondary/60">
                      <div className="w-4 h-4 border-2 border-secondary/30 border-t-secondary/80 rounded-full animate-spin" />
                      <span>Caricamento altri file...</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={baseStyles.modalFooter}>
          <button type="button" onClick={onClose} className={baseStyles.cancelButton}>
            Annulla
          </button>
        </div>
      </div>

      {/* Media Dialog */}
      <MediaDialog isOpen={isDialogOpen} onClose={handleDialogClose} file={selectedFileForDialog} />
    </div>
  );
}
