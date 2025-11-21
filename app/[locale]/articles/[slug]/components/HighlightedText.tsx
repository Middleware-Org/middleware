"use client";

/* **************************************************
 * Imports
 **************************************************/
import { useMemo } from "react";
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

type HighlightedTextProps = {
  text: string;
  segments: AudioSegment[];
  currentSegmentId: number | null;
};

/* **************************************************
 * HighlightedText
 **************************************************/
export default function HighlightedText({
  text,
  segments,
  currentSegmentId,
}: HighlightedTextProps) {
  const highlightedContent = useMemo(() => {
    if (!segments.length || !text) {
      return <>{text}</>;
    }

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

      // Crea la mappa delle posizioni
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

    // Normalizza il testo con mappa
    const { normalized: normalizedText, positionMap: textPositionMap } = normalizeWithMap(text);

    // Ordina i segmenti per ID in ordine inverso
    const sortedSegments = [...segments].sort((a, b) => b.id - a.id);
    const highlightedRanges: Array<{ start: number; end: number; segmentId: number }> = [];

    sortedSegments.forEach((segment) => {
      const segmentText = segment.text.trim();

      // Per testi brevi (titolo/excerpt), richiediamo match più precisi
      const isShortText = text.length < 200;
      const isVeryShortText = text.length < 50; // Titolo molto corto
      const segmentWords = segmentText.split(/\s+/).filter((w) => w.length > 0);
      const minWordsForMatch = isShortText ? Math.max(2, Math.floor(segmentWords.length * 0.7)) : 1;

      // Per testi molto corti (titolo), richiediamo match quasi perfetti
      if (isVeryShortText) {
        // Normalizza entrambi i testi per confronto
        const { normalized: normalizedSegment } = normalizeWithMap(segmentText);
        const { normalized: normalizedTextOnly } = normalizeWithMap(text);
        
        // Rimuovi punteggiatura finale per confronto più flessibile
        const segmentClean = normalizedSegment.replace(/[.,;:!?]$/, "").trim();
        const textClean = normalizedTextOnly.replace(/[.,;:!?]$/, "").trim();
        
        // Richiedi che il testo normalizzato del segmento sia contenuto nel testo normalizzato
        // e che copra almeno l'80% del testo (per evitare match parziali)
        if (textClean.includes(segmentClean) && segmentClean.length >= textClean.length * 0.8) {
          // Match quasi perfetto per titoli corti
          highlightedRanges.push({ start: 0, end: text.length, segmentId: segment.id });
        }
        return;
      }

      // Cerca match esatto
      const escapedText = segmentText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escapedText, "gi");
      const match = regex.exec(text);

      if (match) {
        const start = match.index;
        const end = start + match[0].length;
        
        // Per testi brevi, verifica che il match sia abbastanza lungo
        // e che non sia solo una parte del testo (evita match parziali)
        if (!isShortText || (match[0].length >= segmentText.length * 0.9 && match[0].length >= text.length * 0.5)) {
          highlightedRanges.push({ start, end, segmentId: segment.id });
        }
        return;
      }

      // Se non troviamo match esatti, prova con una versione normalizzata
      const { normalized: normalizedSegment } = normalizeWithMap(segmentText);
      
      // Per testi brevi, richiediamo che almeno il 70% delle parole del segmento siano presenti
      if (isShortText && segmentWords.length >= 3) {
        const segmentWordsNormalized = normalizedSegment.split(/\s+/).filter((w) => w.length > 0);
        const requiredWords = segmentWordsNormalized.slice(0, Math.max(minWordsForMatch, segmentWordsNormalized.length - 1));
        
        // Cerca le parole richieste in sequenza
        const wordsPattern = requiredWords.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("\\s+");
        const wordsRegex = new RegExp(wordsPattern, "gi");
        const wordsMatch = wordsRegex.exec(normalizedText);
        
        if (wordsMatch) {
          // Verifica che il match sia abbastanza lungo rispetto al segmento originale
          const matchLength = wordsMatch[0].length;
          const segmentLength = normalizedSegment.length;
          
          // Per testi molto corti, richiedi che il match copra almeno l'80% del testo stesso
          // per evitare match parziali in testi più lunghi
          const textLength = normalizedText.length;
          const matchCoverage = matchLength / textLength;
          const segmentCoverage = matchLength / segmentLength;
          
          if (segmentCoverage >= 0.7 && (!isVeryShortText || matchCoverage >= 0.8)) {
            const normalizedStart = wordsMatch.index;
            const normalizedEnd = normalizedStart + wordsMatch[0].length;

            // Converti le posizioni normalizzate alle posizioni originali
            let originalStart = -1;
            let originalEnd = -1;

            for (const mapEntry of textPositionMap) {
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
              // Verifica sovrapposizioni
              const overlaps = highlightedRanges.some(
                (range) => !(originalEnd <= range.start || originalStart >= range.end),
              );

              if (!overlaps) {
                highlightedRanges.push({ start: originalStart, end: originalEnd, segmentId: segment.id });
              }
            }
          }
        }
        return;
      }

      // Per testi più lunghi o segmenti corti, usa il matching normale
      const normalizedEscaped = normalizedSegment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const normalizedRegex = new RegExp(normalizedEscaped, "gi");
      const normalizedMatch = normalizedRegex.exec(normalizedText);

      if (normalizedMatch) {
        const normalizedStart = normalizedMatch.index;
        const normalizedEnd = normalizedStart + normalizedMatch[0].length;

        // Verifica che il match sia abbastanza lungo (almeno 60% del segmento originale)
        const matchLength = normalizedMatch[0].length;
        const segmentLength = normalizedSegment.length;
        
        if (matchLength >= segmentLength * 0.6) {
          // Converti le posizioni normalizzate alle posizioni originali
          let originalStart = -1;
          let originalEnd = -1;

          for (const mapEntry of textPositionMap) {
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
            // Verifica sovrapposizioni
            const overlaps = highlightedRanges.some(
              (range) => !(originalEnd <= range.start || originalStart >= range.end),
            );

            if (!overlaps) {
              highlightedRanges.push({ start: originalStart, end: originalEnd, segmentId: segment.id });
            }
          }
        }
      }
    });

    // Ordina gli intervalli per posizione (dall'ultimo al primo)
    highlightedRanges.sort((a, b) => b.start - a.start);

    // Crea gli elementi React
    const elements: React.ReactNode[] = [];
    let lastIndex = text.length;

    for (const range of highlightedRanges) {
      // Aggiungi il testo dopo il range
      if (range.end < lastIndex) {
        elements.unshift(text.substring(range.end, lastIndex));
      }

      // Aggiungi il testo evidenziato
      const isActive = currentSegmentId === range.segmentId;
      const highlightedText = text.substring(range.start, range.end);
      elements.unshift(
        <span
          key={`${range.segmentId}-${range.start}`}
          data-segment-id={range.segmentId}
          className={cn(
            "transition-colors duration-200",
            isActive ? "bg-tertiary text-white" : "",
          )}
        >
          {highlightedText}
        </span>,
      );

      lastIndex = range.start;
    }

    // Aggiungi il testo prima del primo range
    if (lastIndex > 0) {
      elements.unshift(text.substring(0, lastIndex));
    }

    return <>{elements}</>;
  }, [text, segments, currentSegmentId]);

  return highlightedContent;
}

