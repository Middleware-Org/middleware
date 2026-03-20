/* **************************************************
 * Imports
 **************************************************/
"use client";

import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { mutate } from "swr";

import ConfirmDialog from "@/components/molecules/confirmDialog";
import { useIssues } from "@/hooks/swr";
import { toast } from "@/hooks/use-toast";
import type { Podcast } from "@/lib/github/types";
import { useLocalizedPath } from "@/lib/i18n/client";
import { cn } from "@/lib/utils/classes";
import { generateSlug } from "@/lib/utils/slug";

import AudioJsonMediaSelector from "../../articles/components/AudioJsonMediaSelector";
import SelectSearch from "../../articles/components/SelectSearch";
import { adminFormCopy } from "../../components/adminFormCopy";
import baseStyles from "../../styles";
import { deletePodcastAction } from "../actions";
import styles from "../styles";

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
    issue?: string;
    published: boolean;
  };
  onFormDataChange: (field: string, value: string | boolean) => void;
  editing: boolean;
  formRef: React.RefObject<HTMLFormElement | null>;
}

export default function PodcastMetaPanel({
  podcast,
  formData,
  onFormDataChange,
  editing,
  formRef,
}: PodcastMetaPanelProps) {
  const router = useRouter();
  const toLocale = useLocalizedPath();
  const [isPending] = useTransition();
  const [isAudioSelectorOpen, setIsAudioSelectorOpen] = useState(false);
  const [isAudioChunksSelectorOpen, setIsAudioChunksSelectorOpen] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [slugValue, setSlugValue] = useState<string | null>(null);
  const { issues = [] } = useIssues();

  const currentSlug = slugValue ?? podcast?.slug ?? "";

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

    setIsDeleteDialogOpen(false);

    startDeleteTransition(async () => {
      const result = await deletePodcastAction(podcast.slug);

      if (!result.success) {
        toast.actionResult(result, { errorTitle: adminFormCopy.podcast.deleteErrorTitle });
      } else {
        toast.success(result.message || adminFormCopy.podcast.deleteSuccess);
        mutate("/api/podcasts");
        mutate(`/api/podcasts/${podcast.slug}`);
        router.push(toLocale("/admin/podcasts"));
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
            {adminFormCopy.podcast.title}
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
                  ? podcast?.slug || adminFormCopy.common.slugAuto
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
          {editing && <input type="hidden" name="slug" value={podcast?.slug || ""} />}
        </div>

        <div className={styles.field}>
          <label htmlFor="date" className={styles.label}>
            {adminFormCopy.podcast.date}
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
            {adminFormCopy.podcast.audio}
          </label>
          <div className={baseStyles.buttonGroup}>
            <input
              id="audio"
              type="text"
              value={formData.audio || ""}
              onChange={(e) => onFormDataChange("audio", e.target.value)}
              placeholder={adminFormCopy.podcast.noAudioSelected}
              className={styles.input}
              readOnly
              required
            />
            <button
              type="button"
              onClick={() => setIsAudioSelectorOpen(true)}
              className={styles.submitButton}
            >
              {adminFormCopy.podcast.select}
            </button>
            {formData.audio && (
              <button
                type="button"
                onClick={() => onFormDataChange("audio", "")}
                className={styles.cancelButton}
              >
                {adminFormCopy.podcast.remove}
              </button>
            )}
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="audio_chunks" className={styles.label}>
            {adminFormCopy.podcast.audioChunks}
          </label>
          <div className={baseStyles.buttonGroup}>
            <input
              id="audio_chunks"
              type="text"
              value={formData.audio_chunks || ""}
              onChange={(e) => onFormDataChange("audio_chunks", e.target.value)}
              placeholder={adminFormCopy.podcast.noJsonSelected}
              className={styles.input}
              readOnly
              required
            />
            <button
              type="button"
              onClick={() => setIsAudioChunksSelectorOpen(true)}
              className={styles.submitButton}
            >
              {adminFormCopy.podcast.select}
            </button>
            {formData.audio_chunks && (
              <button
                type="button"
                onClick={() => onFormDataChange("audio_chunks", "")}
                className={styles.cancelButton}
              >
                {adminFormCopy.podcast.remove}
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
            <span className={styles.label}>{adminFormCopy.podcast.published}</span>
          </label>
        </div>

        <SelectSearch
          id="issue"
          label={adminFormCopy.podcast.numberOptional}
          value={formData.issue || ""}
          options={[
            { value: "", label: adminFormCopy.podcast.noNumber },
            ...issues.map((issue) => ({
              value: issue.slug,
              label: issue.title,
            })),
          ]}
          onChange={(value) => onFormDataChange("issue", value || "")}
          placeholder={adminFormCopy.podcast.numberPlaceholder}
        />
      </div>

      {/* Audio Selector Modal */}
      <AudioJsonMediaSelector
        isOpen={isAudioSelectorOpen}
        onClose={() => setIsAudioSelectorOpen(false)}
        onSelect={(fileUrl) => {
          onFormDataChange("audio", fileUrl);
        }}
        fileType="audio"
        title={adminFormCopy.podcast.selectAudioModalTitle}
      />

      {/* Audio Chunks JSON Selector Modal */}
      <AudioJsonMediaSelector
        isOpen={isAudioChunksSelectorOpen}
        onClose={() => setIsAudioChunksSelectorOpen(false)}
        onSelect={(fileUrl) => {
          onFormDataChange("audio_chunks", fileUrl);
        }}
        fileType="json"
        title={adminFormCopy.podcast.selectAudioJsonModalTitle}
      />

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
            onClick={() => router.push(toLocale("/admin/podcasts"))}
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
      {editing && podcast && (
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
          title={adminFormCopy.podcast.deleteDialogTitle}
          message={adminFormCopy.podcast.deleteDialogMessage(podcast.title)}
          confirmText={adminFormCopy.common.delete}
          cancelText={adminFormCopy.common.cancel}
          confirmButtonClassName={styles.deleteButton}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}
