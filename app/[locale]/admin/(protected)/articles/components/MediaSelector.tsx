/* **************************************************
 * Imports
 **************************************************/
"use client";

import { upload } from "@vercel/blob/client";
import { Search, X } from "lucide-react";
import Image from "next/image";
import { useState, useRef, useMemo, useEffect } from "react";
import { mutate } from "swr";

import { useMedia } from "@/hooks/swr";
import { toast } from "@/hooks/use-toast";
import type { ApiMediaFile } from "@/lib/github/types";
import { cn } from "@/lib/utils/classes";

import { adminModalCopy } from "../../components/adminModalCopy";
import { useDialogFocusTrap } from "../../components/useDialogFocusTrap";
import MediaDialog from "../../media/components/MediaDialog";
import styles from "../../media/styles";
import baseStyles from "../../styles";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filename, setFilename] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [selectedFileForDialog, setSelectedFileForDialog] = useState<ApiMediaFile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

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
    setVisibleCount(ITEMS_PER_PAGE);
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

  useEffect(() => {
    if (isError) {
      toast.error(adminModalCopy.mediaSelector.loadError);
    }
  }, [isError]);

  useDialogFocusTrap(isOpen, modalRef, onClose);

  function handleSelect(imageUrl: string) {
    onSelect(imageUrl);
    onClose();
  }

  function handleFileClick(file: ApiMediaFile, event: React.MouseEvent) {
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
      toast.warning(adminModalCopy.mediaSelector.selectImageWarning);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.warning(adminModalCopy.mediaSelector.sizeWarning);
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
      toast.warning(adminModalCopy.mediaSelector.selectBeforeUpload);
      return;
    }

    setUploading(true);

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

      toast.success(adminModalCopy.mediaSelector.uploadSuccess);
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
      toast.error(
        adminModalCopy.mediaSelector.uploadError,
        err instanceof Error ? err.message : undefined,
      );
    } finally {
      setUploading(false);
    }
  }

  if (!isOpen) return null;

  const modalTitleId = "media-selector-title";

  return (
    <div className={baseStyles.modalOverlay}>
      <div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={modalTitleId}
        className={baseStyles.modalContainer}
      >
        {/* Header */}
        <div className={baseStyles.modalHeader}>
          <h2 id={modalTitleId} className={baseStyles.modalTitle}>
            {adminModalCopy.mediaSelector.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={baseStyles.modalCloseButton}
            aria-label={adminModalCopy.mediaSelector.closeAria}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className={baseStyles.modalContent}>
          {/* Upload Section */}
          <div className="mb-6 p-4 border-b border-secondary">
            <h3 className="text-sm font-semibold text-secondary mb-3">
              {adminModalCopy.mediaSelector.uploadTitle}
            </h3>
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
                      alt={adminModalCopy.mediaSelector.previewAlt}
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
                      placeholder={adminModalCopy.common.fileNameOptional}
                      className={styles.input}
                    />
                    <button
                      type="button"
                      onClick={handleUpload}
                      disabled={uploading}
                      className={styles.submitButton}
                    >
                      {uploading ? adminModalCopy.common.uploading : adminModalCopy.common.upload}
                    </button>
                    <button
                      type="button"
                      onClick={handleRemove}
                      className={styles.cancelButton}
                      disabled={uploading}
                    >
                      {adminModalCopy.common.cancel}
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={handleClick}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleClick();
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={adminModalCopy.mediaSelector.selectUploadAria}
                  className={styles.imageUpload}
                >
                  <div className="text-center py-8">
                    <p className={baseStyles.textSecondary}>
                      {adminModalCopy.mediaSelector.clickToSelect}
                    </p>
                    <p className="text-sm text-secondary/60 mt-2">
                      {adminModalCopy.mediaSelector.formatsHint}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Media List */}
          <div>
            <h3 className="text-sm font-semibold text-secondary mb-3">
              {adminModalCopy.mediaSelector.availableImages}
            </h3>

            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={adminModalCopy.mediaSelector.searchPlaceholder}
                className={cn(styles.input, "pl-10 pr-10")}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-secondary/10 transition-colors"
                  title={adminModalCopy.common.clearSearch}
                >
                  <X className="w-4 h-4 text-secondary" />
                </button>
              )}
            </div>

            {/* Results count */}
            <div className="text-sm text-secondary/60 mb-4">
              {filteredFiles.length === 0 ? (
                adminModalCopy.mediaSelector.noImagesFound
              ) : (
                <>
                  {adminModalCopy.mediaSelector.showing} {visibleFiles.length}{" "}
                  {adminModalCopy.mediaSelector.of} {filteredFiles.length}{" "}
                  {adminModalCopy.mediaSelector.images}
                  {allMediaFiles.length !== filteredFiles.length &&
                    ` (${adminModalCopy.mediaSelector.of} ${allMediaFiles.filter((f) => f.type === "image").length} ${adminModalCopy.mediaSelector.totalSuffix})`}
                </>
              )}
            </div>

            {loading && filteredFiles.length === 0 && (
              <div className={baseStyles.loadingText}>{adminModalCopy.mediaSelector.loading}</div>
            )}

            {!loading && !isError && filteredFiles.length === 0 && (
              <div className={styles.empty}>
                <p>{adminModalCopy.mediaSelector.noImageAvailable}</p>
                <p className={baseStyles.emptyStateText}>
                  {adminModalCopy.mediaSelector.noImageHint}
                </p>
              </div>
            )}

            {!loading && !isError && filteredFiles.length > 0 && (
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
                          {adminModalCopy.mediaSelector.manage}
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
                      <span>{adminModalCopy.mediaSelector.loadingMore}</span>
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
            {adminModalCopy.common.cancel}
          </button>
        </div>
      </div>

      {/* Media Dialog */}
      <MediaDialog isOpen={isDialogOpen} onClose={handleDialogClose} file={selectedFileForDialog} />
    </div>
  );
}
