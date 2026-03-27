/* **************************************************
 * Imports
 **************************************************/
import { marked } from "marked";

import { sanitizeInlineHtml, sanitizeRichHtml } from "@/lib/security/sanitizeHtml";

/* **************************************************
 * Types
 **************************************************/
export type Citation = { id: string; text: string; index: number };

export type ProcessedCitations = {
  processedHtml: string;
  citations: Citation[];
};

/* **************************************************
 * processCitations
 **************************************************/
export function processCitations(content: string): ProcessedCitations {
  const citations: Citation[] = [];
  const citationOrder: string[] = [];
  const citationData = new Map<string, string>();

  // Prima passata: estrai tutte le citazioni nell'ordine in cui appaiono
  // Formato: [citation:ID:text] o [citation-ID] (formato vecchio)
  const citationRegex = /\[citation:([^:]+):([^\]]+)\]/g;
  let match;

  while ((match = citationRegex.exec(content)) !== null) {
    const citationId = match[1];
    const citationText = match[2].replace(/\\:/g, ":");

    if (citationId && citationText && !citationOrder.includes(citationId)) {
      citationOrder.push(citationId);
      citationData.set(citationId, citationText);
    }
  }

  // Supporta anche il formato vecchio [citation-ID]
  const oldCitationRegex = /\[citation-([^\]]+)\]/g;
  while ((match = oldCitationRegex.exec(content)) !== null) {
    const citationId = match[1];
    if (citationId && !citationOrder.includes(citationId)) {
      citationOrder.push(citationId);
      citationData.set(citationId, "");
    }
  }

  // Crea l'array delle citazioni con gli indici corretti
  citationOrder.forEach((citationId, index) => {
    const text = citationData.get(citationId) || "";
    if (text || citationId) {
      citations.push({
        id: citationId,
        text: sanitizeInlineHtml(text),
        index: index + 1,
      });
    }
  });

  // Sostituisci le citazioni con link cliccabili
  let processedContent = content;
  let currentIndex = 0;
  const indexMap = new Map<string, number>();

  // Sostituisci formato nuovo [citation:ID:text]
  processedContent = processedContent.replace(
    /\[citation:([^:]+):([^\]]+)\]/g,
    (_, citationId) => {
      if (!indexMap.has(citationId)) {
        currentIndex++;
        indexMap.set(citationId, currentIndex);
      }
      const index = indexMap.get(citationId) || 1;
      return `<a id="cit-${index}" href="#citation-${index}" class="citation-link inline text-tertiary hover:text-tertiary/80 transition-colors cursor-pointer" style="font-size: 0.7em; vertical-align: super; text-decoration: none;">${index}</a>`;
    },
  );

  // Sostituisci formato vecchio [citation-ID]
  processedContent = processedContent.replace(/\[citation-([^\]]+)\]/g, (_, citationId) => {
    if (!indexMap.has(citationId)) {
      currentIndex++;
      indexMap.set(citationId, currentIndex);
    }
    const index = indexMap.get(citationId) || 1;
    return `<a href="#citation-${index}" class="citation-link inline text-tertiary hover:text-tertiary/80 transition-colors cursor-pointer" style="font-size: 0.7em; vertical-align: super; text-decoration: none;">${index}</a>`;
  });

  // Se il contenuto non sembra essere HTML già processato, convertilo da markdown
  let processedHtml = processedContent;
  if (!processedContent.includes("<p>") && !processedContent.includes("<h")) {
    processedHtml = marked.parse(processedContent, { breaks: true }) as string;
  }

  return {
    processedHtml: sanitizeRichHtml(processedHtml),
    citations,
  };
}
