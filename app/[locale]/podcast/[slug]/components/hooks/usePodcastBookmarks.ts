"use client";

/* **************************************************
 * Imports
 **************************************************/
import { useEffect, useState, useCallback } from "react";
import { PodcastBookmark, podcastBookmarksStorage } from "@/lib/storage/podcastBookmarks";
import { Segment } from "../types";

/* **************************************************
 * Types
 **************************************************/
type UsePodcastBookmarksProps = {
  podcastSlug: string;
  segments: Segment[];
};

type UsePodcastBookmarksReturn = {
  bookmarks: PodcastBookmark[];
  isLoading: boolean;
  addBookmark: (time: number) => Promise<boolean>; // Restituisce true se aggiunto, false se già esiste
  removeBookmark: (id: string) => Promise<void>;
  hasBookmarkInChunk: (time: number) => boolean;
  refreshBookmarks: () => Promise<void>;
};

/* **************************************************
 * usePodcastBookmarks Hook
 * Gestisce lo stato e le operazioni sui bookmarks dei podcast
 **************************************************/
export function usePodcastBookmarks({
  podcastSlug,
  segments,
}: UsePodcastBookmarksProps): UsePodcastBookmarksReturn {
  const [bookmarks, setBookmarks] = useState<PodcastBookmark[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Carica i bookmarks iniziali
  useEffect(() => {
    async function loadBookmarks() {
      try {
        await podcastBookmarksStorage.init();
        const savedBookmarks = await podcastBookmarksStorage.getBookmarks(podcastSlug);
        setBookmarks(savedBookmarks);
      } catch (error) {
        console.error("Errore nel caricamento dei segnaposto:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadBookmarks();
  }, [podcastSlug]);

  // Funzione per ricaricare i bookmarks
  const refreshBookmarks = useCallback(async () => {
    try {
      const savedBookmarks = await podcastBookmarksStorage.getBookmarks(podcastSlug);
      setBookmarks(savedBookmarks);
    } catch (error) {
      console.error("Errore nel ricaricamento dei segnaposto:", error);
    }
  }, [podcastSlug]);

  // Verifica se esiste un bookmark nello stesso chunk
  const hasBookmarkInChunk = useCallback(
    (time: number): boolean => {
      // Trova il segmento/chunk corrispondente al tempo
      const currentSegment = segments.find((s) => time >= s.start && time <= s.end);

      if (!currentSegment) {
        return false;
      }

      // Controlla se esiste già un bookmark nello stesso chunk
      return bookmarks.some((b) => b.time >= currentSegment.start && b.time <= currentSegment.end);
    },
    [bookmarks, segments],
  );

  // Aggiunge un bookmark (solo se non esiste già nello stesso chunk)
  const addBookmark = useCallback(
    async (time: number): Promise<boolean> => {
      try {
        // Trova il segmento/chunk corrispondente al tempo
        const currentSegment = segments.find((s) => time >= s.start && time <= s.end);

        if (!currentSegment) {
          // Se non c'è un segmento corrispondente, non aggiungere il bookmark
          return false;
        }

        // Controlla se esiste già un bookmark nello stesso chunk
        const existingBookmark = bookmarks.find(
          (b) => b.time >= currentSegment.start && b.time <= currentSegment.end,
        );

        if (existingBookmark) {
          // Non aggiungere se esiste già un bookmark nello stesso chunk
          return false;
        }

        // Aggiungi un nuovo bookmark
        const newBookmark = await podcastBookmarksStorage.saveBookmark({
          podcastSlug,
          time,
        });

        // Aggiorna lo stato locale
        setBookmarks((prev) => [...prev, newBookmark].sort((a, b) => a.time - b.time));
        return true;
      } catch (error) {
        console.error("Errore nell'aggiunta del segnaposto:", error);
        return false;
      }
    },
    [podcastSlug, segments, bookmarks],
  );

  // Rimuove un bookmark
  const removeBookmark = useCallback(async (id: string): Promise<void> => {
    try {
      await podcastBookmarksStorage.deleteBookmark(id);
      // Aggiorna lo stato locale
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
    } catch (error) {
      console.error("Errore nella rimozione del segnaposto:", error);
      throw error;
    }
  }, []);

  return {
    bookmarks,
    isLoading,
    addBookmark,
    removeBookmark,
    hasBookmarkInChunk,
    refreshBookmarks,
  };
}
