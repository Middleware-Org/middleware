/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useState } from "react";
import styles from "../styles";
import AudioJsonMediaSelector from "../../articles/components/AudioJsonMediaSelector";

/* **************************************************
 * Types
 **************************************************/
interface PodcastMetaPanelProps {
  formData: {
    audio: string;
    audio_chunks: string;
    duration: string;
    published: boolean;
    date: string;
  };
  setFormData: (data: any) => void;
}

/* **************************************************
 * Podcast Meta Panel Component
 **************************************************/
export default function PodcastMetaPanel({ formData, setFormData }: PodcastMetaPanelProps) {
  const [audioModalOpen, setAudioModalOpen] = useState(false);
  const [jsonModalOpen, setJsonModalOpen] = useState(false);

  return (
    <div className={styles.metaPanel}>
      <div className={styles.metaCard}>
        <h3 className={styles.metaCardTitle}>Dettagli Podcast</h3>

        {/* Date */}
        <div className={styles.field}>
          <label htmlFor="date" className={styles.label}>
            Data *
          </label>
          <input
            id="date"
            name="date"
            type="date"
            className={styles.input}
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>

        {/* Duration */}
        <div className={styles.field}>
          <label htmlFor="duration" className={styles.label}>
            Durata (secondi)
          </label>
          <input
            id="duration"
            name="duration"
            type="number"
            className={styles.input}
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            placeholder="es. 1800"
          />
        </div>

        {/* Published */}
        <div className="flex items-center gap-2">
          <input
            id="published"
            name="published"
            type="checkbox"
            className={styles.checkbox}
            checked={formData.published}
            onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
          />
          <label htmlFor="published" className={styles.label + " mb-0"}>
            Pubblicato
          </label>
        </div>
      </div>

      <div className={styles.metaCard}>
        <h3 className={styles.metaCardTitle}>File Audio</h3>

        {/* Audio File */}
        <div className={styles.field}>
          <label htmlFor="audio" className={styles.label}>
            File Audio *
          </label>
          <div className="flex gap-2">
            <input
              id="audio"
              name="audio"
              type="text"
              className={styles.input}
              value={formData.audio}
              onChange={(e) => setFormData({ ...formData, audio: e.target.value })}
              placeholder="URL file audio"
              required
            />
            <button
              type="button"
              className={styles.editButton}
              onClick={() => setAudioModalOpen(true)}
            >
              Seleziona
            </button>
          </div>
        </div>

        {/* Audio Chunks */}
        <div className={styles.field}>
          <label htmlFor="audio_chunks" className={styles.label}>
            File JSON Chunks *
          </label>
          <div className="flex gap-2">
            <input
              id="audio_chunks"
              name="audio_chunks"
              type="text"
              className={styles.input}
              value={formData.audio_chunks}
              onChange={(e) => setFormData({ ...formData, audio_chunks: e.target.value })}
              placeholder="URL file JSON"
              required
            />
            <button
              type="button"
              className={styles.editButton}
              onClick={() => setJsonModalOpen(true)}
            >
              Seleziona
            </button>
          </div>
        </div>
      </div>

      {/* Audio Modal */}
      <AudioJsonMediaSelector
        isOpen={audioModalOpen}
        onClose={() => setAudioModalOpen(false)}
        onSelect={(url) => {
          setFormData({ ...formData, audio: url });
          setAudioModalOpen(false);
        }}
        type="audio"
      />

      {/* JSON Modal */}
      <AudioJsonMediaSelector
        isOpen={jsonModalOpen}
        onClose={() => setJsonModalOpen(false)}
        onSelect={(url) => {
          setFormData({ ...formData, audio_chunks: url });
          setJsonModalOpen(false);
        }}
        type="json"
      />
    </div>
  );
}
