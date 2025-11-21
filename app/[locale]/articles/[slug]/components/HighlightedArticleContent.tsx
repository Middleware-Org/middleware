"use client";

/* **************************************************
 * Imports
 **************************************************/
import { useEffect, useState, useRef, useMemo } from "react";
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Types
 **************************************************/
type AudioSegment = {
  id: number;
  text: string;
  start: number;
  end: number;
};

type HighlightedArticleContentProps = {
  content: string;
  audioChunksUrl?: string;
  articleId: string;
};

/* **************************************************
 * HighlightedArticleContent
 **************************************************/
export default function HighlightedArticleContent({
  content,
  audioChunksUrl,
  articleId,
}: HighlightedArticleContentProps) {
  const [segments, setSegments] = useState<AudioSegment[]>([]);
  const [currentSegmentId, setCurrentSegmentId] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Carica i segmenti JSON
  useEffect(() => {
    if (!audioChunksUrl) {
      return;
    }

    const loadSegments = async () => {
      try {
        const response = await fetch(audioChunksUrl);
        if (!response.ok) {
          return;
        }
        const data: AudioSegment[] = await response.json();
        setSegments(data);
      } catch (error) {
        console.error("Error loading audio segments:", error);
      }
    };

    loadSegments();
  }, [audioChunksUrl]);

  // Ascolta gli eventi del tempo corrente dall'audio player
  useEffect(() => {
    if (segments.length === 0) {
      console.log("No segments loaded yet, skipping event listener");
      return;
    }

    const handleTimeUpdate = (event: CustomEvent) => {
      if (event.detail.articleId !== articleId) {
        return;
      }

      const currentTime = event.detail.currentTime;

      // Trova il segmento corrispondente al tempo corrente
      const activeSegment = segments.find(
        (segment) => currentTime >= segment.start && currentTime < segment.end,
      );

      if (activeSegment) {
        setCurrentSegmentId(activeSegment.id);
      } else {
        setCurrentSegmentId(null);
      }
    };

    window.addEventListener("audioTimeUpdate", handleTimeUpdate as EventListener);
    return () => {
      window.removeEventListener("audioTimeUpdate", handleTimeUpdate as EventListener);
    };
  }, [segments, articleId]);

  const highlightedHtml = useMemo(() => {
    if (!segments.length || !content) {
      return { __html: content };
    }

    // Funzione per estrarre il testo puro dall'HTML e creare una mappa delle posizioni
    const createTextMap = (
      html: string,
    ): {
      text: string;
      map: Array<{ htmlStart: number; htmlEnd: number; textStart: number; textEnd: number }>;
    } => {
      const map: Array<{
        htmlStart: number;
        htmlEnd: number;
        textStart: number;
        textEnd: number;
      }> = [];
      let text = "";
      let textPos = 0;
      let inTag = false;
      let currentTextStart = -1;

      for (let i = 0; i < html.length; i++) {
        if (html[i] === "<") {
          if (currentTextStart !== -1) {
            map.push({
              htmlStart: currentTextStart,
              htmlEnd: i,
              textStart: textPos - (i - currentTextStart),
              textEnd: textPos,
            });
            currentTextStart = -1;
          }
          inTag = true;
        } else if (html[i] === ">") {
          inTag = false;
        } else if (!inTag) {
          if (currentTextStart === -1) {
            currentTextStart = i;
          }
          text += html[i];
          textPos++;
        }
      }

      // Aggiungi l'ultimo segmento se presente
      if (currentTextStart !== -1) {
        map.push({
          htmlStart: currentTextStart,
          htmlEnd: html.length,
          textStart: textPos - (html.length - currentTextStart),
          textEnd: textPos,
        });
      }

      return { text, map };
    };

    // Funzione per convertire posizioni del testo puro in posizioni HTML
    const textToHtmlPositions = (
      textStart: number,
      textEnd: number,
      map: Array<{ htmlStart: number; htmlEnd: number; textStart: number; textEnd: number }>,
    ): { start: number; end: number } | null => {
      let htmlStart = -1;
      let htmlEnd = -1;

      for (const segment of map) {
        const segmentTextStart = segment.textStart;
        const segmentTextEnd = segment.textEnd;

        // Se il range inizia in questo segmento
        if (textStart >= segmentTextStart && textStart < segmentTextEnd) {
          const offset = textStart - segmentTextStart;
          htmlStart = segment.htmlStart + offset;
        }

        // Se il range finisce in questo segmento
        if (textEnd > segmentTextStart && textEnd <= segmentTextEnd) {
          const offset = textEnd - segmentTextStart;
          htmlEnd = segment.htmlStart + offset;
          break; // Abbiamo trovato sia l'inizio che la fine
        }

        // Se il range è completamente contenuto in questo segmento
        if (textStart >= segmentTextStart && textEnd <= segmentTextEnd) {
          const startOffset = textStart - segmentTextStart;
          const endOffset = textEnd - segmentTextStart;
          return {
            start: segment.htmlStart + startOffset,
            end: segment.htmlStart + endOffset,
          };
        }
      }

      if (htmlStart !== -1 && htmlEnd !== -1) {
        return { start: htmlStart, end: htmlEnd };
      }

      return null;
    };

    // Crea la mappa testo-HTML una sola volta
    const { text: plainText, map } = createTextMap(content);
    let highlightedContent = content;
    const highlightedRanges: Array<{ start: number; end: number; segmentId: number }> = [];

    // Ordina i segmenti per ID in ordine inverso per evitare problemi con sostituzioni sovrapposte
    const sortedSegments = [...segments].sort((a, b) => b.id - a.id);

    // Funzione per normalizzare il testo e creare una mappa delle posizioni
    const normalizeWithMap = (
      text: string,
    ): {
      normalized: string;
      positionMap: Array<{
        originalStart: number;
        originalEnd: number;
        normalizedStart: number;
        normalizedEnd: number;
      }>;
    } => {
      let normalized = "";
      let normalizedPos = 0;
      let originalPos = 0;

      const normalizeChar = (char: string): string => {
        return char
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/["""''«»]/g, '"')
          .replace(/[–—]/g, "-")
          .replace(/[…]/g, "...");
      };

      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const normalizedChar = normalizeChar(char);

        // Se è punteggiatura, sostituiscila con uno spazio
        if (/[^\w\s]/.test(char) && !normalizedChar.match(/[\w]/)) {
          if (normalized.length > 0 && normalized[normalized.length - 1] !== " ") {
            normalized += " ";
            normalizedPos++;
          }
          originalPos++;
          continue;
        }

        // Se è uno spazio, normalizzalo
        if (/\s/.test(char)) {
          if (normalized.length > 0 && normalized[normalized.length - 1] !== " ") {
            normalized += " ";
            normalizedPos++;
          }
          originalPos++;
          continue;
        }

        // Aggiungi il carattere normalizzato
        normalized += normalizedChar;
        normalizedPos += normalizedChar.length;
        originalPos++;
      }

      // Crea la mappa delle posizioni: ogni carattere normalizzato mappa alla sua posizione originale
      const map: Array<{
        originalStart: number;
        originalEnd: number;
        normalizedStart: number;
        normalizedEnd: number;
      }> = [];
      normalizedPos = 0;
      originalPos = 0;

      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const normalizedChar = normalizeChar(char);

        if (/[^\w\s]/.test(char) && !normalizedChar.match(/[\w]/)) {
          if (normalizedPos > 0 && normalized[normalizedPos - 1] !== " ") {
            normalizedPos++;
          }
          originalPos++;
          continue;
        }

        if (/\s/.test(char)) {
          if (normalizedPos > 0 && normalized[normalizedPos - 1] !== " ") {
            normalizedPos++;
          }
          originalPos++;
          continue;
        }

        const segmentStart = originalPos;
        const segmentEnd = originalPos + 1;
        const normalizedSegmentStart = normalizedPos;
        const normalizedSegmentEnd = normalizedPos + normalizedChar.length;

        map.push({
          originalStart: segmentStart,
          originalEnd: segmentEnd,
          normalizedStart: normalizedSegmentStart,
          normalizedEnd: normalizedSegmentEnd,
        });

        normalizedPos += normalizedChar.length;
        originalPos++;
      }

      return { normalized: normalized.trim(), positionMap: map };
    };

    // Normalizza il testo puro con mappa
    const { normalized: normalizedPlainText, positionMap: plainTextPositionMap } =
      normalizeWithMap(plainText);

    sortedSegments.forEach((segment) => {
      const segmentText = segment.text.trim();

      // Cerca il testo nel testo puro (più preciso)
      const escapedText = segmentText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escapedText, "gi");

      let match;
      const textMatches: Array<{ start: number; end: number }> = [];

      while ((match = regex.exec(plainText)) !== null) {
        const start = match.index;
        const end = start + match[0].length;
        textMatches.push({ start, end });
        break; // Prendi solo il primo match per segmento
      }

      // Se non troviamo match esatti, prova con una versione normalizzata
      if (textMatches.length === 0) {
        const { normalized: normalizedSegment } = normalizeWithMap(segmentText);

        // Cerca il testo normalizzato
        const normalizedEscaped = normalizedSegment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const normalizedRegex = new RegExp(normalizedEscaped, "gi");

        let normalizedMatch;
        while ((normalizedMatch = normalizedRegex.exec(normalizedPlainText)) !== null) {
          const normalizedStart = normalizedMatch.index;
          const normalizedEnd = normalizedStart + normalizedMatch[0].length;

          // Converti le posizioni normalizzate alle posizioni originali usando la mappa
          let originalStart = -1;
          let originalEnd = -1;

          for (const mapEntry of plainTextPositionMap) {
            if (
              normalizedStart >= mapEntry.normalizedStart &&
              normalizedStart < mapEntry.normalizedEnd &&
              originalStart === -1
            ) {
              originalStart = mapEntry.originalStart;
            }
            if (
              normalizedEnd > mapEntry.normalizedStart &&
              normalizedEnd <= mapEntry.normalizedEnd &&
              originalEnd === -1
            ) {
              originalEnd = mapEntry.originalEnd;
              break;
            }
          }

          if (originalStart >= 0 && originalEnd > originalStart) {
            textMatches.push({ start: originalStart, end: originalEnd });
            break;
          }
        }
      }

      // Se ancora non abbiamo match, prova un approccio più flessibile:
      // cerca le prime N parole del segmento
      if (textMatches.length === 0) {
        const { normalized: normalizedSegment } = normalizeWithMap(segmentText);
        const segmentWords = normalizedSegment.split(/\s+/).filter((w) => w.length > 0);
        if (segmentWords.length >= 3) {
          // Cerca le prime 3-5 parole
          const searchWords = segmentWords.slice(0, Math.min(5, segmentWords.length));
          const searchPattern = searchWords.join("\\s+");
          const searchRegex = new RegExp(searchPattern, "gi");

          let searchMatch;
          while ((searchMatch = searchRegex.exec(normalizedPlainText)) !== null) {
            // Trova la fine del match cercando le parole successive
            let matchEnd = searchMatch.index + searchMatch[0].length;
            const remainingWords = segmentWords.slice(searchWords.length);

            // Cerca di estendere il match con le parole successive
            for (const word of remainingWords.slice(0, 10)) {
              // Limita a 10 parole per evitare match troppo lunghi
              const wordPattern = "\\s+" + word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
              const wordRegex = new RegExp(wordPattern, "gi");
              wordRegex.lastIndex = matchEnd;
              const wordMatch = wordRegex.exec(normalizedPlainText);

              if (wordMatch && wordMatch.index === matchEnd) {
                matchEnd = wordMatch.index + wordMatch[0].length;
              } else {
                break;
              }
            }

            // Converti le posizioni normalizzate alle posizioni originali usando la mappa
            let originalStart = -1;
            let originalEnd = -1;

            for (const mapEntry of plainTextPositionMap) {
              if (
                searchMatch.index >= mapEntry.normalizedStart &&
                searchMatch.index < mapEntry.normalizedEnd &&
                originalStart === -1
              ) {
                originalStart = mapEntry.originalStart;
              }
              if (
                matchEnd > mapEntry.normalizedStart &&
                matchEnd <= mapEntry.normalizedEnd &&
                originalEnd === -1
              ) {
                originalEnd = mapEntry.originalEnd;
                break;
              }
            }

            if (originalStart >= 0 && originalEnd > originalStart) {
              textMatches.push({ start: originalStart, end: originalEnd });
              break;
            }
          }
        }
      }

      // Converti le posizioni del testo puro in posizioni HTML
      for (const textMatch of textMatches) {
        const htmlPos = textToHtmlPositions(textMatch.start, textMatch.end, map);
        if (htmlPos) {
          // Verifica sovrapposizioni con le evidenziazioni esistenti (ora in posizioni HTML)
          const overlaps = highlightedRanges.some(
            (range) => !(htmlPos.end <= range.start || htmlPos.start >= range.end),
          );

          if (!overlaps) {
            highlightedRanges.push({
              start: htmlPos.start,
              end: htmlPos.end,
              segmentId: segment.id,
            });
          }
        }
      }
    });

    // Ordina gli intervalli per posizione HTML (dall'ultimo al primo) e sostituisci
    highlightedRanges.sort((a, b) => b.start - a.start);

    for (const range of highlightedRanges) {
      const isActive = currentSegmentId === range.segmentId;
      const matchText = highlightedContent.substring(range.start, range.end);
      const className = cn(
        "transition-colors duration-200",
        isActive ? "bg-tertiary text-white" : "",
      );

      const replacement = `<span data-segment-id="${range.segmentId}" class="${className}">${matchText}</span>`;
      highlightedContent =
        highlightedContent.substring(0, range.start) +
        replacement +
        highlightedContent.substring(range.end);
    }

    return { __html: highlightedContent };
  }, [content, segments, currentSegmentId]);

  return (
    <div
      ref={contentRef}
      className="prose prose-lg max-w-none"
      dangerouslySetInnerHTML={highlightedHtml}
    />
  );
}
