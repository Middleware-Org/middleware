/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useEffect, useRef, useState, useMemo, useTransition } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import {
  createIssueAction,
  updateIssueAction,
  deleteIssueAction,
  type ActionResult,
} from "../actions";
import { getGitHubImageUrl } from "@/lib/github/images";
import ConfirmDialog from "@/components/molecules/confirmDialog";
import styles from "../styles";
import baseStyles from "../../styles";
import type { Issue } from "@/lib/github/types";
import Image from "next/image";
import { useIssue } from "@/hooks/swr";
import MediaSelector from "../../articles/components/MediaSelector";
import { mutate } from "swr";

/* **************************************************
 * Types
 **************************************************/
interface IssueFormClientProps {
  issueSlug?: string; // Slug per edit mode
}

/* **************************************************
 * Slug Generation Utility (Client-side)
 **************************************************/
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD") // Normalize to decomposed form for handling accents
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
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
  onImageChange: (imageUrl: string) => void;
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

  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);

  // Compute preview URL from currentImage
  const preview = useMemo(() => {
    return getPreviewUrl(currentImage);
  }, [currentImage]);

  function handleClick() {
    setIsMediaSelectorOpen(true);
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation();
    onImageChange("");
  }

  function handleSelectFromMedia(imageUrl: string) {
    // Quando selezioni da media, passa direttamente l'URL (non base64)
    onImageChange(imageUrl);
  }

  return (
    <div>
      <label className={styles.label}>Cover Image *</label>
      <div onClick={handleClick} className={styles.imageUpload} style={{ cursor: "pointer" }}>
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
                className="px-3 py-1 text-sm bg-secondary/10 hover:bg-secondary/20"
              >
                Cambia immagine
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200"
              >
                Rimuovi
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-secondary/80 mb-2">Clicca per selezionare un&apos;immagine</p>
            <p className="text-sm text-secondary/60">
              Scegli da media esistenti o carica una nuova
            </p>
          </div>
        )}
      </div>

      {/* Media Selector Modal */}
      <MediaSelector
        isOpen={isMediaSelectorOpen}
        onClose={() => setIsMediaSelectorOpen(false)}
        onSelect={handleSelectFromMedia}
      />
    </div>
  );
}

/* **************************************************
 * Issue Form Client Component
 **************************************************/
export default function IssueFormClient({ issueSlug }: IssueFormClientProps) {
  const router = useRouter();
  const editing = !!issueSlug;

  // Usa SWR per ottenere l'issue (cache pre-popolata dal server)
  const { issue } = useIssue(issueSlug || null);

  const formRef = useRef<HTMLFormElement>(null);
  // Initialize with existing cover if editing, or empty if creating
  // Usa useMemo per derivare il valore iniziale da issue quando disponibile
  const initialCoverImage = useMemo(() => issue?.cover || "", [issue?.cover]);
  const [coverImage, setCoverImage] = useState<string>(initialCoverImage);
  const [state, formAction] = useActionState<ActionResult<Issue> | null, FormData>(
    editing ? updateIssueAction : createIssueAction,
    null,
  );

  // State per il campo slug (per poterlo aggiornare dinamicamente)
  const [slugValue, setSlugValue] = useState(issue?.slug || "");
  const [deleteError, setDeleteError] = useState<{
    message: string;
    type: "error" | "warning";
  } | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Sincronizza coverImage con issue quando viene caricato (solo se coverImage è ancora vuoto)
  useEffect(() => {
    if (issue?.cover && !coverImage) {
      setCoverImage(issue.cover);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issue?.cover]);

  // Reset form and navigate on success
  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      // Invalida la cache SWR per forzare il refetch della lista
      mutate("/api/issues");
      if (editing && issueSlug) {
        mutate(`/api/issues/${issueSlug}`);
      }
      router.push("/admin/issues");
      // Reset coverImage after navigation
      setTimeout(() => setCoverImage(""), 0);
    }
  }, [state, router, editing, issueSlug]);

  // Update hidden input when coverImage changes
  useEffect(() => {
    const coverInput = formRef.current?.querySelector('input[name="cover"]') as HTMLInputElement;
    if (coverInput) {
      coverInput.value = coverImage;
    }
  }, [coverImage]);

  // Handler per generare lo slug dal titolo
  function handleGenerateSlug() {
    const titleInput = formRef.current?.querySelector('input[name="title"]') as HTMLInputElement;
    const title = titleInput?.value?.trim();

    if (title) {
      const generatedSlug = generateSlug(title);
      setSlugValue(generatedSlug);
    }
  }

  // Handler per aprire il dialog di conferma eliminazione
  function handleDeleteClick() {
    if (issue) {
      setIsDeleteDialogOpen(true);
    }
  }

  // Handler per confermare l'eliminazione
  async function handleDeleteConfirm() {
    if (!issueSlug || !issue) return;

    setDeleteError(null);
    setIsDeleteDialogOpen(false);

    startDeleteTransition(async () => {
      const result = await deleteIssueAction(issueSlug);

      if (!result.success) {
        setDeleteError({
          message: result.error,
          type: result.errorType || "error",
        });
      } else {
        // Invalida la cache SWR per forzare il refetch
        mutate("/api/issues");
        mutate(`/api/issues/${issueSlug}`);
        router.push("/admin/issues");
      }
    });
  }

  return (
    <>
      {state && !state.success && (
        <div className={state.errorType === "warning" ? styles.errorWarning : styles.error}>
          {state.error}
        </div>
      )}

      {deleteError && (
        <div className={deleteError.type === "warning" ? styles.errorWarning : styles.error}>
          ⚠️ {deleteError.message}
        </div>
      )}

      {state?.success && state.message && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700">
          {state.message}
        </div>
      )}

      <form ref={formRef} action={formAction} className={styles.form}>
        <h2 className={styles.formTitle}>{editing ? "Modifica Issue" : "Nuova Issue"}</h2>

        {editing && issueSlug && <input type="hidden" name="slug" value={issueSlug} />}
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

        <div className={styles.field}>
          <label htmlFor={editing ? "newSlug" : "slug"} className={styles.label}>
            Slug {editing ? "(modificabile)" : "(opzionale)"}
          </label>
          <div className="relative">
            <input
              id={editing ? "newSlug" : "slug"}
              name={editing ? "newSlug" : "slug"}
              type="text"
              value={slugValue}
              onChange={(e) => setSlugValue(e.target.value)}
              className={styles.input}
              placeholder={
                editing ? issue?.slug || "auto-generato se vuoto" : "auto-generato se vuoto"
              }
            />
            <button
              type="button"
              onClick={handleGenerateSlug}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-tertiary/10 rounded transition-colors duration-150"
              title="Genera slug dal titolo"
            >
              <Sparkles className="w-4 h-4 text-secondary" />
            </button>
          </div>
        </div>

        <div className={styles.formActions}>
          <SubmitButton editing={editing} />
          {editing && (
            <>
              <button
                type="button"
                onClick={() => router.push("/admin/issues")}
                className={styles.cancelButton}
              >
                Annulla
              </button>
              <div className="flex justify-end w-full">
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  className={styles.deleteButton}
                  disabled={isDeleting}
                >
                  Elimina
                </button>
              </div>
            </>
          )}
        </div>
      </form>

      {/* Delete Confirmation Dialog */}
      {editing && issue && (
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Elimina Issue"
          message={`Sei sicuro di voler eliminare l'issue "${issue.title}"? Questa azione non può essere annullata.`}
          confirmText="Elimina"
          cancelText="Annulla"
          confirmButtonClassName={styles.deleteButton}
          isLoading={isDeleting}
        />
      )}
    </>
  );
}
