/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { createPageAction, updatePageAction, type ActionResult } from "../actions";
import PageMetaPanel from "./PageMetaPanel";
import styles from "../styles";
import baseStyles from "../../styles";
import type { Page } from "@/lib/github/types";
import { usePage } from "@/hooks/swr";
import { mutate } from "swr";

// Import dinamico per evitare problemi SSR con Tiptap
const MarkdownEditor = dynamic(() => import("../../articles/components/MarkdownEditor"), {
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
interface PageFormClientProps {
  pageSlug?: string; // Slug per edit mode
}

/* **************************************************
 * Page Form Client Component
 **************************************************/
export default function PageFormClient({ pageSlug }: PageFormClientProps) {
  const router = useRouter();
  const editing = !!pageSlug;

  // Usa SWR per ottenere i dati (cache pre-popolata dal server)
  const { page } = usePage(pageSlug || null);

  const formRef = useRef<HTMLFormElement>(null);

  // Inizializza lo stato con i valori della pagina se disponibile
  const defaultFormData = {
    title: "",
    excerpt: "",
  };

  const [content, setContent] = useState<string>(() => page?.content || "");
  const [formData, setFormData] = useState(() =>
    page
      ? {
          title: page.title || "",
          excerpt: page.excerpt || "",
        }
      : defaultFormData,
  );

  const [state, formAction] = useActionState<ActionResult<Page> | null, FormData>(
    editing ? updatePageAction : createPageAction,
    null,
  );

  // Reset form and navigate on success
  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      // Invalida la cache SWR per forzare il refetch della lista
      mutate("/api/pages");
      if (editing && pageSlug) {
        mutate(`/api/pages/${pageSlug}`);
      }
      router.push("/admin/pages");
    }
  }, [state, router, editing, pageSlug]);

  // Aggiorna lo stato quando la pagina viene caricata
  useEffect(() => {
    if (page) {
      setContent(page.content);
      setFormData({
        title: page.title || "",
        excerpt: page.excerpt || "",
      });
    }
  }, [page]);

  function handleFormDataChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleAction() {
    const preparedFormData = new FormData();
    preparedFormData.set("title", formData.title);
    preparedFormData.set("excerpt", formData.excerpt);
    preparedFormData.set("content", content);

    if (editing && pageSlug) {
      preparedFormData.set("slug", pageSlug);
      // Aggiungi nuovo slug se presente nel form
      const newSlugInput = formRef.current?.querySelector(
        'input[name="newSlug"]',
      ) as HTMLInputElement;
      if (newSlugInput?.value) {
        preparedFormData.set("newSlug", newSlugInput.value);
      }
    } else {
      // In fase di creazione, aggiungi slug se presente
      const slugInput = formRef.current?.querySelector('input[name="slug"]') as HTMLInputElement;
      if (slugInput?.value) {
        preparedFormData.set("slug", slugInput.value);
      }
    }

    return formAction(preparedFormData);
  }

  return (
    <form ref={formRef} action={handleAction} className={baseStyles.formContainer}>
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
        <PageMetaPanel
          page={page || null}
          formData={formData}
          onFormDataChange={handleFormDataChange}
          editing={editing}
          formRef={formRef}
        />
      </div>
    </form>
  );
}

