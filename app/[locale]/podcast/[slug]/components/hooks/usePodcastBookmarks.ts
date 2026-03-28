"use client";

/* **************************************************
 * Imports
 **************************************************/
import { useEffect, useState, useCallback } from "react";
import { useMemo } from "react";

import { toast } from "@/hooks/use-toast";
import type { PodcastBookmark } from "@/lib/storage/podcastBookmarks";
import {
  PODCAST_BOOKMARKS_UPDATED_EVENT,
  podcastBookmarksStorage,
} from "@/lib/storage/podcastBookmarks";

import type { Segment } from "../types";

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
  getBookmarkInChunk: (time: number) => PodcastBookmark | null;
  hasBookmarkInChunk: (time: number) => boolean;
  refreshBookmarks: () => Promise<void>;
};

function findSegmentIndexAtTime(segments: Segment[], time: number): number {
  let left = 0;
  let right = segments.length - 1;

  while (left <= right) {
    const middle = Math.floor((left + right) / 2);
    const segment = segments[middle];

    if (time < segment.start) {
      right = middle - 1;
      continue;
    }

    if (time > segment.end) {
      left = middle + 1;
      continue;
    }

    return middle;
  }

  return -1;
}

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

  const bookmarkBySegmentIndex = useMemo(() => {
    const map = new Map<number, PodcastBookmark>();

    for (const bookmark of bookmarks) {
      const segmentIndex = findSegmentIndexAtTime(segments, bookmark.time);
      if (segmentIndex === -1) {
        continue;
      }

      const existingBookmark = map.get(segmentIndex);
      if (!existingBookmark || bookmark.time < existingBookmark.time) {
        map.set(segmentIndex, bookmark);
      }
    }

    return map;
  }, [bookmarks, segments]);

  // Carica i bookmarks iniziali
  useEffect(() => {
    async function loadBookmarks() {
      try {
        await podcastBookmarksStorage.init();
        const savedBookmarks = await podcastBookmarksStorage.getBookmarks(podcastSlug);
        setBookmarks(savedBookmarks);
      } catch (error) {
        toast.error(
          "Errore nel caricamento dei segnaposto",
          error instanceof Error ? error.message : undefined,
        );
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
      toast.error(
        "Errore nel ricaricamento dei segnaposto",
        error instanceof Error ? error.message : undefined,
      );
    }
  }, [podcastSlug]);

  useEffect(() => {
    const handleBookmarksUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ podcastSlug: string }>;
      if (customEvent.detail?.podcastSlug !== podcastSlug) {
        return;
      }

      refreshBookmarks();
    };

    window.addEventListener(PODCAST_BOOKMARKS_UPDATED_EVENT, handleBookmarksUpdated);
    return () => {
      window.removeEventListener(PODCAST_BOOKMARKS_UPDATED_EVENT, handleBookmarksUpdated);
    };
  }, [podcastSlug, refreshBookmarks]);

  // Restituisce il bookmark presente nello stesso chunk del tempo specificato
  const getBookmarkInChunk = useCallback(
    (time: number): PodcastBookmark | null => {
      const segmentIndex = findSegmentIndexAtTime(segments, time);
      if (segmentIndex === -1) {
        return null;
      }

      return bookmarkBySegmentIndex.get(segmentIndex) ?? null;
    },
    [bookmarkBySegmentIndex, segments],
  );

  // Verifica se esiste un bookmark nello stesso chunk
  const hasBookmarkInChunk = useCallback(
    (time: number): boolean => {
      return getBookmarkInChunk(time) !== null;
    },
    [getBookmarkInChunk],
  );

  // Aggiunge un bookmark (solo se non esiste già nello stesso chunk)
  const addBookmark = useCallback(
    async (time: number): Promise<boolean> => {
      try {
        const segmentIndex = findSegmentIndexAtTime(segments, time);
        if (segmentIndex === -1) {
          // Se non c'è un segmento corrispondente, non aggiungere il bookmark
          return false;
        }

        if (bookmarkBySegmentIndex.has(segmentIndex)) {
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
        toast.error(
          "Errore nell'aggiunta del segnaposto",
          error instanceof Error ? error.message : undefined,
        );
        return false;
      }
    },
    [bookmarkBySegmentIndex, podcastSlug, segments],
  );

  // Rimuove un bookmark
  const removeBookmark = useCallback(async (id: string): Promise<void> => {
    try {
      await podcastBookmarksStorage.deleteBookmark(id);
      // Aggiorna lo stato locale
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
    } catch (error) {
      toast.error(
        "Errore nella rimozione del segnaposto",
        error instanceof Error ? error.message : undefined,
      );
      throw error;
    }
  }, []);

  return {
    bookmarks,
    isLoading,
    addBookmark,
    removeBookmark,
    getBookmarkInChunk,
    hasBookmarkInChunk,
    refreshBookmarks,
  };
}
