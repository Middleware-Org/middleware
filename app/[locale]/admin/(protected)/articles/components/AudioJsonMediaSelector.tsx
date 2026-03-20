/* **************************************************
 * Imports
 **************************************************/
"use client";

import { upload } from "@vercel/blob/client";
import { Search, X, Music, FileJson } from "lucide-react";
import Image from "next/image";
import { useState, useRef, useMemo, useEffect } from "react";
import { mutate } from "swr";

import { useMedia } from "@/hooks/swr";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils/classes";

import { adminModalCopy } from "../../components/adminModalCopy";
import { useDialogFocusTrap } from "../../components/useDialogFocusTrap";
import styles from "../../media/styles";
import baseStyles from "../../styles";

/* **************************************************
 * Types
 **************************************************/
interface AudioJsonMediaSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (fileUrl: string) => void;
  fileType: "audio" | "json" | "image";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filename, setFilename] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

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
    setVisibleCount(ITEMS_PER_PAGE);
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

  useEffect(() => {
    if (isError) {
      toast.error(adminModalCopy.audioJsonSelector.loadError);
    }
  }, [isError]);

  useDialogFocusTrap(isOpen, modalRef, onClose);

  function handleSelect(fileUrl: string) {
    onSelect(fileUrl);
    onClose();
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (fileType === "audio") {
      if (!file.type.startsWith("audio/") && !file.name.match(/\.(mp3|wav)$/i)) {
        toast.warning(adminModalCopy.audioJsonSelector.invalidAudio);
        return;
      }
    } else if (fileType === "json") {
      if (file.type !== "application/json" && !file.name.endsWith(".json")) {
        toast.warning(adminModalCopy.audioJsonSelector.invalidJson);
        return;
      }
    } else if (fileType === "image") {
      if (!file.type.startsWith("image/") && !file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        toast.warning(adminModalCopy.audioJsonSelector.invalidImage);
        return;
      }
    }

    // Validate file size (max 50MB for audio, 10MB for JSON, 20MB for images)
    const maxSize =
      fileType === "audio"
        ? 50 * 1024 * 1024
        : fileType === "json"
          ? 10 * 1024 * 1024
          : 20 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.warning(adminModalCopy.audioJsonSelector.sizeWarning(maxSize / 1024 / 1024));
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
      toast.warning(adminModalCopy.audioJsonSelector.selectBeforeUpload(fileTypeLabel));
      return;
    }

    setUploading(true);

    try {
      // Generate filename
      let finalFilename: string;
      if (filename) {
        const extensions = {
          audio: /\.(mp3|wav)$/i,
          json: /\.json$/i,
          image: /\.(jpg|jpeg|png|gif|webp|svg)$/i,
        };
        const defaultExt = {
          audio: "mp3",
          json: "json",
          image: "jpg",
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
          image: "jpg",
        };
        finalFilename = `file-${timestamp}-${random}.${extensions[fileType]}`;
      }

      // Upload file directly to Vercel Blob Storage using direct client upload
      const contentTypeMap = {
        audio: "audio/mpeg",
        json: "application/json",
        image: "image/jpeg",
      };
      const blob = await upload(`media/${finalFilename}`, selectedFile, {
        access: "public",
        contentType: selectedFile.type || contentTypeMap[fileType],
        handleUploadUrl: "/api/media/upload-blob",
      });

      toast.success(adminModalCopy.audioJsonSelector.uploadSuccess);
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
      toast.error(
        adminModalCopy.audioJsonSelector.uploadError,
        err instanceof Error ? err.message : undefined,
      );
    } finally {
      setUploading(false);
    }
  }

  if (!isOpen) return null;

  const modalTitleId = "audio-json-selector-title";

  const acceptTypes =
    fileType === "audio"
      ? "audio/*,.mp3,.wav"
      : fileType === "json"
        ? ".json,application/json"
        : "image/*,.jpg,.jpeg,.png,.gif,.webp,.svg";
  const fileTypeLabel = fileType === "audio" ? "audio" : fileType === "json" ? "JSON" : "immagine";

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
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={baseStyles.modalCloseButton}
            aria-label={adminModalCopy.audioJsonSelector.closeAria}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className={baseStyles.modalContent}>
          {/* Upload Section */}
          <div className="mb-6 p-4 border-b border-secondary">
            <h3 className="text-sm font-semibold text-secondary mb-3">
              {adminModalCopy.audioJsonSelector.uploadTitle(fileTypeLabel.toUpperCase())}
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
                      {adminModalCopy.audioJsonSelector.selectedFile}{" "}
                      {fileInputRef.current?.files?.[0]?.name || "file"}
                    </p>
                    <p className="text-xs text-secondary/60 mt-1">
                      {adminModalCopy.audioJsonSelector.fileSize}{" "}
                      {fileInputRef.current?.files?.[0]
                        ? `${(fileInputRef.current.files[0].size / 1024 / 1024).toFixed(2)} MB`
                        : adminModalCopy.audioJsonSelector.notAvailable}
                    </p>
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
                  aria-label={adminModalCopy.audioJsonSelector.selectUploadAria(fileTypeLabel)}
                  className={styles.imageUpload}
                >
                  <div className="text-center py-8">
                    <p className={baseStyles.textSecondary}>
                      {adminModalCopy.audioJsonSelector.clickToSelect(fileTypeLabel)}
                    </p>
                    <p className="text-sm text-secondary/60 mt-2">
                      {adminModalCopy.audioJsonSelector.typeHint(fileType)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Media List */}
          <div>
            <h3 className="text-sm font-semibold text-secondary mb-3">
              {adminModalCopy.audioJsonSelector.availableFiles(fileTypeLabel.toUpperCase())}
            </h3>

            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={adminModalCopy.audioJsonSelector.searchPlaceholder(fileTypeLabel)}
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
              {filteredMediaFiles.length === 0 ? (
                adminModalCopy.audioJsonSelector.noFilesFound
              ) : (
                <>
                  {adminModalCopy.audioJsonSelector.showing} {visibleFiles.length}{" "}
                  {adminModalCopy.audioJsonSelector.of} {filteredMediaFiles.length}{" "}
                  {adminModalCopy.audioJsonSelector.files}
                  {allMediaFiles.filter((f) => f.type === fileType).length !==
                    filteredMediaFiles.length &&
                    ` (${adminModalCopy.audioJsonSelector.of} ${allMediaFiles.filter((f) => f.type === fileType).length} ${adminModalCopy.audioJsonSelector.totalSuffix})`}
                </>
              )}
            </div>

            {loading && filteredMediaFiles.length === 0 && (
              <div className={baseStyles.loadingText}>
                {adminModalCopy.audioJsonSelector.loading(fileTypeLabel)}
              </div>
            )}

            {!loading && !isError && filteredMediaFiles.length === 0 && (
              <div className={styles.empty}>
                {searchQuery ? (
                  <>
                    <p>{adminModalCopy.audioJsonSelector.noSearchResult(searchQuery)}</p>
                    <p className={baseStyles.emptyStateText}>
                      {adminModalCopy.audioJsonSelector.noSearchHint}
                    </p>
                  </>
                ) : (
                  <>
                    <p>{adminModalCopy.audioJsonSelector.noFileAvailable(fileTypeLabel)}</p>
                    <p className={baseStyles.emptyStateText}>
                      {adminModalCopy.audioJsonSelector.noFileHint}
                    </p>
                  </>
                )}
              </div>
            )}

            {!loading && !isError && filteredMediaFiles.length > 0 && (
              <>
                <div className={styles.grid}>
                  {visibleFiles.map((file) => (
                    <div
                      key={file.name}
                      onClick={() => handleSelect(file.url)}
                      className={cn(styles.imageCard, "cursor-pointer flex flex-col")}
                    >
                      {/* Icon/Image Area */}
                      <div className="w-full h-48 bg-secondary/10 flex items-center justify-center overflow-hidden">
                        {file.type === "image" ? (
                          <Image
                            src={file.url}
                            alt={file.name}
                            width={192}
                            height={192}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        ) : file.type === "audio" ? (
                          <Music className="w-16 h-16 text-secondary/60" />
                        ) : (
                          <FileJson className="w-16 h-16 text-secondary/60" />
                        )}
                      </div>

                      {/* File Name */}
                      <div className={styles.imageCardName}>{file.name}</div>
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
                      <div className="w-4 h-4 border-2 border-secondary/30 border-t-secondary/80 animate-spin" />
                      <span>{adminModalCopy.common.loadingMoreFiles}</span>
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
    </div>
  );
}
