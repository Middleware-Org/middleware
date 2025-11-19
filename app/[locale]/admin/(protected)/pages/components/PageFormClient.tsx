/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { createPageAction, updatePageAction, type ActionResult } from "../actions";
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
  const [content, setContent] = useState<string>(() => page?.content || "");
  const [slug, setSlug] = useState<string>(() => pageSlug || "");
  const [newSlug, setNewSlug] = useState<string>(() => pageSlug || "");

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
      if (!editing) {
        setSlug(page.slug);
        setNewSlug(page.slug);
      }
    }
  }, [page, editing]);

  return (
    <form ref={formRef} action={formAction} className={styles.editorContainer}>
      <div className={styles.editorWrapper}>
        {/* Slug field (hidden for edit, visible for create) */}
        {!editing && (
          <div className={styles.field}>
            <label htmlFor="slug" className={styles.label}>
              Slug *
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
              }}
              className={styles.input}
              required
              placeholder="es: about-us"
            />
          </div>
        )}

        {/* New Slug field (only for edit) */}
        {editing && (
          <>
            <input type="hidden" name="slug" value={pageSlug} />
            <div className={styles.field}>
              <label htmlFor="newSlug" className={styles.label}>
                Slug
              </label>
              <input
                type="text"
                id="newSlug"
                name="newSlug"
                value={newSlug}
                onChange={(e) => {
                  setNewSlug(e.target.value);
                }}
                className={styles.input}
                placeholder="es: about-us"
              />
            </div>
          </>
        )}

        {/* Content Editor */}
        <div className={styles.field} style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <label htmlFor="content" className={styles.editorLabel}>
            Contenuto *
          </label>
          <div style={{ flex: 1, minHeight: 0 }}>
            <MarkdownEditor
              value={content}
              onChange={(value) => setContent(value || "")}
            />
          </div>
          <input type="hidden" name="content" value={content} />
        </div>

        {/* Error Message */}
        {state && !state.success && (
          <div className={state.errorType === "warning" ? styles.errorWarning : styles.error}>
            ⚠️ {state.error}
          </div>
        )}

        {/* Success Message */}
        {state?.success && state.message && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800">
            ✓ {state.message}
          </div>
        )}

        {/* Form Actions */}
        <div className={styles.formActions}>
          <button type="submit" className={styles.submitButton} disabled={state?.success}>
            {editing ? "Aggiorna Pagina" : "Crea Pagina"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/pages")}
            className={styles.cancelButton}
          >
            Annulla
          </button>
        </div>
      </div>
    </form>
  );
}

