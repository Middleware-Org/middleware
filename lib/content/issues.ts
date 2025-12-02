/* **************************************************
 * Imports
 **************************************************/
import { issues } from "@/.velite";

/* **************************************************
 * Issues
 **************************************************/
export const getAllIssues = () =>
  issues
    .filter((i) => i.published)
    .sort((a, b) => {
      // Normalizza le date per il confronto (aggiungi orario se mancante)
      const aDate = a.last_update || a.date;
      const bDate = b.last_update || b.date;
      // Se la stringa non contiene 'T', aggiungi 'T00:00:00.000Z' per normalizzare
      const aNormalized = aDate.includes("T") ? aDate : `${aDate}T00:00:00.000Z`;
      const bNormalized = bDate.includes("T") ? bDate : `${bDate}T00:00:00.000Z`;
      return bNormalized.localeCompare(aNormalized);
    });

export const getIssueBySlug = (slug: string) => {
  const issue = issues.find((i) => i.slug === slug);
  return issue && issue.published ? issue : undefined;
};

