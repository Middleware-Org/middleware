/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useRef, useState } from "react";
import type { ActionResult } from "../actions";
import { uploadMediaAction } from "../actions";
import styles from "../styles";
import Image from "next/image";

/* **************************************************
 * Media Upload Client Component
 **************************************************/
export default function MediaUploadClient() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [filename, setFilename] = useState<string>("");
  const [fileType, setFileType] = useState<"image" | "audio" | "json">("image");
  const [state, setState] = useState<ActionResult<string> | null>(null);
  const [isPending, setIsPending] = useState(false);

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Determine file type
    let detectedType: "image" | "audio" | "json" = "image";
    if (file.type.startsWith("image/")) {
      detectedType = "image";
    } else if (
      file.type.startsWith("audio/") ||
      file.name.endsWith(".mp3") ||
      file.name.endsWith(".wav")
    ) {
      detectedType = "audio";
    } else if (file.type === "application/json" || file.name.endsWith(".json")) {
      detectedType = "json";
    } else {
      alert(
        "Formato file non supportato. Usa immagini (JPG, PNG, GIF, WEBP), audio (MP3, WAV) o JSON.",
      );
      return;
    }

    setFileType(detectedType);

    // Validate file size (max 50MB for audio, 10MB for others)
    const maxSize = detectedType === "audio" ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`La dimensione del file deve essere inferiore a ${maxSize / 1024 / 1024}MB`);
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
    if (formRef.current) {
      formRef.current.reset();
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!preview) {
      alert("Seleziona un file prima di caricare");
      return;
    }

    setIsPending(true);
    setState(null);

    try {
      const formData = new FormData();
      formData.set("file", preview);
      formData.set("fileType", fileType);
      if (filename) {
        formData.set("filename", filename);
      }

      const result = await uploadMediaAction(null, formData);

      if (result.success) {
        setState(result);
        // Invalida la cache SWR per forzare il refetch
        const { mutate } = await import("swr");
        mutate("/api/media");
        mutate("/api/github/merge/check");
        setTimeout(() => {
          handleRemove();
          formRef.current?.reset();
        }, 100);
      } else {
        setState({
          success: false,
          error: result.error || "Failed to upload file",
          errorType: result.errorType || "error",
        });
      }
    } catch (error) {
      setState({
        success: false,
        error: error instanceof Error ? error.message : "Failed to upload file",
        errorType: "error",
      });
    } finally {
      setIsPending(false);
    }
  }

  function renderPreview() {
    if (!preview) return null;

    if (fileType === "image") {
      return (
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
      );
    } else if (fileType === "audio") {
      return (
        <div className="p-4 border border-secondary bg-primary">
          <audio controls src={preview} className="w-full">
            Il tuo browser non supporta l&apos;elemento audio.
          </audio>
        </div>
      );
    } else if (fileType === "json") {
      try {
        // Decode base64 and handle UTF-8 encoding correctly
        const base64Data = preview.includes(",") ? preview.split(",")[1] : preview;
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const jsonContent = new TextDecoder("utf-8").decode(bytes);
        const parsed = JSON.parse(jsonContent);
        return (
          <div className="p-4 border border-secondary bg-primary max-h-64 overflow-auto">
            <pre className="text-xs text-secondary whitespace-pre-wrap font-mono">
              {JSON.stringify(parsed, null, 2)}
            </pre>
          </div>
        );
      } catch (err) {
        return (
          <div className="p-4 border border-secondary bg-primary">
            <p className="text-sm text-secondary">File JSON selezionato</p>
            <p className="text-xs text-secondary/60 mt-1">
              {err instanceof Error ? err.message : "Errore nel parsing"}
            </p>
          </div>
        );
      }
    }
    return null;
  }

  return (
    <div className={styles.form}>
      <h2 className={styles.formTitle}>Carica Nuovo File</h2>

      {state && !state.success && (
        <div className={state.errorType === "warning" ? styles.errorWarning : styles.error}>
          {state.error}
        </div>
      )}

      {state?.success && state.message && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700">
          {state.message}
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label}>File *</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,audio/mp3,audio/wav,audio/mpeg,.json,application/json"
            onChange={handleFileSelect}
            className="hidden"
            required
          />
          <div onClick={handleClick} className={styles.imageUpload}>
            {preview ? (
              <div>
                {renderPreview()}
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClick();
                    }}
                    className="px-3 py-1 text-sm bg-secondary/10 hover:bg-secondary/20"
                  >
                    Cambia file
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove();
                    }}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200"
                  >
                    Rimuovi
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-secondary/80 mb-2">Clicca per selezionare un file</p>
                <p className="text-sm text-secondary/60">
                  Immagini (JPG, PNG, GIF, WEBP), Audio (MP3, WAV) o JSON
                </p>
              </div>
            )}
          </div>
        </div>

        {preview && (
          <div className={styles.field}>
            <label htmlFor="filename" className={styles.label}>
              Nome file (opzionale)
            </label>
            <input
              id="filename"
              name="filename"
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className={styles.input}
              placeholder="auto-generato se vuoto"
            />
            <p className="text-xs text-secondary/60 mt-1">
              Se lasciato vuoto, verrà generato un nome univoco automaticamente
            </p>
          </div>
        )}

        {preview && (
          <div className="mt-4">
            <button type="submit" disabled={isPending} className={styles.submitButton}>
              {isPending ? "Caricamento..." : "Carica File"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
