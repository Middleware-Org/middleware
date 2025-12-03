/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { PodcastBookmark, podcastBookmarksStorage } from "@/lib/storage/podcastBookmarks";
import { Bookmark as BookmarkIcon, Minus } from "lucide-react";
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Types
 **************************************************/
interface PodcastBookmarkManagerProps {
  podcastSlug: string;
  contentContainerSelector: string; // Selettore CSS per il contenitore della trascrizione
  segments?: Array<{ start: number; end: number }>; // Segmenti della trascrizione per mappare tempo a posizione
  onBookmarksChange?: (bookmarks: Array<{ time: number }>) => void; // Callback quando i bookmarks cambiano
}

/* **************************************************
 * PodcastBookmarkManager Component
 **************************************************/
export default function PodcastBookmarkManager({
  podcastSlug,
  contentContainerSelector,
  segments = [],
  onBookmarksChange,
}: PodcastBookmarkManagerProps) {
  const [bookmarks, setBookmarks] = useState<PodcastBookmark[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [bookmarkPositions, setBookmarkPositions] = useState<Map<string, number>>(new Map());
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);
  const contentContainerRef = useRef<HTMLElement | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Inizializza il database e carica i segnaposto
  useEffect(() => {
    async function init() {
      try {
        await podcastBookmarksStorage.init();
        const savedBookmarks = await podcastBookmarksStorage.getBookmarks(podcastSlug);
        setBookmarks(savedBookmarks);
        setIsInitialized(true);
      } catch (error) {
        console.error("Errore nell'inizializzazione dei segnaposto:", error);
        setIsInitialized(true);
      }
    }

    init();
  }, [podcastSlug]);

  // Ricarica i bookmarks quando cambiano (quando vengono aggiunti dal player o eliminati)
  useEffect(() => {
    if (!isInitialized) return;

    async function reloadBookmarks() {
      try {
        const savedBookmarks = await podcastBookmarksStorage.getBookmarks(podcastSlug);
        // Confronta i bookmarks per vedere se sono cambiati
        const currentIds = new Set(bookmarks.map((b) => b.id));
        const newIds = new Set(savedBookmarks.map((b) => b.id));
        const hasChanged =
          currentIds.size !== newIds.size ||
          [...currentIds].some((id) => !newIds.has(id)) ||
          [...newIds].some((id) => !currentIds.has(id));

        if (hasChanged) {
          setBookmarks(savedBookmarks);
        }
      } catch (error) {
        console.error("Errore nel ricaricamento dei segnaposto:", error);
      }
    }

    // Usa un interval per controllare i cambiamenti (polling)
    const interval = setInterval(reloadBookmarks, 300);
    return () => clearInterval(interval);
  }, [podcastSlug, isInitialized, bookmarks]);

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
  const updateBookmarkPositions = useCallback(() => {
    const positions = new Map<string, number>();
    const container = contentContainerRef.current;
    if (!container) return;

    bookmarks.forEach((bookmark) => {
      if (bookmark.offsetTop !== undefined) {
        // Usa l'offsetTop salvato se disponibile
        positions.set(bookmark.id, bookmark.offsetTop);
      } else if (segments.length > 0) {
        // Se non c'è offsetTop, cerca il segmento corrispondente al tempo
        const segmentIndex = segments.findIndex(
          (s) => bookmark.time >= s.start && bookmark.time <= s.end,
        );
        if (segmentIndex !== -1) {
          // Trova l'elemento del segmento nel DOM usando l'attributo data-segment-index
          const segmentElement = container.querySelector(
            `[data-segment-index="${segmentIndex}"]`,
          ) as HTMLElement;
          if (segmentElement) {
            // Usa offsetTop per ottenere la posizione relativa al contenitore
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
              const containerRect = container.getBoundingClientRect();
              const elementRect = segmentElement.getBoundingClientRect();
              const offsetTop = elementRect.top - containerRect.top;
              positions.set(bookmark.id, offsetTop);
            }
          }
        }
      }
    });

    setBookmarkPositions(positions);
  }, [bookmarks, segments]);

  // Aggiorna le posizioni quando cambiano i bookmarks o i segmenti
  useEffect(() => {
    if (!isInitialized || segments.length === 0) return;
    // Usa un timeout per assicurarsi che il DOM sia aggiornato
    const timeout = setTimeout(() => {
      updateBookmarkPositions();
    }, 100);
    return () => clearTimeout(timeout);
  }, [isInitialized, bookmarks, segments, updateBookmarkPositions]);

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
  const handleBookmarkClick = useCallback(
    async (bookmark: PodcastBookmark) => {
      // Elimina sempre il segnaposto quando si clicca sull'icona
      await podcastBookmarksStorage.deleteBookmark(bookmark.id);
      setBookmarks((prev) => {
        const updated = prev.filter((b) => b.id !== bookmark.id);
        if (onBookmarksChange) {
          onBookmarksChange(updated.map((b) => ({ time: b.time })));
        }
        return updated;
      });
    },
    [onBookmarksChange],
  );

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
      {bookmarks.map((bookmark) => {
        const position = bookmarkPositions.get(bookmark.id);
        if (position === undefined) return null;

        const relativePosition = position;

        if (relativePosition < -50 || relativePosition > containerRect.height + 50) {
          return null;
        }

        return (
          <button
            key={bookmark.id}
            onClick={() => handleBookmarkClick(bookmark)}
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
