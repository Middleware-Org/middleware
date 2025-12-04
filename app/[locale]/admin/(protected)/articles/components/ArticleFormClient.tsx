/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils/classes";
import { createArticleAction, updateArticleAction, type ActionResult } from "../actions";
import ArticleMetaPanel from "./ArticleMetaPanel";
import styles from "../styles";
import baseStyles from "../../styles";
import type { Article } from "@/lib/github/types";
import { useArticle, useAuthors, useCategories, useIssues } from "@/hooks/swr";
import { mutate } from "swr";
// Import dinamico per evitare problemi SSR con Tiptap
const MarkdownEditor = dynamic(() => import("./MarkdownEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0 border border-secondary p-4 bg-primary">
        <div className="animate-pulse text-secondary/60">Caricamento editor...</div>
      </div>
    </div>
  ),
});

/* **************************************************
 * Types
 **************************************************/
interface ArticleFormClientProps {
  articleSlug?: string; // Slug per edit mode
}

/* **************************************************
 * Article Form Client Component
 **************************************************/
export default function ArticleFormClient({ articleSlug }: ArticleFormClientProps) {
  const router = useRouter();
  const editing = !!articleSlug;

  // Usa SWR per ottenere i dati (cache pre-popolata dal server)
  const { article } = useArticle(articleSlug || null);
  const { authors = [] } = useAuthors();
  const { categories = [] } = useCategories();
  const { issues = [] } = useIssues();

  const formRef = useRef<HTMLFormElement>(null);

  // Usa i valori dall'articolo quando disponibili, altrimenti valori di default
  const defaultFormData = {
    title: "",
    date: new Date().toISOString().split("T")[0],
    author: "",
    category: "",
    issue: "",
    in_evidence: false,
    published: false,
    excerpt: "",
    audio: "",
    audio_chunks: "",
  };

  // Inizializza lo stato con i valori dell'articolo se disponibile
  const [content, setContent] = useState<string>(() => article?.content || "");
  const [formData, setFormData] = useState(() =>
    article
      ? {
          title: article.title || "",
          date: article.date || new Date().toISOString().split("T")[0],
          author: article.author || "",
          category: article.category || "",
          issue: article.issue || "",
          in_evidence: article.in_evidence || false,
          published: article.published ?? false,
          excerpt: article.excerpt || "",
          audio: article.audio || "",
          audio_chunks: article.audio_chunks || "",
        }
      : defaultFormData,
  );

  const [state, formAction] = useActionState<ActionResult<Article> | null, FormData>(
    editing ? updateArticleAction : createArticleAction,
    null,
  );

  // Reset form and navigate on success
  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      // Invalida la cache SWR per forzare il refetch della lista
      mutate("/api/articles");
      if (editing && articleSlug) {
        mutate(`/api/articles/${articleSlug}`);
      }
      mutate("/api/github/merge/check");
      router.push("/admin/articles");
    }
  }, [state, router, editing, articleSlug]);

  function handleFormDataChange(field: string, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleAction() {
    const preparedFormData = new FormData();
    preparedFormData.set("title", formData.title);
    preparedFormData.set("date", formData.date);
    preparedFormData.set("author", formData.author);
    preparedFormData.set("category", formData.category);
    preparedFormData.set("issue", formData.issue);
    preparedFormData.set("in_evidence", formData.in_evidence.toString());
    preparedFormData.set("published", formData.published.toString());
    preparedFormData.set("excerpt", formData.excerpt);
    preparedFormData.set("content", content);

    if (formData.audio) {
      preparedFormData.set("audio", formData.audio);
    }
    if (formData.audio_chunks) {
      preparedFormData.set("audio_chunks", formData.audio_chunks);
    }

    if (editing && articleSlug) {
      preparedFormData.set("slug", articleSlug);
      // Aggiungi nuovo slug se presente nel form
      const newSlugInput = formRef.current?.querySelector(
        'input[name="newSlug"]',
      ) as HTMLInputElement;
      if (newSlugInput?.value) {
        preparedFormData.set("newSlug", newSlugInput.value);
      }
    } else {
      // In fase di creazione, aggiungi slug se presente
      const slugInput = formRef.current?.querySelector('input[name="newSlug"]') as HTMLInputElement;
      if (slugInput?.value) {
        preparedFormData.set("slug", slugInput.value);
      }
    }

    return formAction(preparedFormData);
  }

  return (
    <form
      ref={formRef}
      action={handleAction}
      className={cn(baseStyles.formContainer, "flex flex-col h-full")}
    >
      {state && !state.success && (
        <div
          className={`mb-4 ${state.errorType === "warning" ? baseStyles.errorWarning : baseStyles.error}`}
        >
          {state.error}
        </div>
      )}

      {state?.success && state.message && (
        <div className={baseStyles.successMessage}>{state.message}</div>
      )}

      <div className={cn(styles.editorContainer, "flex-1 min-h-0")}>
        {/* Editor Markdown - 3/4 width */}
        <div className={styles.editorWrapper}>
          <MarkdownEditor value={content} onChange={(value) => setContent(value || "")} />
        </div>

        {/* Meta Panel - 1/4 width */}
        {authors.length > 0 && categories.length > 0 && issues.length > 0 && (
          <ArticleMetaPanel
            article={article || null}
            categories={categories}
            authors={authors}
            issues={issues}
            formData={formData}
            onFormDataChange={handleFormDataChange}
            editing={editing}
            formRef={formRef}
          />
        )}
      </div>
    </form>
  );
}
