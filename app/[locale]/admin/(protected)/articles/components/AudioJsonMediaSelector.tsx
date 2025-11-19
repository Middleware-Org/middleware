/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useEffect, useState, useRef } from "react";
import { uploadMediaAction } from "../../media/actions";
import type { MediaFile } from "@/lib/github/media";
import baseStyles from "../../styles";
import styles from "../../media/styles";
import { useMedia } from "@/hooks/swr";
import { mutate } from "swr";

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
  const [filename, setFilename] = useState<string>("");

  // Usa SWR per caricare i media files con cache
  const { mediaFiles: allMediaFiles = [], isLoading: loading, isError } = useMedia();
  
  // Filtra i file per tipo
  const mediaFiles = allMediaFiles.filter((file) => file.type === fileType);
  const error = isError ? "Failed to load media files" : null;

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
      alert(
        `La dimensione del file deve essere inferiore a ${maxSize / 1024 / 1024}MB`,
      );
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
      setUploadError(`Seleziona un file ${fileType === "audio" ? "audio" : "JSON"} prima di caricare`);
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const formData = new FormData();
      formData.set("file", preview);
      if (filename) {
        formData.set("filename", filename);
      }
      formData.set("fileType", fileType);

      const result = await uploadMediaAction(null, formData);

      if (result.success && result.data) {
        setUploadSuccess(result.message || "File caricato con successo");
        // Invalida la cache SWR per forzare il refetch
        mutate("/api/media");
        // Seleziona automaticamente il file appena caricato
        handleSelect(result.data);
        // Reset form
        setPreview(null);
        setFilename("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else if (!result.success) {
        setUploadError(result.error || "Errore durante il caricamento");
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
  const maxSizeLabel = fileType === "audio" ? "50MB" : "10MB";

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
                  <div className="p-4 border border-secondary rounded bg-primary">
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
                      {fileType === "audio"
                        ? "MP3, WAV (max 50MB)"
                        : "JSON (max 10MB)"}
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
            {loading && (
              <div className={baseStyles.loadingText}>
                Caricamento file {fileTypeLabel}...
              </div>
            )}

            {error && <div className={baseStyles.error}>{error}</div>}

            {!loading && !error && mediaFiles.length === 0 && (
              <div className={baseStyles.emptyState}>
                Nessun file {fileTypeLabel} disponibile. Carica il primo file usando il form sopra.
              </div>
            )}

            {!loading && !error && mediaFiles.length > 0 && (
              <div className="space-y-2">
                {mediaFiles.map((file) => (
                  <button
                    key={file.name}
                    type="button"
                    onClick={() => handleSelect(file.url)}
                    className="w-full p-3 border border-secondary rounded hover:bg-tertiary/10 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-secondary">{file.name}</p>
                        <p className="text-xs text-secondary/60 mt-1">{file.url}</p>
                      </div>
                      <span className="text-xs text-secondary/60">
                        {fileType === "audio" ? "🎵" : "📄"}
                      </span>
                    </div>
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


