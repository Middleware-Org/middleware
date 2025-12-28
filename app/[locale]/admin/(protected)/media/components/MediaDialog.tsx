/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, Trash2, Save } from "lucide-react";
import Image from "next/image";
import { Music, FileJson } from "lucide-react";
import { deleteMediaAction, renameMediaAction } from "../actions";
import { cn } from "@/lib/utils/classes";
import ConfirmDialog from "@/components/molecules/confirmDialog";
import styles from "../styles";
import baseStyles from "../../styles";
import type { MediaFile } from "@/lib/github/media";

/* **************************************************
 * Types
 **************************************************/
interface MediaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  file: MediaFile | null;
}

/* **************************************************
 * Media Dialog Component
 **************************************************/
export default function MediaDialog({ isOpen, onClose, file }: MediaDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<{ message: string; type: "error" | "warning" } | null>(null);
  const [newFilename, setNewFilename] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [jsonContent, setJsonContent] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    if (!isPending) {
      setError(null);
      setNewFilename("");
      onClose();
    }
  }, [isPending, onClose]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape" && !isPending && !showDeleteConfirm) {
        handleClose();
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isPending, showDeleteConfirm, onClose, handleClose]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Initialize filename when file changes
  useEffect(() => {
    if (file) {
      // Remove extension for editing
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setTimeout(() => {
        setNewFilename(nameWithoutExt);
        setError(null);
        setJsonContent(null);
      }, 0);

      // Load JSON content if it's a JSON file
      if (file.type === "json") {
        fetch(file.url)
          .then((res) => res.json())
          .then((data) => {
            setJsonContent(JSON.stringify(data, null, 2));
          })
          .catch(() => {
            setJsonContent("Errore nel caricamento del contenuto JSON");
          });
      }
    }
  }, [file]);

  if (!isOpen || !file) return null;

  async function handleRename() {
    if (!file) {
      setError({ message: "Nessun file selezionato", type: "error" });
      return;
    }

    if (!newFilename.trim()) {
      setError({ message: "Il nome del file non può essere vuoto", type: "error" });
      return;
    }

    // Preserve extension
    const extension = file.name.split(".").pop() || "";
    const finalFilename = `${newFilename.trim()}.${extension}`;

    if (finalFilename === file.name) {
      // No change, just close
      onClose();
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await renameMediaAction(file.name, finalFilename);

      if (!result.success) {
        setError({
          message: result.error,
          type: result.errorType || "error",
        });
      } else {
        router.refresh();
        onClose();
      }
    });
  }

  async function handleDelete() {
    if (!file) return;

    setError(null);
    setShowDeleteConfirm(false);

    startTransition(async () => {
      const result = await deleteMediaAction(file.name);

      if (!result.success) {
        setError({
          message: result.error,
          type: result.errorType || "error",
        });
      } else {
        router.refresh();
        onClose();
      }
    });
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={handleClose}
      />

      {/* Dialog */}
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center p-4",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={cn(
            "bg-primary border border-secondary max-w-4xl w-full max-h-[90vh] overflow-hidden",
            "flex flex-col shadow-lg",
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-secondary">
            <h2 className="text-xl font-semibold">Gestisci File</h2>
            <button
              onClick={handleClose}
              disabled={isPending}
              className="p-1 hover:bg-secondary/10 transition-colors disabled:opacity-50"
              aria-label="Chiudi"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {error && (
              <div
                className={cn(
                  "p-4 border",
                  error.type === "warning" ? baseStyles.errorWarning : baseStyles.error,
                )}
              >
                ⚠️ {error.message}
              </div>
            )}

            {/* Preview */}
            <div>
              <h3 className="text-sm font-medium text-secondary mb-2">Anteprima</h3>
              <div className="border border-secondary bg-secondary/5 p-4">
                {file.type === "image" ? (
                  <div className="relative w-full h-64 flex items-center justify-center">
                    <Image
                      src={file.url}
                      alt={file.name}
                      width={400}
                      height={300}
                      className="max-w-full max-h-full object-contain"
                      unoptimized
                    />
                  </div>
                ) : file.type === "audio" ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center w-full h-32 bg-secondary/10">
                      <Music className="w-16 h-16 text-secondary/60" />
                    </div>
                    <audio controls className="w-full">
                      <source src={file.url} type="audio/mpeg" />
                      <source src={file.url} type="audio/wav" />
                      Il tuo browser non supporta l&apos;elemento audio.
                    </audio>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center w-full h-32 bg-secondary/10">
                      <FileJson className="w-16 h-16 text-secondary/60" />
                    </div>
                    {jsonContent && (
                      <div className="bg-primary border border-secondary p-4 max-h-64 overflow-auto">
                        <pre className="text-xs font-mono text-secondary/80 whitespace-pre-wrap">
                          {jsonContent}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* File Info */}
            <div>
              <h3 className="text-sm font-medium text-secondary mb-2">Informazioni File</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary/60">Nome attuale:</span>
                  <span className="text-secondary font-mono">{file.name}</span>
                </div>
                {file.size && (
                  <div className="flex justify-between">
                    <span className="text-secondary/60">Dimensione:</span>
                    <span className="text-secondary">{(file.size / 1024).toFixed(2)} KB</span>
                  </div>
                )}
                {file.uploadedAt && (
                  <div className="flex justify-between">
                    <span className="text-secondary/60">Caricato il:</span>
                    <span className="text-secondary">
                      {new Date(file.uploadedAt).toLocaleDateString("it-IT")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Rename */}
            <div>
              <label htmlFor="filename" className="block text-sm font-medium text-secondary mb-2">
                Rinomina File
              </label>
              <div className="flex gap-2">
                <input
                  id="filename"
                  type="text"
                  value={newFilename}
                  onChange={(e) => setNewFilename(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleRename();
                    }
                  }}
                  disabled={isPending}
                  className={cn(styles.input, "flex-1")}
                  placeholder="Nome del file (senza estensione)"
                />
                <button
                  onClick={handleRename}
                  disabled={isPending || !newFilename.trim()}
                  className={cn(styles.submitButton, "flex items-center gap-2")}
                >
                  <Save className="w-4 h-4" />
                  Salva
                </button>
              </div>
              <p className="text-xs text-secondary/60 mt-1">
                Estensione: <span className="font-mono">{file.name.split(".").pop()}</span>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 p-4 border-t border-secondary">
            <button onClick={handleClose} disabled={isPending} className={styles.cancelButton}>
              Annulla
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isPending}
              className={cn(styles.deleteButton, "flex items-center gap-2")}
            >
              <Trash2 className="w-4 h-4" />
              Elimina
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Elimina File"
        message={`Sei sicuro di voler eliminare il file "${file?.name}"? Questa azione non può essere annullata.`}
        confirmText="Elimina"
        cancelText="Annulla"
        confirmButtonClassName={styles.deleteButton}
        isLoading={isPending}
      />
    </>
  );
}
