/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useRef, useState, useEffect } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { uploadMediaAction, type ActionResult } from "../actions";
import styles from "../styles";
import Image from "next/image";

/* **************************************************
 * Submit Button Component
 **************************************************/
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={styles.submitButton}>
      {pending ? "Caricamento..." : "Carica Immagine"}
    </button>
  );
}

/* **************************************************
 * Media Upload Client Component
 **************************************************/
export default function MediaUploadClient() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [filename, setFilename] = useState<string>("");
  const [state, formAction] = useActionState<ActionResult<string> | null, FormData>(
    uploadMediaAction,
    null,
  );

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
    if (formRef.current) {
      formRef.current.reset();
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!preview) {
      alert("Seleziona un'immagine prima di caricare");
      return;
    }

    const formData = new FormData(event.currentTarget);
    formData.set("image", preview);
    if (filename) {
      formData.set("filename", filename);
    }

    formAction(formData);
  }

  // Reset form on success
  useEffect(() => {
    if (state?.success) {
      setTimeout(() => {
        handleRemove();
        formRef.current?.reset();
      }, 100);
    }
  }, [state?.success]);

  return (
    <div className={styles.form}>
      <h2 className={styles.formTitle}>Carica Nuova Immagine</h2>

      {state && !state.success && (
        <div className={state.errorType === "warning" ? styles.errorWarning : styles.error}>
          {state.error}
        </div>
      )}

      {state?.success && state.message && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
          {state.message}
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label}>Immagine *</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            required
          />
          <div onClick={handleClick} className={styles.imageUpload}>
            {preview ? (
              <div className={styles.imagePreview}>
                <Image
                  src={preview}
                  alt="Preview"
                  className={styles.imagePreviewImg}
                  width={800}
                  height={500}
                  unoptimized
                />
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClick();
                    }}
                    className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                  >
                    Cambia immagine
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove();
                    }}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Rimuovi
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-2">Clicca per selezionare un&apos;immagine</p>
                <p className="text-sm text-gray-500">JPG, PNG, GIF o WEBP (max 5MB)</p>
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
            <p className="text-xs text-gray-500 mt-1">
              Se lasciato vuoto, verrà generato un nome univoco automaticamente
            </p>
          </div>
        )}

        {preview && (
          <div className="mt-4">
            <SubmitButton />
          </div>
        )}
      </form>
    </div>
  );
}
