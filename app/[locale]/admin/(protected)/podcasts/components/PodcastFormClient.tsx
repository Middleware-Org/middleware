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
import type { Podcast } from "@/lib/github/types";
import useSWR, { mutate } from "swr";

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

  // Usa SWR per ottenere i dati del podcast
  const { data: podcast } = useSWR<Podcast>(
    podcastSlug ? `/api/podcasts/${podcastSlug}` : null,
    async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch podcast");
      return res.json();
    },
  );

  const formRef = useRef<HTMLFormElement>(null);

  // Valori di default
  const defaultFormData = {
    title: "",
    description: "",
    audio: "",
    audio_chunks: "",
    duration: "",
    published: false,
    date: new Date().toISOString().split("T")[0],
  };

  // Inizializza lo stato con i valori del podcast se disponibile
  const [formData, setFormData] = useState(() =>
    podcast
      ? {
          title: podcast.title || "",
          description: podcast.description || "",
          audio: podcast.audio || "",
          audio_chunks: podcast.audio_chunks || "",
          duration: podcast.duration?.toString() || "",
          published: podcast.published ?? false,
          date: podcast.date || new Date().toISOString().split("T")[0],
        }
      : defaultFormData,
  );

  // Aggiorna formData quando il podcast viene caricato
  useEffect(() => {
    if (podcast) {
      setFormData({
        title: podcast.title || "",
        description: podcast.description || "",
        audio: podcast.audio || "",
        audio_chunks: podcast.audio_chunks || "",
        duration: podcast.duration?.toString() || "",
        published: podcast.published ?? false,
        date: podcast.date || new Date().toISOString().split("T")[0],
      });
    }
  }, [podcast]);

  const [state, formAction] = useActionState<ActionResult<Podcast> | null, FormData>(
    editing ? updatePodcastAction : createPodcastAction,
    null,
  );

  // Reset form and navigate on success
  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      mutate("/api/podcasts");
      if (editing && podcastSlug) {
        mutate(`/api/podcasts/${podcastSlug}`);
      }
      router.push("/admin/podcasts");
    }
  }, [state, router, editing, podcastSlug]);

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      {state?.success === false && (
        <div className={state.errorType === "warning" ? styles.errorWarning : styles.error}>
          {state.error}
        </div>
      )}

      {editing && podcastSlug && <input type="hidden" name="slug" value={podcastSlug} />}

      <div className={styles.editorContainer}>
        {/* Main Content */}
        <div className={styles.editorWrapper}>
          <div className={styles.field}>
            <label htmlFor="title" className={styles.label}>
              Titolo *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              className={styles.input}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="description" className={styles.label}>
              Descrizione
            </label>
            <textarea
              id="description"
              name="description"
              className={styles.textarea}
              rows={6}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>

        {/* Meta Panel */}
        <PodcastMetaPanel formData={formData} setFormData={setFormData} />
      </div>

      {/* Submit Button */}
      <div className={styles.formActions}>
        <button type="submit" className={styles.submitButton}>
          {editing ? "Aggiorna Podcast" : "Crea Podcast"}
        </button>
        <button
          type="button"
          className={styles.cancelButton}
          onClick={() => router.push("/admin/podcasts")}
        >
          Annulla
        </button>
      </div>
    </form>
  );
}
