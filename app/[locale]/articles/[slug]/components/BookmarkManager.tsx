/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Bookmark, bookmarksStorage } from "@/lib/storage/bookmarks";
import { Bookmark as BookmarkIcon, Minus } from "lucide-react";
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Types
 **************************************************/
interface BookmarkManagerProps {
  articleSlug: string;
  contentContainerSelector?: string; // Selettore CSS per il contenitore del contenuto (default: ".prose")
}

/* **************************************************
 * BookmarkManager Component
 **************************************************/
export default function BookmarkManager({
  articleSlug,
  contentContainerSelector = ".prose",
}: BookmarkManagerProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [bookmarkPositions, setBookmarkPositions] = useState<Map<string, number>>(new Map());
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);
  const contentContainerRef = useRef<HTMLElement | null>(null);
  const lastTouchTimeRef = useRef<number>(0);
  const lastTouchTargetRef = useRef<EventTarget | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const isProcessingRef = useRef<boolean>(false);

  // Inizializza il database e carica i segnalibri
  useEffect(() => {
    async function init() {
      try {
        await bookmarksStorage.init();
        const savedBookmarks = await bookmarksStorage.getBookmarks(articleSlug);
        setBookmarks(savedBookmarks);
        setIsInitialized(true);
      } catch (error) {
        console.error("Errore nell'inizializzazione dei segnalibri:", error);
        setIsInitialized(true);
      }
    }

    init();
  }, [articleSlug]);

  // Trova il contenitore del contenuto e aggiorna il containerRect
  useEffect(() => {
    const container = document.querySelector(contentContainerSelector) as HTMLElement;
    if (container) {
      contentContainerRef.current = container;
      // Usa requestAnimationFrame per evitare warning del linter
      requestAnimationFrame(() => {
        setContainerRect(container.getBoundingClientRect());
      });
    }
  }, [contentContainerSelector]);

  // Genera un selettore CSS per un elemento
  const generateSelector = useCallback((element: Element, container: Element): string => {
    // Prova a creare un selettore basato sulla posizione nell'albero DOM
    const path: string[] = [];
    let current: Element | null = element;

    while (current && current !== container && path.length < 5) {
      let selector = current.tagName.toLowerCase();
      if (current.id) {
        selector += `#${current.id}`;
        path.unshift(selector);
        break;
      }
      if (current.className && typeof current.className === "string") {
        const classes = current.className
          .split(" ")
          .filter((c) => c && !c.includes("prose"))
          .slice(0, 2)
          .join(".");
        if (classes) {
          selector += `.${classes}`;
        }
      }
      // Aggiungi l'indice se ci sono fratelli con lo stesso tag
      const siblings = Array.from(current.parentElement?.children || []);
      const sameTagSiblings = siblings.filter((s) => s.tagName === current!.tagName);
      if (sameTagSiblings.length > 1) {
        const index = sameTagSiblings.indexOf(current);
        selector += `:nth-of-type(${index + 1})`;
      }
      path.unshift(selector);
      current = current.parentElement;
    }

    return path.join(" > ") || "p";
  }, []);

  // Funzione per trovare l'elemento più vicino a un punto nel contenuto
  const findNearestElement = useCallback(
    (x: number, y: number): { element: Element; selector: string; offsetTop: number } | null => {
      const container = contentContainerRef.current;
      if (!container) return null;

      // Trova l'elemento più vicino al punto di click
      const elements = container.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li, blockquote");
      let nearestElement: Element | null = null;
      let minDistance = Infinity;

      elements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const elementCenterY = rect.top + rect.height / 2;
        const distance = Math.abs(y - elementCenterY);

        if (distance < minDistance) {
          minDistance = distance;
          nearestElement = element;
        }
      });

      if (!nearestElement) {
        // Se non troviamo un elemento specifico, usiamo il contenitore stesso
        nearestElement = container;
      }

      // Genera un selettore CSS per l'elemento
      const selector = generateSelector(nearestElement, container);
      const containerRect = container.getBoundingClientRect();
      const elementRect = nearestElement.getBoundingClientRect();
      const offsetTop = elementRect.top - containerRect.top + window.scrollY;

      return {
        element: nearestElement,
        selector,
        offsetTop,
      };
    },
    [generateSelector],
  );

  // Funzione per creare o eliminare un segnalibro
  const toggleBookmark = useCallback(
    async (x: number, y: number) => {
      // Previene chiamate concorrenti
      if (isProcessingRef.current) {
        return;
      }

      const container = contentContainerRef.current;
      if (!container) return;

      // Imposta il lock
      isProcessingRef.current = true;

      try {
        // Calcola la posizione Y esatta del click relativa al contenitore
        const containerRect = container.getBoundingClientRect();
        // offsetTop è la posizione relativa al contenitore (dalla parte superiore del contenitore)
        const offsetTop = y - containerRect.top;

        // Trova l'elemento più vicino per generare un selettore (per riferimento futuro)
        const result = findNearestElement(x, y);
        const selector = result?.selector || "p";

        // Controlla nel database invece che solo nello stato per evitare race conditions
        const allBookmarks = await bookmarksStorage.getBookmarks(articleSlug);
        const existingBookmark = allBookmarks.find((b) => Math.abs(b.offsetTop - offsetTop) < 20);

        if (existingBookmark) {
          // Elimina il segnalibro esistente
          await bookmarksStorage.deleteBookmark(existingBookmark.id);
          setBookmarks((prev) => prev.filter((b) => b.id !== existingBookmark.id));
        } else {
          // Crea un nuovo segnalibro con la posizione esatta del click
          const newBookmark = await bookmarksStorage.saveBookmark({
            articleSlug,
            selector,
            offsetTop,
          });
          setBookmarks((prev) => [...prev, newBookmark].sort((a, b) => a.offsetTop - b.offsetTop));
        }
      } finally {
        // Rilascia il lock
        isProcessingRef.current = false;
      }
    },
    [articleSlug, findNearestElement],
  );

  // Gestisce il doppio click
  const handleDoubleClick = useCallback(
    (e: MouseEvent) => {
      // Ignora i click su link, immagini, ecc.
      const target = e.target as HTMLElement;
      if (
        target.tagName === "A" ||
        target.tagName === "IMG" ||
        target.closest("a") ||
        target.closest(".citation-link")
      ) {
        return;
      }

      toggleBookmark(e.clientX, e.clientY);
    },
    [toggleBookmark],
  );

  // Gestisce il doppio touch
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      const now = Date.now();
      const target = e.target as HTMLElement;

      // Ignora i touch su link, immagini, ecc.
      if (
        target.tagName === "A" ||
        target.tagName === "IMG" ||
        target.closest("a") ||
        target.closest(".citation-link")
      ) {
        return;
      }

      // Verifica se è un doppio touch (entro 300ms e stesso target)
      if (now - lastTouchTimeRef.current < 300 && lastTouchTargetRef.current === target) {
        e.preventDefault();
        const touch = e.touches[0];
        toggleBookmark(touch.clientX, touch.clientY);
        lastTouchTimeRef.current = 0;
        lastTouchTargetRef.current = null;
      } else {
        lastTouchTimeRef.current = now;
        lastTouchTargetRef.current = target;
      }
    },
    [toggleBookmark],
  );

  // Aggiunge gli event listener per doppio click e touch
  useEffect(() => {
    if (!isInitialized || !contentContainerRef.current) return;

    const container = contentContainerRef.current;
    container.addEventListener("dblclick", handleDoubleClick);
    container.addEventListener("touchstart", handleTouchStart, { passive: false });

    return () => {
      container.removeEventListener("dblclick", handleDoubleClick);
      container.removeEventListener("touchstart", handleTouchStart);
    };
  }, [isInitialized, handleDoubleClick, handleTouchStart]);

  // Calcola le posizioni dei segnalibri
  // Le posizioni sono salvate come offsetTop relativo al contenitore
  const updateBookmarkPositions = useCallback(() => {
    const positions = new Map<string, number>();

    bookmarks.forEach((bookmark) => {
      // offsetTop è la posizione relativa al contenitore (dalla parte superiore del contenitore)
      // La usiamo direttamente
      positions.set(bookmark.id, bookmark.offsetTop);
    });

    setBookmarkPositions(positions);
  }, [bookmarks]);

  // Aggiorna le posizioni dei segnalibri quando cambiano i bookmarks o quando la finestra viene ridimensionata
  useEffect(() => {
    if (!isInitialized) return;
    // Usa requestAnimationFrame per evitare warning del linter
    requestAnimationFrame(() => {
      updateBookmarkPositions();
    });
  }, [isInitialized, bookmarks, updateBookmarkPositions]);

  // Aggiorna le posizioni e il containerRect quando la finestra viene ridimensionata o scrollata
  useEffect(() => {
    if (!isInitialized) return;

    const updatePositions = () => {
      if (contentContainerRef.current) {
        setContainerRect(contentContainerRef.current.getBoundingClientRect());
      }
      updateBookmarkPositions();
    };

    window.addEventListener("resize", updatePositions);
    window.addEventListener("scroll", updatePositions);

    // Usa ResizeObserver per osservare i cambiamenti di dimensione del contenitore
    if (contentContainerRef.current) {
      resizeObserverRef.current = new ResizeObserver(updatePositions);
      resizeObserverRef.current.observe(contentContainerRef.current);
    }

    return () => {
      window.removeEventListener("resize", updatePositions);
      window.removeEventListener("scroll", updatePositions);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [isInitialized, updateBookmarkPositions]);

  // Funzione per eliminare un segnalibro quando si clicca sull'icona
  const handleBookmarkClick = useCallback(async (bookmarkId: string) => {
    await bookmarksStorage.deleteBookmark(bookmarkId);
    setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
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
        width: "1.5rem",
        height: containerRect.height,
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
            title="Clicca per rimuovere il segnalibro"
            aria-label="Rimuovi segnalibro"
          >
            <BookmarkIcon className="w-3 h-3 fill-current group-hover:hidden" />
            <Minus className="w-3 h-3 hidden group-hover:block" />
          </button>
        );
      })}
    </div>
  );
}
