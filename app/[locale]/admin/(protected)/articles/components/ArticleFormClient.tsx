/* **************************************************
 * Imports
 **************************************************/
"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { mutate } from "swr";

import { useArticle, useAuthors, useCategories, useIssues } from "@/hooks/swr";
import { toast } from "@/hooks/use-toast";
import type { ActionResult } from "@/lib/actions/types";
import type { Article } from "@/lib/github/types";
import { useLocalizedPath } from "@/lib/i18n/client";
import { cn } from "@/lib/utils/classes";

import { adminFormCopy } from "../../components/adminFormCopy";
import { createArticleAction, updateArticleAction } from "../actions";
import ArticleMetaPanel from "./ArticleMetaPanel";
import baseStyles from "../../styles";
import styles from "../styles";

// Import dinamico per evitare problemi SSR con Tiptap
const MarkdownEditor = dynamic(() => import("./MarkdownEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0 border border-secondary p-4 bg-primary">
        <div className="animate-pulse text-secondary/60">{adminFormCopy.common.editorLoading}</div>
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
  const toLocale = useLocalizedPath();
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
    authorId: "",
    categoryId: "",
    issueId: "",
    in_evidence: false,
    published: false,
    excerpt: "",
    podcastId: "",
  };

  // Inizializza lo stato con i valori dell'articolo se disponibile
  const [content, setContent] = useState<string>(() => article?.content || "");
  const [formData, setFormData] = useState(() =>
    article
      ? {
          title: article.title || "",
          date: article.date || new Date().toISOString().split("T")[0],
          authorId: article.authorId || "",
          categoryId: article.categoryId || "",
          issueId: article.issueId || "",
          in_evidence: article.in_evidence || false,
          published: article.published ?? false,
          excerpt: article.excerpt || "",
          podcastId: article.podcastId || "",
        }
      : defaultFormData,
  );

  const [state, formAction] = useActionState<ActionResult<Article> | null, FormData>(
    editing ? updateArticleAction : createArticleAction,
    null,
  );
  const handledStateRef = useRef<ActionResult<Article> | null>(null);

  // Reset form and navigate on success
  useEffect(() => {
    if (!state) {
      return;
    }
    if (handledStateRef.current === state) {
      return;
    }
    handledStateRef.current = state;

    if (!state.success) {
      toast.actionResult(state, { errorTitle: "Operazione non riuscita" });
      return;
    }

    toast.success(state.message || (editing ? "Articolo aggiornato" : "Articolo creato"));
    formRef.current?.reset();
    mutate("/api/articles");
    if (editing && articleSlug) {
      mutate(`/api/articles/${articleSlug}`);
    }
    mutate("/api/github/merge/check");
    router.push(toLocale("/admin/articles"));
  }, [state, router, editing, articleSlug, toLocale]);

  function handleFormDataChange(field: string, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleAction() {
    const preparedFormData = new FormData();
    preparedFormData.set("title", formData.title);
    preparedFormData.set("date", formData.date);
    preparedFormData.set("authorId", formData.authorId);
    preparedFormData.set("categoryId", formData.categoryId);
    if (formData.issueId) {
      preparedFormData.set("issueId", formData.issueId);
    }
    preparedFormData.set("in_evidence", formData.in_evidence.toString());
    preparedFormData.set("published", formData.published.toString());
    preparedFormData.set("excerpt", formData.excerpt);
    preparedFormData.set("content", content);

    if (formData.podcastId) {
      preparedFormData.set("podcastId", formData.podcastId);
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
