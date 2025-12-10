/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { upload } from "@vercel/blob/client";
import { Search, X } from "lucide-react";
import Image from "next/image";
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
interface MediaSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string) => void;
}

/* **************************************************
 * Media Selector Component
 **************************************************/
const ITEMS_PER_PAGE = 20;

export default function MediaSelector({ isOpen, onClose, onSelect }: MediaSelectorProps) {
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

  // Usa SWR per caricare i media files con cache, filtra solo immagini
  const { mediaFiles: allMediaFiles = [], isLoading: loading, isError } = useMedia();

  // Filtra solo immagini e per ricerca
  const filteredFiles = useMemo(() => {
    let filtered = allMediaFiles.filter((file) => file.type === "image");

    // Filtra per ricerca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (file) =>
          file.name.toLowerCase().includes(query) || file.path.toLowerCase().includes(query),
      );
    }

    return filtered;
  }, [allMediaFiles, searchQuery]);

  // Reset visible count when search changes
  useEffect(() => {
    setTimeout(() => {
      setVisibleCount(ITEMS_PER_PAGE);
    }, 0);
  }, [searchQuery]);

  // Get visible files
  const visibleFiles = useMemo(() => {
    return filteredFiles.slice(0, visibleCount);
  }, [filteredFiles, visibleCount]);

  const hasMore = visibleCount < filteredFiles.length;

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasMore || !sentinelRef.current || !isOpen) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredFiles.length));
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
  }, [hasMore, filteredFiles.length, isOpen]);

  const error = isError ? "Failed to load media files" : null;

  function handleSelect(imageUrl: string) {
    onSelect(imageUrl);
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
    if (!file.type.startsWith("image/")) {
      alert("Seleziona un file immagine");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("La dimensione dell'immagine deve essere inferiore a 5MB");
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
      setUploadError("Seleziona un'immagine prima di caricare");
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      // Generate filename
      let finalFilename: string;
      if (filename) {
        if (!filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          finalFilename = `${filename}.jpg`;
        } else {
          finalFilename = filename;
        }
      } else {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 9);
        finalFilename = `file-${timestamp}-${random}.jpg`;
      }

      // Upload file directly to Vercel Blob Storage using direct client upload
      const blob = await upload(`media/${finalFilename}`, selectedFile, {
        access: "public",
        contentType: selectedFile.type || "image/jpeg",
        handleUploadUrl: "/api/media/upload-blob",
      });

      setUploadSuccess("Immagine caricata con successo");
      // Invalida la cache SWR per forzare il refetch
      mutate("/api/media");
      mutate("/api/github/merge/check");
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

  return (
    <div className={baseStyles.modalOverlay}>
      <div className={baseStyles.modalContainer}>
        {/* Header */}
        <div className={baseStyles.modalHeader}>
          <h2 className={baseStyles.modalTitle}>Seleziona Immagine</h2>
          <button type="button" onClick={onClose} className={baseStyles.modalCloseButton}>
            ×
          </button>
        </div>

        {/* Content */}
        <div className={baseStyles.modalContent}>
          {/* Upload Section */}
          <div className="mb-6 p-4 border-b border-secondary">
            <h3 className="text-sm font-semibold text-secondary mb-3">Carica Nuova Immagine</h3>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {preview ? (
                <div className="relative">
                  <div className={styles.imagePreview}>
                    <Image
                      src={preview}
                      alt="Preview"
                      className={styles.imagePreviewImg}
                      width={800}
                      height={500}
                      unoptimized
                    />
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
                      Clicca per selezionare un&apos;immagine
                    </p>
                    <p className="text-sm text-secondary/60 mt-2">JPG, PNG, GIF o WEBP (max 5MB)</p>
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
            <h3 className="text-sm font-semibold text-secondary mb-3">Immagini Disponibili</h3>

            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca immagini per nome..."
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
              {filteredFiles.length === 0 ? (
                "Nessuna immagine trovata"
              ) : (
                <>
                  Mostrando {visibleFiles.length} di {filteredFiles.length} immagini
                  {allMediaFiles.length !== filteredFiles.length &&
                    ` (su ${allMediaFiles.filter((f) => f.type === "image").length} totali)`}
                </>
              )}
            </div>

            {loading && filteredFiles.length === 0 && (
              <div className={baseStyles.loadingText}>Caricamento immagini...</div>
            )}

            {error && <div className={baseStyles.error}>{error}</div>}

            {!loading && !error && filteredFiles.length === 0 && (
              <div className={styles.empty}>
                <p>Nessuna immagine disponibile.</p>
                <p className={baseStyles.emptyStateText}>
                  Carica la prima immagine usando il form sopra.
                </p>
              </div>
            )}

            {!loading && !error && filteredFiles.length > 0 && (
              <>
                <div className={styles.grid}>
                  {visibleFiles.map((file) => (
                    <div
                      key={file.name}
                      className={cn(styles.imageCard, "cursor-pointer relative group")}
                    >
                      <div onClick={() => handleSelect(file.url)}>
                        <Image
                          width={400}
                          height={300}
                          src={file.url}
                          alt={file.name}
                          className={styles.imageCardImg}
                          unoptimized
                        />
                        <div className={styles.imageCardName}>{file.name}</div>
                      </div>
                      <div
                        className={cn(
                          "absolute inset-0 bg-secondary/50 opacity-0 group-hover:opacity-100",
                          "transition-opacity duration-150 flex items-center justify-center gap-2",
                        )}
                        onClick={(e) => handleFileClick(file, e)}
                      >
                        <button
                          type="button"
                          className={cn(
                            "px-3 py-1 text-sm bg-primary/90 text-secondary hover:bg-primary",
                            "border border-secondary transition-all duration-150",
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFileClick(file, e);
                          }}
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
                      <span>Caricamento altre immagini...</span>
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
