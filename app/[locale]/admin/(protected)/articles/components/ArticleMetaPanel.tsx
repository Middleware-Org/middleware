/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteArticleAction } from "../actions";
import styles from "../styles";
import baseStyles from "../../styles";
import type { Article } from "@/lib/github/types";
import type { Category } from "@/lib/github/types";
import type { Author } from "@/lib/github/types";
import type { Issue } from "@/lib/github/types";
import AudioJsonMediaSelector from "./AudioJsonMediaSelector";

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

  async function handleDelete() {
    if (!article) return;

    if (!confirm(`Sei sicuro di voler eliminare l&apos;articolo "${article.title}"?`)) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await deleteArticleAction(article.slug);

      if (!result.success) {
        setError({
          message: result.error,
          type: result.errorType || "error",
        });
      } else {
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
          <input
            id="newSlug"
            name="newSlug"
            type="text"
            defaultValue={article?.slug || ""}
            placeholder={editing ? article?.slug || "auto-generato se vuoto" : "auto-generato se vuoto"}
            className={styles.input}
          />
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
        </div>

        {editing && article && (
          <>
            {error && (
              <div
                className={`mt-4 ${error.type === "warning" ? styles.errorWarning : styles.error}`}
              >
                ⚠️ {error.message}
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-secondary">
              <h4 className="text-sm font-semibold mb-2 text-tertiary">Zona Pericolosa</h4>
              <button onClick={handleDelete} className={styles.deleteButton} disabled={isPending}>
                {isPending ? "Eliminazione..." : "Elimina Articolo"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
