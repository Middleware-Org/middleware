/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { deletePodcastAction } from "../actions";
import ConfirmDialog from "@/components/molecules/confirmDialog";
import styles from "../styles";
import baseStyles from "../../styles";
import type { Podcast } from "@/lib/github/types";
import AudioJsonMediaSelector from "../../articles/components/AudioJsonMediaSelector";
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Types
 **************************************************/
interface PodcastMetaPanelProps {
  podcast?: Podcast | null;
  formData: {
    title: string;
    description: string;
    date: string;
    audio: string;
    audio_chunks: string;
    cover?: string;
    published: boolean;
  };
  onFormDataChange: (field: string, value: string | boolean) => void;
  editing: boolean;
  formRef: React.RefObject<HTMLFormElement | null>;
}

/* **************************************************
 * Slug Generation Utility (Client-side)
 **************************************************/
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function PodcastMetaPanel({
  podcast,
  formData,
  onFormDataChange,
  editing,
  formRef,
}: PodcastMetaPanelProps) {
  const router = useRouter();
  const [isPending] = useTransition();
  const [error, setError] = useState<{ message: string; type: "error" | "warning" } | null>(null);
  const [isAudioSelectorOpen, setIsAudioSelectorOpen] = useState(false);
  const [isAudioChunksSelectorOpen, setIsAudioChunksSelectorOpen] = useState(false);
  const [isCoverSelectorOpen, setIsCoverSelectorOpen] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [slugValue, setSlugValue] = useState<string | null>(null);

  const currentSlug = slugValue ?? podcast?.slug ?? "";

  useEffect(() => {
    const slugInput = formRef.current?.querySelector('input[name="newSlug"]') as HTMLInputElement;
    if (slugInput) {
      slugInput.value = currentSlug;
    }
  }, [currentSlug, formRef]);

  function handleGenerateSlug() {
    if (formData.title) {
      const generatedSlug = generateSlug(formData.title);
      setSlugValue(generatedSlug);
    }
  }

  function handleDeleteClick() {
    if (podcast) {
      setIsDeleteDialogOpen(true);
    }
  }

  async function handleDeleteConfirm() {
    if (!podcast) return;

    setError(null);
    setIsDeleteDialogOpen(false);

    startDeleteTransition(async () => {
      const result = await deletePodcastAction(podcast.slug);

      if (!result.success) {
        setError({
          message: result.error,
          type: result.errorType || "error",
        });
      } else {
        router.push("/admin/podcasts");
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
                editing ? podcast?.slug || "auto-generato se vuoto" : "auto-generato se vuoto"
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
          {editing && <input type="hidden" name="slug" value={podcast?.slug || ""} />}
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

        <div className={styles.field}>
          <label htmlFor="audio" className={styles.label}>
            Audio *
          </label>
          <div className={baseStyles.buttonGroup}>
            <input
              id="audio"
              type="text"
              value={formData.audio || ""}
              onChange={(e) => onFormDataChange("audio", e.target.value)}
              placeholder="Nessun file audio selezionato"
              className={styles.input}
              readOnly
              required
            />
            <button
              type="button"
              onClick={() => setIsAudioSelectorOpen(true)}
              className={styles.submitButton}
            >
              Seleziona
            </button>
            {formData.audio && (
              <button
                type="button"
                onClick={() => onFormDataChange("audio", "")}
                className={styles.cancelButton}
              >
                Rimuovi
              </button>
            )}
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="audio_chunks" className={styles.label}>
            JSON Chunk Audio *
          </label>
          <div className={baseStyles.buttonGroup}>
            <input
              id="audio_chunks"
              type="text"
              value={formData.audio_chunks || ""}
              onChange={(e) => onFormDataChange("audio_chunks", e.target.value)}
              placeholder="Nessun file JSON selezionato"
              className={styles.input}
              readOnly
              required
            />
            <button
              type="button"
              onClick={() => setIsAudioChunksSelectorOpen(true)}
              className={styles.submitButton}
            >
              Seleziona
            </button>
            {formData.audio_chunks && (
              <button
                type="button"
                onClick={() => onFormDataChange("audio_chunks", "")}
                className={styles.cancelButton}
              >
                Rimuovi
              </button>
            )}
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="cover" className={styles.label}>
            Immagine di copertina (opzionale)
          </label>
          <div className={baseStyles.buttonGroup}>
            <input
              id="cover"
              type="text"
              value={formData.cover || ""}
              onChange={(e) => onFormDataChange("cover", e.target.value)}
              placeholder="Nessuna immagine selezionata"
              className={styles.input}
              readOnly
            />
            <button
              type="button"
              onClick={() => setIsCoverSelectorOpen(true)}
              className={styles.submitButton}
            >
              Seleziona
            </button>
            {formData.cover && (
              <button
                type="button"
                onClick={() => onFormDataChange("cover", "")}
                className={styles.cancelButton}
              >
                Rimuovi
              </button>
            )}
          </div>
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
      </div>

      {/* Audio Selector Modal */}
      <AudioJsonMediaSelector
        isOpen={isAudioSelectorOpen}
        onClose={() => setIsAudioSelectorOpen(false)}
        onSelect={(fileUrl) => {
          onFormDataChange("audio", fileUrl);
        }}
        fileType="audio"
        title="Seleziona Audio"
      />

      {/* Audio Chunks JSON Selector Modal */}
      <AudioJsonMediaSelector
        isOpen={isAudioChunksSelectorOpen}
        onClose={() => setIsAudioChunksSelectorOpen(false)}
        onSelect={(fileUrl) => {
          onFormDataChange("audio_chunks", fileUrl);
        }}
        fileType="json"
        title="Seleziona JSON Chunk Audio"
      />

      {/* Cover Image Selector Modal */}
      <AudioJsonMediaSelector
        isOpen={isCoverSelectorOpen}
        onClose={() => setIsCoverSelectorOpen(false)}
        onSelect={(fileUrl) => {
          onFormDataChange("cover", fileUrl);
        }}
        fileType="image"
        title="Seleziona Immagine di Copertina"
      />

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
            onClick={() => router.push("/admin/podcasts")}
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

        {editing && podcast && error && (
          <div className={`mt-4 ${error.type === "warning" ? styles.errorWarning : styles.error}`}>
            ⚠️ {error.message}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {editing && podcast && (
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Elimina Podcast"
          message={`Sei sicuro di voler eliminare il podcast "${podcast.title}"? Questa azione non può essere annullata.`}
          confirmText="Elimina"
          cancelText="Annulla"
          confirmButtonClassName={styles.deleteButton}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}

