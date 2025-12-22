/* **************************************************
 * Imports
 **************************************************/
"use client";

import useSWR from "swr";
import type { Podcast } from "@/lib/github/types";
import styles from "../styles";

/* **************************************************
 * Types
 **************************************************/
interface PodcastSelectorProps {
  value: string;
  onChange: (slug: string) => void;
}

/* **************************************************
 * Podcast Selector Component
 **************************************************/
export default function PodcastSelector({ value, onChange }: PodcastSelectorProps) {
  const { data: podcasts = [], isLoading } = useSWR<Podcast[]>("/api/podcasts", async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch podcasts");
    return res.json();
  });

  // Filtra solo i podcast pubblicati
  const publishedPodcasts = podcasts.filter((p) => p.published);

  return (
    <div className={styles.field}>
      <label htmlFor="podcast" className={styles.label}>
        Podcast Associato
      </label>
      <select
        id="podcast"
        name="podcast"
        className={styles.select}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading}
      >
        <option value="">Nessun podcast</option>
        {publishedPodcasts.map((podcast) => (
          <option key={podcast.slug} value={podcast.slug}>
            {podcast.title}
          </option>
        ))}
      </select>
      {isLoading && <p className="text-xs text-secondary mt-1">Caricamento podcast...</p>}
      {!isLoading && publishedPodcasts.length === 0 && (
        <p className="text-xs text-secondary mt-1">
          Nessun podcast disponibile.{" "}
          <a href="/admin/podcasts/new" className="text-tertiary hover:underline">
            Creane uno nuovo
          </a>
        </p>
      )}
    </div>
  );
}
