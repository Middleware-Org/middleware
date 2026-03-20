/* **************************************************
 * Imports
 **************************************************/
"use client";

import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { mutate } from "swr";

import ConfirmDialog from "@/components/molecules/confirmDialog";
import { usePodcasts } from "@/hooks/swr";
import { toast } from "@/hooks/use-toast";
import type { Issue } from "@/lib/github/types";
import type { Author } from "@/lib/github/types";
import type { Category } from "@/lib/github/types";
import type { Article } from "@/lib/github/types";
import { useLocalizedPath } from "@/lib/i18n/client";
import { cn } from "@/lib/utils/classes";
import { generateSlug } from "@/lib/utils/slug";

import SelectSearch from "./SelectSearch";
import { adminFormCopy } from "../../components/adminFormCopy";
import baseStyles from "../../styles";
import { deleteArticleAction } from "../actions";
import styles from "../styles";

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
    authorId: string;
    categoryId: string;
    issueId: string;
    in_evidence: boolean;
    published: boolean;
    excerpt: string;
    podcastId?: string;
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
  const toLocale = useLocalizedPath();
  const [isPending] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  // Use null to indicate "not modified by user", otherwise use the user's custom value
  const [slugValue, setSlugValue] = useState<string | null>(null);
  const { podcasts = [] } = usePodcasts();

  // Derive current slug: use modified value if exists, otherwise fall back to article slug
  const currentSlug = slugValue ?? article?.slug ?? "";

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

    setIsDeleteDialogOpen(false);

    startDeleteTransition(async () => {
      const result = await deleteArticleAction(article.slug);

      if (!result.success) {
        toast.actionResult(result, { errorTitle: adminFormCopy.article.deleteErrorTitle });
      } else {
        toast.success(result.message || adminFormCopy.article.deleteSuccess);
        // Invalida la cache SWR per forzare il refetch
        mutate("/api/articles");
        mutate(`/api/articles/${article.slug}`);
        router.push(toLocale("/admin/articles"));
      }
    });
  }

  return (
    <div className={styles.metaPanel}>
      {/* Scrollable Metadata Section */}
      <div className={cn(styles.metaCard, "flex-1 overflow-y-auto min-h-0")}>
        <h3 className={styles.metaCardTitle}>{adminFormCopy.common.metadata}</h3>

        <div className={styles.field}>
          <label htmlFor="title" className={styles.label}>
            {adminFormCopy.article.title}
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
            {editing ? adminFormCopy.common.slugEditable : adminFormCopy.common.slugOptional}
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
                editing
                  ? article?.slug || adminFormCopy.common.slugAuto
                  : adminFormCopy.common.slugAuto
              }
              className={styles.input}
            />
            <button
              type="button"
              onClick={handleGenerateSlug}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-tertiary/10 transition-colors duration-150"
              title={adminFormCopy.common.generateSlug}
            >
              <Sparkles className="w-4 h-4 text-secondary" />
            </button>
          </div>
          {editing && <input type="hidden" name="slug" value={article?.slug || ""} />}
        </div>

        <div className={styles.field}>
          <label htmlFor="date" className={styles.label}>
            {adminFormCopy.article.date}
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
          id="authorId"
          label={adminFormCopy.article.author}
          value={formData.authorId}
          options={authors.map((author) => ({
            value: author.id,
            label: author.name,
          }))}
          onChange={(value) => onFormDataChange("authorId", value)}
          placeholder={adminFormCopy.article.authorPlaceholder}
          required
        />

        <SelectSearch
          id="categoryId"
          label={adminFormCopy.article.category}
          value={formData.categoryId}
          options={categories.map((category) => ({
            value: category.id,
            label: category.name,
          }))}
          onChange={(value) => onFormDataChange("categoryId", value)}
          placeholder={adminFormCopy.article.categoryPlaceholder}
          required
        />

        <SelectSearch
          id="issueId"
          label={adminFormCopy.article.issue}
          value={formData.issueId}
          options={[
            { value: "", label: adminFormCopy.article.noIssue },
            ...issues.map((issue) => ({
              value: issue.id,
              label: issue.title,
            })),
          ]}
          onChange={(value) => onFormDataChange("issueId", value)}
          placeholder={adminFormCopy.article.issuePlaceholder}
        />

        <div className={styles.field}>
          <label htmlFor="excerpt" className={styles.label}>
            {adminFormCopy.article.excerpt}
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
            <span className={styles.label}>{adminFormCopy.article.published}</span>
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
            <span className={styles.label}>{adminFormCopy.article.featured}</span>
          </label>
        </div>

        <SelectSearch
          id="podcastId"
          label={adminFormCopy.article.podcastOptional}
          value={formData.podcastId || ""}
          options={[
            { value: "", label: adminFormCopy.article.noPodcast },
            ...podcasts.map((podcast) => ({
              value: podcast.id,
              label: podcast.title,
            })),
          ]}
          onChange={(value) => onFormDataChange("podcastId", value || "")}
          placeholder={adminFormCopy.article.podcastPlaceholder}
        />
      </div>

      {/* Fixed Actions Section - Always Visible */}
      <div className={cn(styles.metaCard, "shrink-0")}>
        <h3 className={styles.metaCardTitle}>{adminFormCopy.common.actions}</h3>
        <div className={styles.formActions}>
          <button
            type="button"
            onClick={() => {
              formRef.current?.requestSubmit();
            }}
            className={styles.submitButton}
            disabled={isPending}
          >
            {isPending
              ? adminFormCopy.common.save
              : editing
                ? adminFormCopy.common.update
                : adminFormCopy.common.create}
          </button>
          <button
            type="button"
            onClick={() => router.push(toLocale("/admin/articles"))}
            className={styles.cancelButton}
            disabled={isPending}
          >
            {adminFormCopy.common.cancel}
          </button>
          {editing && (
            <div className="flex justify-end w-full">
              <button
                type="button"
                onClick={handleDeleteClick}
                className={styles.deleteButton}
                disabled={isDeleting}
              >
                {adminFormCopy.common.delete}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {editing && article && (
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
          title={adminFormCopy.article.deleteDialogTitle}
          message={adminFormCopy.article.deleteDialogMessage(article.title)}
          confirmText={adminFormCopy.common.delete}
          cancelText={adminFormCopy.common.cancel}
          confirmButtonClassName={styles.deleteButton}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}
