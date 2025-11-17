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
        router.refresh();
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
      </div>

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
