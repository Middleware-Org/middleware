/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/classes";
import type { ActionResult } from "@/lib/actions/types";
import { createPodcastAction, updatePodcastAction } from "../actions";
import PodcastMetaPanel from "./PodcastMetaPanel";
import styles from "../styles";
import baseStyles from "../../styles";
import type { Podcast } from "@/lib/github/types";
import { usePodcast } from "@/hooks/swr";
import { mutate } from "swr";
import { toast } from "@/hooks/use-toast";
import { useLocalizedPath } from "@/lib/i18n/client";

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
  const toLocale = useLocalizedPath();
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
    issueId: "",
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
          issueId: podcast.issueId || "",
          published: podcast.published ?? false,
        }
      : defaultFormData,
  );

  const [state, formAction] = useActionState<ActionResult<Podcast> | null, FormData>(
    editing ? updatePodcastAction : createPodcastAction,
    null,
  );

  useEffect(() => {
    if (!podcast) {
      return;
    }

    const next = {
      title: podcast.title || "",
      description: podcast.description || "",
      date: podcast.date || new Date().toISOString().split("T")[0],
      audio: podcast.audio || "",
      audio_chunks: podcast.audio_chunks || "",
      issueId: podcast.issueId || "",
      published: podcast.published ?? false,
    };

    const timeoutId = setTimeout(() => {
      setFormData((prev) => {
        if (
          prev.title === next.title &&
          prev.description === next.description &&
          prev.date === next.date &&
          prev.audio === next.audio &&
          prev.audio_chunks === next.audio_chunks &&
          prev.issueId === next.issueId &&
          prev.published === next.published
        ) {
          return prev;
        }

        return next;
      });
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [
    podcast?.id,
    podcast?.title,
    podcast?.description,
    podcast?.date,
    podcast?.audio,
    podcast?.audio_chunks,
    podcast?.issueId,
    podcast?.published,
  ]);

  // Reset form and navigate on success
  useEffect(() => {
    if (!state) {
      return;
    }

    if (!state.success) {
      toast.actionResult(state, { errorTitle: "Operazione non riuscita" });
      return;
    }

    toast.success(state.message || (editing ? "Podcast aggiornato" : "Podcast creato"));
    formRef.current?.reset();
    mutate("/api/podcasts");
    if (editing && podcastSlug) {
      mutate(`/api/podcasts/${podcastSlug}`);
    }
    mutate("/api/github/merge/check");
    router.push(toLocale("/admin/podcasts"));
  }, [state, router, editing, podcastSlug, toLocale]);

  function handleFormDataChange(field: string, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleAction() {
    const effectiveFormData =
      editing && podcast
        ? {
            ...formData,
            issueId: formData.issueId || podcast.issueId || "",
          }
        : formData;

    const preparedFormData = new FormData();
    preparedFormData.set("title", effectiveFormData.title);
    preparedFormData.set("description", effectiveFormData.description);
    preparedFormData.set("date", effectiveFormData.date);
    preparedFormData.set("published", effectiveFormData.published.toString());

    if (effectiveFormData.audio) {
      preparedFormData.set("audio", effectiveFormData.audio);
    }
    if (effectiveFormData.audio_chunks) {
      preparedFormData.set("audio_chunks", effectiveFormData.audio_chunks);
    }
    if (effectiveFormData.issueId) {
      preparedFormData.set("issueId", effectiveFormData.issueId);
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

  const panelFormData =
    editing && podcast
      ? {
          ...formData,
          issueId: formData.issueId || podcast.issueId || "",
        }
      : formData;

  return (
    <form
      ref={formRef}
      action={handleAction}
      className={cn(baseStyles.formContainer, "flex flex-col h-full")}
    >
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
          formData={panelFormData}
          onFormDataChange={handleFormDataChange}
          editing={editing}
          formRef={formRef}
        />
      </div>
    </form>
  );
}
