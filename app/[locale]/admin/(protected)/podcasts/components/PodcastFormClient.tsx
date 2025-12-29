/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/classes";
import { createPodcastAction, updatePodcastAction, type ActionResult } from "../actions";
import PodcastMetaPanel from "./PodcastMetaPanel";
import styles from "../styles";
import baseStyles from "../../styles";
import type { Podcast } from "@/lib/github/types";
import { usePodcast } from "@/hooks/swr";
import { mutate } from "swr";

/* **************************************************
 * Types
 **************************************************/
interface PodcastFormClientProps {
  podcastSlug?: string; // Slug per edit mode
}

/* **************************************************
 * Podcast Form Client Component
 **************************************************/
export default function PodcastFormClient({ podcastSlug }: PodcastFormClientProps) {
  const router = useRouter();
  const editing = !!podcastSlug;

  // Usa SWR per ottenere i dati (cache pre-popolata dal server)
  const { podcast } = usePodcast(podcastSlug || null);

  const formRef = useRef<HTMLFormElement>(null);

  // Usa i valori dal podcast quando disponibili, altrimenti valori di default
  const defaultFormData = {
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    audio: "",
    audio_chunks: "",
    cover: "",
    issue: "",
    published: false,
  };

  // Inizializza lo stato con i valori del podcast se disponibile
  const [formData, setFormData] = useState(() =>
    podcast
      ? {
          title: podcast.title || "",
          description: podcast.description || "",
          date: podcast.date || new Date().toISOString().split("T")[0],
          audio: podcast.audio || "",
          audio_chunks: podcast.audio_chunks || "",
          cover: podcast.cover || "",
          issue: podcast.issue || "",
          published: podcast.published ?? false,
        }
      : defaultFormData,
  );

  const [state, formAction] = useActionState<ActionResult<Podcast> | null, FormData>(
    editing ? updatePodcastAction : createPodcastAction,
    null,
  );

  // Reset form and navigate on success
  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      // Invalida la cache SWR per forzare il refetch della lista
      mutate("/api/podcasts");
      if (editing && podcastSlug) {
        mutate(`/api/podcasts/${podcastSlug}`);
      }
      mutate("/api/github/merge/check");
      router.push("/admin/podcasts");
    }
  }, [state, router, editing, podcastSlug]);

  function handleFormDataChange(field: string, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleAction() {
    const preparedFormData = new FormData();
    preparedFormData.set("title", formData.title);
    preparedFormData.set("description", formData.description);
    preparedFormData.set("date", formData.date);
    preparedFormData.set("published", formData.published.toString());

    if (formData.audio) {
      preparedFormData.set("audio", formData.audio);
    }
    if (formData.audio_chunks) {
      preparedFormData.set("audio_chunks", formData.audio_chunks);
    }
    if (formData.cover) {
      preparedFormData.set("cover", formData.cover);
    }
    if (formData.issue) {
      preparedFormData.set("issue", formData.issue);
    }

    if (editing && podcastSlug) {
      preparedFormData.set("slug", podcastSlug);
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
        {/* Form Content - 3/4 width */}
        <div className={styles.editorWrapper}>
          <div className="flex flex-col h-full">
            <label htmlFor="description" className={styles.editorLabel}>
              Descrizione
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleFormDataChange("description", e.target.value)}
              className={cn(styles.textarea, "flex-1 min-h-0")}
              placeholder="Inserisci la descrizione del podcast..."
            />
          </div>
        </div>

        {/* Meta Panel - 1/4 width */}
        <PodcastMetaPanel
          podcast={podcast || null}
          formData={formData}
          onFormDataChange={handleFormDataChange}
          editing={editing}
          formRef={formRef}
        />
      </div>
    </form>
  );
}

