/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { deleteArticleAction } from "../actions";
import ConfirmDialog from "@/components/molecules/confirmDialog";
import styles from "../styles";
import baseStyles from "../../styles";
import type { Article } from "@/lib/github/types";
import type { Category } from "@/lib/github/types";
import type { Author } from "@/lib/github/types";
import type { Issue } from "@/lib/github/types";
import AudioJsonMediaSelector from "./AudioJsonMediaSelector";
import { mutate } from "swr";

/* **************************************************
 * Types
 **************************************************/
interface ArticleMetaPanelProps {
  article?: Article | null;
  categories: Category[];
  authors: Author[];
  issues: Issue[];
  formData: {
    title: string;
    date: string;
    author: string;
    category: string;
    issue: string;
    in_evidence: boolean;
    published: boolean;
    excerpt: string;
    audio?: string;
    audio_chunks?: string;
  };
  onFormDataChange: (field: string, value: string | boolean) => void;
  editing: boolean;
  formRef: React.RefObject<HTMLFormElement | null>;
}

/* **************************************************
 * Article Meta Panel Component
 **************************************************/
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

export default function ArticleMetaPanel({
  article,
  categories,
  authors,
  issues,
  formData,
  onFormDataChange,
  editing,
  formRef,
}: ArticleMetaPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<{ message: string; type: "error" | "warning" } | null>(null);
  const [isAudioSelectorOpen, setIsAudioSelectorOpen] = useState(false);
  const [isAudioChunksSelectorOpen, setIsAudioChunksSelectorOpen] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [slugValue, setSlugValue] = useState(article?.slug || "");

  // Sync slug value when article changes
  useEffect(() => {
    if (article?.slug) {
      setSlugValue(article.slug);
    }
  }, [article?.slug]);

  // Update hidden input when slugValue changes
  useEffect(() => {
    const slugInput = formRef.current?.querySelector('input[name="newSlug"]') as HTMLInputElement;
    if (slugInput) {
      slugInput.value = slugValue;
    }
  }, [slugValue, formRef]);

  // Handler per generare lo slug dal titolo
  function handleGenerateSlug() {
    if (formData.title) {
      const generatedSlug = generateSlug(formData.title);
      setSlugValue(generatedSlug);
      // Aggiorna anche l'input nel form
      const slugInput = formRef.current?.querySelector('input[name="newSlug"]') as HTMLInputElement;
      if (slugInput) {
        slugInput.value = generatedSlug;
      }
    }
  }

  // Handler per aprire il dialog di conferma eliminazione
  function handleDeleteClick() {
    if (article) {
      setIsDeleteDialogOpen(true);
    }
  }

  // Handler per confermare l'eliminazione
  async function handleDeleteConfirm() {
    if (!article) return;

    setError(null);
    setIsDeleteDialogOpen(false);

    startDeleteTransition(async () => {
      const result = await deleteArticleAction(article.slug);

      if (!result.success) {
        setError({
          message: result.error,
          type: result.errorType || "error",
        });
      } else {
        // Invalida la cache SWR per forzare il refetch
        mutate("/api/articles");
        mutate(`/api/articles/${article.slug}`);
        router.push("/admin/articles");
      }
    });
  }

  return (
    <div className={styles.metaPanel}>
      <div className={styles.metaCard}>
        <h3 className={styles.metaCardTitle}>Metadati</h3>

        <div className={styles.field}>
          <label htmlFor="title" className={styles.label}>
            Titolo *
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => onFormDataChange("title", e.target.value)}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="newSlug" className={styles.label}>
            Slug {editing ? "(modificabile)" : "(opzionale)"}
          </label>
          <div className="relative">
            <input
              id="newSlug"
              name="newSlug"
              type="text"
              value={slugValue}
              onChange={(e) => {
                setSlugValue(e.target.value);
              }}
              placeholder={
                editing ? article?.slug || "auto-generato se vuoto" : "auto-generato se vuoto"
              }
              className={styles.input}
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
          {editing && (
            <input type="hidden" name="slug" value={article?.slug || ""} />
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="date" className={styles.label}>
            Data *
          </label>
          <input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => onFormDataChange("date", e.target.value)}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="author" className={styles.label}>
            Autore *
          </label>
          <select
            id="author"
            value={formData.author}
            onChange={(e) => onFormDataChange("author", e.target.value)}
            required
            className={styles.select}
          >
            <option value="">Seleziona un autore</option>
            {authors.map((author) => (
              <option key={author.slug} value={author.slug}>
                {author.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="category" className={styles.label}>
            Categoria *
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => onFormDataChange("category", e.target.value)}
            required
            className={styles.select}
          >
            <option value="">Seleziona una categoria</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="issue" className={styles.label}>
            Issue *
          </label>
          <select
            id="issue"
            value={formData.issue}
            onChange={(e) => onFormDataChange("issue", e.target.value)}
            required
            className={styles.select}
          >
            <option value="">Seleziona un&apos;issue</option>
            {issues.map((issue) => (
              <option key={issue.slug} value={issue.slug}>
                {issue.title}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="excerpt" className={styles.label}>
            Excerpt
          </label>
          <textarea
            id="excerpt"
            value={formData.excerpt}
            onChange={(e) => onFormDataChange("excerpt", e.target.value)}
            className={styles.textarea}
            rows={3}
          />
        </div>

        <div className={styles.field}>
          <label className={`${baseStyles.buttonGroup} cursor-pointer`}>
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) => onFormDataChange("published", e.target.checked)}
              className={styles.checkbox}
            />
            <span className={styles.label}>Pubblicato</span>
          </label>
        </div>

        <div className={styles.field}>
          <label className={`${baseStyles.buttonGroup} cursor-pointer`}>
            <input
              type="checkbox"
              checked={formData.in_evidence}
              onChange={(e) => onFormDataChange("in_evidence", e.target.checked)}
              className={styles.checkbox}
            />
            <span className={styles.label}>In evidenza</span>
          </label>
        </div>

        <div className={styles.field}>
          <label htmlFor="audio" className={styles.label}>
            Audio
          </label>
          <div className={baseStyles.buttonGroup}>
            <input
              id="audio"
              type="text"
              value={formData.audio || ""}
              onChange={(e) => onFormDataChange("audio", e.target.value)}
              placeholder="Nessun file audio selezionato"
              className={styles.input}
              readOnly
            />
            <button
              type="button"
              onClick={() => setIsAudioSelectorOpen(true)}
              className={styles.submitButton}
            >
              Seleziona
            </button>
            {formData.audio && (
              <button
                type="button"
                onClick={() => onFormDataChange("audio", "")}
                className={styles.cancelButton}
              >
                Rimuovi
              </button>
            )}
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="audio_chunks" className={styles.label}>
            JSON Chunk Audio
          </label>
          <div className={baseStyles.buttonGroup}>
            <input
              id="audio_chunks"
              type="text"
              value={formData.audio_chunks || ""}
              onChange={(e) => onFormDataChange("audio_chunks", e.target.value)}
              placeholder="Nessun file JSON selezionato"
              className={styles.input}
              readOnly
            />
            <button
              type="button"
              onClick={() => setIsAudioChunksSelectorOpen(true)}
              className={styles.submitButton}
            >
              Seleziona
            </button>
            {formData.audio_chunks && (
              <button
                type="button"
                onClick={() => onFormDataChange("audio_chunks", "")}
                className={styles.cancelButton}
              >
                Rimuovi
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Audio Selector Modal */}
      <AudioJsonMediaSelector
        isOpen={isAudioSelectorOpen}
        onClose={() => setIsAudioSelectorOpen(false)}
        onSelect={(fileUrl) => {
          onFormDataChange("audio", fileUrl);
        }}
        fileType="audio"
        title="Seleziona Audio"
      />

      {/* Audio Chunks JSON Selector Modal */}
      <AudioJsonMediaSelector
        isOpen={isAudioChunksSelectorOpen}
        onClose={() => setIsAudioChunksSelectorOpen(false)}
        onSelect={(fileUrl) => {
          onFormDataChange("audio_chunks", fileUrl);
        }}
        fileType="json"
        title="Seleziona JSON Chunk Audio"
      />

      <div className={styles.metaCard}>
        <h3 className={styles.metaCardTitle}>Azioni</h3>
        <div className={styles.formActions}>
          <button
            type="button"
            onClick={() => {
              formRef.current?.requestSubmit();
            }}
            className={styles.submitButton}
            disabled={isPending}
          >
            {isPending ? "Salvataggio..." : editing ? "Aggiorna" : "Crea"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/articles")}
            className={styles.cancelButton}
            disabled={isPending}
          >
            Annulla
          </button>
          {editing && (
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
          )}
        </div>

        {editing && article && error && (
          <div className={`mt-4 ${error.type === "warning" ? styles.errorWarning : styles.error}`}>
            ⚠️ {error.message}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {editing && article && (
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Elimina Articolo"
          message={`Sei sicuro di voler eliminare l'articolo "${article.title}"? Questa azione non può essere annullata.`}
          confirmText="Elimina"
          cancelText="Annulla"
          confirmButtonClassName={styles.deleteButton}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}
