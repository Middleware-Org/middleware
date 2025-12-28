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
import SelectSearch from "./SelectSearch";
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Types
 **************************************************/
interface ArticleMetaPanelProps {
  article?: Article | null;
  categories: Category[];
  authors: Author[];
  issues: Issue[];
  podcasts: Array<{ slug: string; title: string; published: boolean }>;
  formData: {
    title: string;
    date: string;
    author: string;
    category: string;
    issue: string;
    in_evidence: boolean;
    published: boolean;
    excerpt: string;
    podcast?: string;
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
  podcasts,
  formData,
  onFormDataChange,
  editing,
  formRef,
}: ArticleMetaPanelProps) {
  const router = useRouter();
  const [isPending] = useTransition();
  const [error, setError] = useState<{ message: string; type: "error" | "warning" } | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  // Use null to indicate "not modified by user", otherwise use the user's custom value
  const [slugValue, setSlugValue] = useState<string | null>(null);

  // Derive current slug: use modified value if exists, otherwise fall back to article slug
  const currentSlug = slugValue ?? article?.slug ?? "";

  // Update hidden input when currentSlug changes
  useEffect(() => {
    const slugInput = formRef.current?.querySelector('input[name="newSlug"]') as HTMLInputElement;
    if (slugInput) {
      slugInput.value = currentSlug;
    }
  }, [currentSlug, formRef]);

  // Handler per generare lo slug dal titolo
  function handleGenerateSlug() {
    if (formData.title) {
      const generatedSlug = generateSlug(formData.title);
      setSlugValue(generatedSlug);
      // The useEffect will automatically update the hidden input
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
        router.push("/admin/articles");
        router.refresh();
      }
    });
  }

  return (
    <div className={styles.metaPanel}>
      {/* Scrollable Metadata Section */}
      <div className={cn(styles.metaCard, "flex-1 overflow-y-auto min-h-0")}>
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
              value={currentSlug}
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
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-tertiary/10 transition-colors duration-150"
              title="Genera slug dal titolo"
            >
              <Sparkles className="w-4 h-4 text-secondary" />
            </button>
          </div>
          {editing && <input type="hidden" name="slug" value={article?.slug || ""} />}
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

        <SelectSearch
          id="author"
          label="Autore"
          value={formData.author}
          options={authors.map((author) => ({
            value: author.slug,
            label: author.name,
          }))}
          onChange={(value) => onFormDataChange("author", value)}
          placeholder="Seleziona un autore"
          required
        />

        <SelectSearch
          id="category"
          label="Categoria"
          value={formData.category}
          options={categories.map((category) => ({
            value: category.slug,
            label: category.name,
          }))}
          onChange={(value) => onFormDataChange("category", value)}
          placeholder="Seleziona una categoria"
          required
        />

        <SelectSearch
          id="issue"
          label="Issue"
          value={formData.issue}
          options={issues.map((issue) => ({
            value: issue.slug,
            label: issue.title,
          }))}
          onChange={(value) => onFormDataChange("issue", value)}
          placeholder="Seleziona un'issue"
          required
        />

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

        <SelectSearch
          id="podcast"
          label="Podcast (opzionale)"
          value={formData.podcast || ""}
          options={[
            { value: "", label: "Nessun podcast" },
            ...podcasts.map((podcast) => ({
              value: podcast.slug,
              label: podcast.title,
            })),
          ]}
          onChange={(value) => onFormDataChange("podcast", value || "")}
          placeholder="Seleziona un podcast"
        />
      </div>

      {/* Fixed Actions Section - Always Visible */}
      <div className={cn(styles.metaCard, "shrink-0")}>
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
