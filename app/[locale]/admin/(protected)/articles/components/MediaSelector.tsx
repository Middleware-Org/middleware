/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useState, useRef } from "react";
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
    setFilename("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleUpload() {
    if (!preview) {
      setUploadError("Seleziona un'immagine prima di caricare");
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const formData = new FormData();
      formData.set("file", preview);
      formData.set("fileType", "image");
      if (filename) {
        formData.set("filename", filename);
      }

      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.data) {
        setUploadSuccess(result.message || "Immagine caricata con successo");
        // Invalida la cache SWR per forzare il refetch
        mutate("/api/media");
        mutate("/api/github/merge/check");
        // Seleziona automaticamente il file appena caricato
        handleSelect(result.data);
        // Reset form
        setPreview(null);
        setFilename("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        setUploadError(result.error || "Errore durante il caricamento");
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
