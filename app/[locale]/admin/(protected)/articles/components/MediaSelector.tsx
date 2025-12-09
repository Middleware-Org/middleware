/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useState, useRef } from "react";
import { upload } from "@vercel/blob/client";
import Image from "next/image";
import baseStyles from "../../styles";
import styles from "../../media/styles";
import { useMedia } from "@/hooks/swr";
import { mutate } from "swr";

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
export default function MediaSelector({ isOpen, onClose, onSelect }: MediaSelectorProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filename, setFilename] = useState<string>("");

  // Usa SWR per caricare i media files con cache, filtra solo immagini
  const { mediaFiles: allMediaFiles = [], isLoading: loading, isError } = useMedia();
  const mediaFiles = allMediaFiles.filter((file) => file.type === "image");
  const error = isError ? "Failed to load media files" : null;

  function handleSelect(imageUrl: string) {
    onSelect(imageUrl);
    onClose();
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
            {loading && <div className={baseStyles.loadingText}>Caricamento immagini...</div>}

            {error && <div className={baseStyles.error}>{error}</div>}

            {!loading && !error && mediaFiles.length === 0 && (
              <div className={baseStyles.emptyState}>
                Nessuna immagine disponibile. Carica la prima immagine usando il form sopra.
              </div>
            )}

            {!loading && !error && mediaFiles.length > 0 && (
              <div className={baseStyles.mediaGrid}>
                {mediaFiles.map((file) => (
                  <button
                    key={file.name}
                    type="button"
                    onClick={() => handleSelect(file.url)}
                    className={baseStyles.mediaCard}
                  >
                    <div className={baseStyles.mediaCardImage}>
                      <Image
                        src={file.url}
                        alt={file.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className={baseStyles.mediaCardOverlay} />
                    <div className={baseStyles.mediaCardName}>{file.name}</div>
                  </button>
                ))}
              </div>
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
    </div>
  );
}
