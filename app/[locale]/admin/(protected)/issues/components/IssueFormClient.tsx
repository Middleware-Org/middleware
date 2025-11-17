/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { createIssueAction, updateIssueAction, type ActionResult } from "../actions";
import { getGitHubImageUrl } from "@/lib/github/images";
import styles from "../styles";
import type { Issue } from "@/lib/github/types";
import Image from "next/image";

/* **************************************************
 * Types
 **************************************************/
interface IssueFormClientProps {
  issue?: Issue | null;
}

/* **************************************************
 * Submit Button Component
 **************************************************/
function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={styles.submitButton}>
      {pending ? "Salvataggio..." : editing ? "Aggiorna" : "Crea"}
    </button>
  );
}

/* **************************************************
 * Image Upload Component
 **************************************************/
function ImageUpload({
  currentImage,
  onImageChange,
}: {
  currentImage?: string;
  onImageChange: (base64: string) => void;
}) {
  // If currentImage is a path (not base64), convert it to GitHub URL
  const getPreviewUrl = (image: string | null | undefined): string | null => {
    if (!image) return null;
    // If it's already a data URL or full URL, return as is
    if (image.startsWith("data:") || image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }
    // Otherwise, convert to GitHub URL
    return getGitHubImageUrl(image);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);

  // Compute preview URL from currentImage (for existing images) or uploadedPreview (for new uploads)
  const preview = useMemo(() => {
    return uploadedPreview || getPreviewUrl(currentImage);
  }, [currentImage, uploadedPreview]);

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setUploadedPreview(base64);
      onImageChange(base64);
    };
    reader.readAsDataURL(file);
  }

  function handleClick() {
    fileInputRef.current?.click();
  }

  function handleRemove() {
    setUploadedPreview(null);
    onImageChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div>
      <label className={styles.label}>Cover Image *</label>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
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
  );
}

/* **************************************************
 * Issue Form Client Component
 **************************************************/
export default function IssueFormClient({ issue }: IssueFormClientProps) {
  const router = useRouter();
  const editing = !!issue;
  const formRef = useRef<HTMLFormElement>(null);
  // Initialize with existing cover if editing, or empty if creating
  const [coverImage, setCoverImage] = useState<string>(issue?.cover || "");
  const [state, formAction] = useActionState<ActionResult<Issue> | null, FormData>(
    editing ? updateIssueAction : createIssueAction,
    null,
  );

  // Reset form and navigate on success
  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      router.push("/admin/issues");
      router.refresh();
      // Reset coverImage after navigation
      setTimeout(() => setCoverImage(""), 0);
    }
  }, [state, router]);

  // Update hidden input when coverImage changes
  useEffect(() => {
    const coverInput = formRef.current?.querySelector('input[name="cover"]') as HTMLInputElement;
    if (coverInput) {
      coverInput.value = coverImage;
    }
  }, [coverImage]);

  return (
    <>
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

      <form ref={formRef} action={formAction} className={styles.form}>
        <h2 className={styles.formTitle}>{editing ? "Modifica Issue" : "Nuova Issue"}</h2>

        {editing && <input type="hidden" name="slug" value={issue.slug} />}
        <input type="hidden" name="cover" value={coverImage} />

        <div className={styles.field}>
          <label htmlFor="title" className={styles.label}>
            Titolo *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            defaultValue={issue?.title || ""}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="description" className={styles.label}>
            Descrizione *
          </label>
          <textarea
            id="description"
            name="description"
            defaultValue={issue?.description || ""}
            required
            className={styles.textarea}
            rows={3}
          />
        </div>

        <div className={styles.field}>
          <ImageUpload
            currentImage={coverImage}
            onImageChange={(base64) => setCoverImage(base64)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="color" className={styles.label}>
            Colore *
          </label>
          <input
            id="color"
            name="color"
            type="color"
            defaultValue={issue?.color || "#000000"}
            required
            className="h-10 w-full cursor-pointer"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="date" className={styles.label}>
            Data *
          </label>
          <input
            id="date"
            name="date"
            type="date"
            defaultValue={issue?.date || ""}
            required
            className={styles.input}
          />
        </div>

        {!editing && (
          <div className={styles.field}>
            <label htmlFor="slug" className={styles.label}>
              Slug (opzionale)
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              className={styles.input}
              placeholder="auto-generato se vuoto"
            />
          </div>
        )}

        <div className={styles.formActions}>
          <SubmitButton editing={editing} />
          {editing && (
            <button
              type="button"
              onClick={() => router.push("/admin/issues")}
              className={styles.cancelButton}
            >
              Annulla
            </button>
          )}
        </div>
      </form>
    </>
  );
}
