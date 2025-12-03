/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Bookmark as BookmarkIcon, Minus } from "lucide-react";
import { cn } from "@/lib/utils/classes";
import { podcastBookmarksStorage } from "@/lib/storage/podcastBookmarks";

/* **************************************************
 * Types
 **************************************************/
interface PodcastBookmarkManagerProps {
  contentContainerSelector: string; // Selettore CSS per il contenitore della trascrizione
  segments?: Array<{ start: number; end: number }>; // Segmenti della trascrizione per mappare tempo a posizione
  bookmarks: Array<{ id: string; time: number }>; // Bookmarks passati come prop (single source of truth)
}

/* **************************************************
 * PodcastBookmarkManager Component
 **************************************************/
export default function PodcastBookmarkManager({
  contentContainerSelector,
  segments = [],
  bookmarks: bookmarksProp,
}: PodcastBookmarkManagerProps) {
  const [bookmarkPositions, setBookmarkPositions] = useState<Map<string, number>>(new Map());
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const contentContainerRef = useRef<HTMLElement | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Inizializza il contenitore
  useEffect(() => {
    const container = document.querySelector(contentContainerSelector) as HTMLElement;
    if (container) {
      contentContainerRef.current = container;
      requestAnimationFrame(() => {
        setContainerRect(container.getBoundingClientRect());
        setIsInitialized(true);
      });
    }
  }, [contentContainerSelector]);

  // Trova il contenitore della trascrizione e aggiorna il containerRect
  useEffect(() => {
    const container = document.querySelector(contentContainerSelector) as HTMLElement;
    if (container) {
      contentContainerRef.current = container;
      requestAnimationFrame(() => {
        setContainerRect(container.getBoundingClientRect());
      });
    }
  }, [contentContainerSelector]);

  // Calcola le posizioni dei segnaposto nella trascrizione
  // Standardizzato: usa sempre offsetTop
  const updateBookmarkPositions = useCallback(() => {
    const positions = new Map<string, number>();
    const container = contentContainerRef.current;
    if (!container || segments.length === 0) return;

    bookmarksProp.forEach((bookmark) => {
      // Trova il segmento corrispondente al tempo del bookmark
      const segmentIndex = segments.findIndex(
        (s) => bookmark.time >= s.start && bookmark.time <= s.end,
      );

      if (segmentIndex !== -1) {
        // Trova l'elemento del segmento nel DOM usando l'attributo data-segment-index
        const segmentElement = container.querySelector(
          `[data-segment-index="${segmentIndex}"]`,
        ) as HTMLElement;
        if (segmentElement) {
          // Usa sempre offsetTop per ottenere la posizione relativa al contenitore
          const offsetTop = segmentElement.offsetTop;
          positions.set(bookmark.id, offsetTop);
        }
      } else {
        // Se non trova un segmento esatto, cerca il più vicino
        let closestSegmentIndex = -1;
        let minDistance = Infinity;
        segments.forEach((s, index) => {
          const distance = Math.min(
            Math.abs(bookmark.time - s.start),
            Math.abs(bookmark.time - s.end),
          );
          if (distance < minDistance) {
            minDistance = distance;
            closestSegmentIndex = index;
          }
        });
        if (closestSegmentIndex !== -1) {
          const segmentElement = container.querySelector(
            `[data-segment-index="${closestSegmentIndex}"]`,
          ) as HTMLElement;
          if (segmentElement) {
            // Usa sempre offsetTop
            const offsetTop = segmentElement.offsetTop;
            positions.set(bookmark.id, offsetTop);
          }
        }
      }
    });

    setBookmarkPositions(positions);
  }, [bookmarksProp, segments]);

  // Aggiorna le posizioni quando cambiano i bookmarks o i segmenti
  useEffect(() => {
    if (!isInitialized || segments.length === 0) return;
    // Usa un timeout per assicurarsi che il DOM sia aggiornato
    const timeout = setTimeout(() => {
      updateBookmarkPositions();
    }, 100);
    return () => clearTimeout(timeout);
  }, [isInitialized, bookmarksProp, segments, updateBookmarkPositions]);

  // Aggiorna le posizioni quando la finestra viene ridimensionata o scrollata
  useEffect(() => {
    if (!isInitialized) return;

    const updatePositions = () => {
      if (contentContainerRef.current) {
        setContainerRect(contentContainerRef.current.getBoundingClientRect());
      }
      updateBookmarkPositions();
    };

    const container = contentContainerRef.current;
    if (!container) return;

    // Ascolta lo scroll del contenitore invece che della finestra
    const scrollContainer = container.parentElement;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", updatePositions);
    }
    window.addEventListener("resize", updatePositions);

    if (contentContainerRef.current) {
      resizeObserverRef.current = new ResizeObserver(updatePositions);
      resizeObserverRef.current.observe(contentContainerRef.current);
    }

    return () => {
      const container = contentContainerRef.current;
      if (container) {
        const scrollContainer = container.parentElement;
        if (scrollContainer) {
          scrollContainer.removeEventListener("scroll", updatePositions);
        }
      }
      window.removeEventListener("resize", updatePositions);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [isInitialized, updateBookmarkPositions]);

  // Funzione per eliminare un segnaposto quando si clicca sull'icona
  const handleBookmarkClick = useCallback(async (bookmarkId: string) => {
    // Elimina il segnaposto direttamente dallo storage
    // Il parent (PodcastPlayer) si aggiornerà automaticamente tramite il hook
    await podcastBookmarksStorage.deleteBookmark(bookmarkId);
  }, []);

  if (!isInitialized || !containerRect) {
    return null;
  }

  return (
    <div
      className="pointer-events-none lg:-left-8 md:-left-3 -left-3"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "1.5rem",
        height: "100%",
        zIndex: 5,
      }}
    >
      {bookmarksProp.map((bookmark) => {
        const position = bookmarkPositions.get(bookmark.id);
        if (position === undefined) return null;

        const relativePosition = position;

        if (relativePosition < -50 || relativePosition > containerRect.height + 50) {
          return null;
        }

        return (
          <button
            key={bookmark.id}
            onClick={() => handleBookmarkClick(bookmark.id)}
            className={cn(
              "pointer-events-auto",
              "group",
              "w-5 h-5",
              "flex items-center justify-center",
              "bg-tertiary/90 hover:bg-tertiary",
              "text-primary",
              "rounded-full",
              "shadow-lg",
              "transition-all duration-200",
            )}
            style={{
              position: "absolute",
              left: "0",
              top: `${relativePosition}px`,
              transform: "translateY(-50%)",
            }}
            title="Clicca per rimuovere il segnaposto"
            aria-label="Rimuovi segnaposto"
          >
            <BookmarkIcon className="w-3 h-3 fill-current group-hover:hidden" />
            <Minus className="w-3 h-3 hidden group-hover:block" />
          </button>
        );
      })}
    </div>
  );
}
