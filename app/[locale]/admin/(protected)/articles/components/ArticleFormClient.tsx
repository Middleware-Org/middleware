/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { createArticleAction, updateArticleAction, type ActionResult } from "../actions";
import ArticleMetaPanel from "./ArticleMetaPanel";

// Import dinamico per evitare problemi SSR con Tiptap
const MarkdownEditor = dynamic(() => import("./MarkdownEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0 border border-gray-300 rounded-md p-4">
        <div className="animate-pulse text-gray-400">Caricamento editor...</div>
      </div>
    </div>
  ),
});
import styles from "../styles";
import type { Article } from "@/lib/github/types";
import type { Category } from "@/lib/github/types";
import type { Author } from "@/lib/github/types";
import type { Issue } from "@/lib/github/types";

/* **************************************************
 * Types
 **************************************************/
interface ArticleFormClientProps {
  article?: Article | null;
  categories: Category[];
  authors: Author[];
  issues: Issue[];
}

/* **************************************************
 * Article Form Client Component
 **************************************************/
export default function ArticleFormClient({
  article,
  categories,
  authors,
  issues,
}: ArticleFormClientProps) {
  const router = useRouter();
  const editing = !!article;
  const formRef = useRef<HTMLFormElement>(null);
  const [content, setContent] = useState<string>(article?.content || "");
  const [formData, setFormData] = useState({
    title: article?.title || "",
    date: article?.date || new Date().toISOString().split("T")[0],
    author: article?.author || "",
    category: article?.category || "",
    issue: article?.issue || "",
    in_evidence: article?.in_evidence || false,
    excerpt: article?.excerpt || "",
  });

  const [state, formAction] = useActionState<ActionResult<Article> | null, FormData>(
    editing ? updateArticleAction : createArticleAction,
    null,
  );

  // Reset form and navigate on success
  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      router.push("/admin/articles");
      router.refresh();
    }
  }, [state, router]);

  function handleFormDataChange(field: string, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formDataObj = new FormData(event.currentTarget);
    
    // Add all form data
    formDataObj.set("title", formData.title);
    formDataObj.set("date", formData.date);
    formDataObj.set("author", formData.author);
    formDataObj.set("category", formData.category);
    formDataObj.set("issue", formData.issue);
    formDataObj.set("in_evidence", formData.in_evidence.toString());
    formDataObj.set("excerpt", formData.excerpt);
    formDataObj.set("content", content);

    if (editing && article) {
      formDataObj.set("slug", article.slug);
    }

    formAction(formDataObj);
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="h-full flex flex-col">
      {state && !state.success && (
        <div className={`mb-4 ${state.errorType === "warning" ? styles.errorWarning : styles.error}`}>
          {state.error}
        </div>
      )}

      {state?.success && state.message && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
          {state.message}
        </div>
      )}

      <div className={styles.editorContainer}>
        {/* Editor Markdown - 3/4 width */}
        <div className={styles.editorWrapper}>
          <MarkdownEditor
            value={content}
            onChange={(value) => setContent(value || "")}
            label="Contenuto *"
          />
        </div>

        {/* Meta Panel - 1/4 width */}
        <ArticleMetaPanel
          article={article}
          categories={categories}
          authors={authors}
          issues={issues}
          formData={formData}
          onFormDataChange={handleFormDataChange}
          editing={editing}
          formRef={formRef}
        />
      </div>
    </form>
  );
}

