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
  type ActionResult,
} from "../actions";
import { getGitHubImageUrl } from "@/lib/github/images";
import styles from "../styles";
import type { Issue } from "@/lib/github/types";
import Image from "next/image";
import { useIssue } from "@/hooks/swr";
import AudioJsonMediaSelector from "../../articles/components/AudioJsonMediaSelector";
import IssueMetaPanel from "./IssueMetaPanel";
import { mutate } from "swr";
import { toast } from "@/hooks/use-toast";
import { useLocalizedPath } from "@/lib/i18n/client";
import { cn } from "@/lib/utils/classes";

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
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
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
  const getPreviewUrl = (image: string | null | undefined): string | null => {
    if (!image) return null;
    if (image.startsWith("data:") || image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }
    return getGitHubImageUrl(image);
  };

  const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);

  const preview = useMemo(() => {
    return getPreviewUrl(currentImage);
  }, [currentImage]);

  function handleClick() {
    setIsImageSelectorOpen(true);
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation();
    onImageChange("");
  }

  function handleSelectFromMedia(imageUrl: string) {
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

      <AudioJsonMediaSelector
        isOpen={isImageSelectorOpen}
        onClose={() => setIsImageSelectorOpen(false)}
        onSelect={handleSelectFromMedia}
        fileType="image"
        title="Seleziona Immagine di Copertina"
      />
    </div>
  );
}

/* **************************************************
 * Issue Form Client Component
 **************************************************/
export default function IssueFormClient({ issueSlug }: IssueFormClientProps) {
  const router = useRouter();
  const toLocale = useLocalizedPath();
  const editing = !!issueSlug;

  const { issue } = useIssue(issueSlug || null);

  const formRef = useRef<HTMLFormElement>(null);
  const initialCoverImage = useMemo(() => issue?.cover || "", [issue?.cover]);
  const [coverImage, setCoverImage] = useState<string>(initialCoverImage);
  const [showOrder, setShowOrder] = useState<boolean>(() => issue?.showOrder ?? false);
  const [state, formAction] = useActionState<ActionResult<Issue> | null, FormData>(
    editing ? updateIssueAction : createIssueAction,
    null,
  );

  const [slugValue, setSlugValue] = useState(issue?.slug || "");
  const [, startDeleteTransition] = useTransition();
  void startDeleteTransition;

  // Sync showOrder with loaded issue
  useEffect(() => {
    if (issue?.showOrder !== undefined) {
      setShowOrder(issue.showOrder);
    }
  }, [issue?.showOrder]);

  useEffect(() => {
    if (issue?.cover && !coverImage) {
      setCoverImage(issue.cover);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issue?.cover]);

  useEffect(() => {
    if (!state) return;

    if (!state.success) {
      toast.actionResult(state, { errorTitle: "Operazione non riuscita" });
      return;
    }

    toast.success(state.message || (editing ? "Issue aggiornata" : "Issue creata"));
    formRef.current?.reset();
    mutate("/api/issues");
    if (editing && issueSlug) {
      mutate(`/api/issues/${issueSlug}`);
    }
    mutate("/api/github/merge/check");
    setCoverImage("");
    router.push(toLocale("/admin/issues"));
  }, [state, router, editing, issueSlug, toLocale]);

  useEffect(() => {
    const coverInput = formRef.current?.querySelector('input[name="cover"]') as HTMLInputElement;
    if (coverInput) {
      coverInput.value = coverImage;
    }
  }, [coverImage]);

  function handleGenerateSlug() {
    const titleInput = formRef.current?.querySelector('input[name="title"]') as HTMLInputElement;
    const title = titleInput?.value?.trim();
    if (title) {
      setSlugValue(generateSlug(title));
    }
  }

  const formContent = (
    <>
      {editing && issueSlug && <input type="hidden" name="slug" value={issueSlug} />}
      <input type="hidden" name="cover" value={coverImage} />
      {/* showOrder hidden input synced with state */}
      <input type="hidden" name="showOrder" value={showOrder ? "on" : ""} />

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
        <ImageUpload currentImage={coverImage} onImageChange={(url) => setCoverImage(url)} />
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
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="published"
            defaultChecked={issue?.published ?? false}
            className="w-4 h-4"
          />
          <span className={styles.label}>Pubblicato</span>
        </label>
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
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-tertiary/10 transition-colors duration-150"
            title="Genera slug dal titolo"
          >
            <Sparkles className="w-4 h-4 text-secondary" />
          </button>
        </div>
      </div>

      {/* In create mode: show showOrder checkbox and actions inline */}
      {!editing && (
        <>
          <div className={styles.field}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showOrder}
                onChange={(e) => setShowOrder(e.target.checked)}
                className="w-4 h-4"
              />
              <span className={styles.label}>Mostra numerazione articoli</span>
            </label>
          </div>

          <div className={styles.formActions}>
            <SubmitButton editing={editing} />
            <button
              type="button"
              onClick={() => router.push(toLocale("/admin/issues"))}
              className={styles.cancelButton}
            >
              Annulla
            </button>
          </div>
        </>
      )}
    </>
  );

  if (editing && issue) {
    return (
      <div className={cn(styles.editorContainer, "items-start")}>
        <form ref={formRef} action={formAction} className={cn(styles.form, "flex-1")}>
          <h2 className={styles.formTitle}>Modifica Issue</h2>
          {formContent}
        </form>
        <IssueMetaPanel
          issue={issue}
          issueSlug={issueSlug}
          formRef={formRef}
          showOrder={showOrder}
          onShowOrderChange={setShowOrder}
        />
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className={styles.form}>
      <h2 className={styles.formTitle}>{editing ? "Modifica Issue" : "Nuova Issue"}</h2>
      {formContent}
    </form>
  );
}
