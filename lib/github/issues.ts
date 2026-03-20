/* **************************************************
 * Imports
 **************************************************/
import { randomUUID } from "crypto";

import { getAllArticles } from "./articles";
import {
  createOrUpdateFile,
  deleteFile,
  getFileContent,
  listDirectoryFiles,
  renameFile,
} from "./client";
import type { Issue } from "./types";
import { generateSlug, generateUniqueSlug } from "./utils";


/* **************************************************
 * Issues
 ************************************************** */
export async function getAllIssues(): Promise<Issue[]> {
  const files = await listDirectoryFiles("content/issues");
  const jsonFiles = files.filter((f) => f.type === "file" && f.name.endsWith(".json"));

  const issues = await Promise.all(
    jsonFiles.map(async (file) => {
      try {
        const content = await getFileContent(file.path);

        if (!content || content.trim().length === 0) {
          return null;
        }

        const issue = JSON.parse(content) as Issue;
        issue.slug = file.name.replace(".json", "");
        return issue;
      } catch {
        return null;
      }
    }),
  );

  const validIssues = issues.filter((issue): issue is Issue => issue !== null);

  return validIssues.sort((a, b) => {
    return b.last_update.localeCompare(a.last_update); // Most recent first
  });
}

export async function getIssueBySlug(slug: string): Promise<Issue | undefined> {
  try {
    const content = await getFileContent(`content/issues/${slug}.json`);

    if (!content || content.trim().length === 0) {
      return undefined;
    }

    const issue = JSON.parse(content) as Issue;
    issue.slug = slug;
    return issue;
  } catch {
    return undefined;
  }
}

export async function getIssueById(id: string): Promise<Issue | undefined> {
  const issues = await getAllIssues();
  return issues.find((i) => i.id === id);
}

export async function createIssue(
  issue: Omit<Issue, "slug" | "id" | "articlesOrder" | "showOrder"> & {
    slug?: string;
    showOrder?: boolean;
    createdBy: string;
  },
) {
  // Generate slug from title if not provided
  const baseSlug = issue.slug || generateSlug(issue.title);

  // Ensure slug is unique
  const slug = await generateUniqueSlug("content/issues", baseSlug, ".json");
  const id = randomUUID();

  const filePath = `content/issues/${slug}.json`;
  const content = JSON.stringify(
    {
      id,
      slug,
      title: issue.title,
      description: issue.description,
      cover: issue.cover,
      color: issue.color,
      date: issue.date,
      last_update: issue.last_update || issue.date,
      published: issue.published ?? false,
      articlesOrder: [],
      showOrder: issue.showOrder ?? false,
      createdBy: issue.createdBy,
    },
    null,
    2,
  );

  await createOrUpdateFile(filePath, content, `Create issue: ${issue.title}`);
  return { ...issue, id, slug, articlesOrder: [], showOrder: issue.showOrder ?? false };
}

export async function updateIssue(
  slug: string,
  issue: Partial<Omit<Issue, "slug" | "id" | "createdBy">> & { newSlug?: string },
) {
  const existing = await getIssueBySlug(slug);
  if (!existing) {
    throw new Error(`Issue ${slug} not found`);
  }

  // Gestisci cambio slug se necessario
  let finalSlug = slug;
  if (issue.newSlug && issue.newSlug.trim() !== slug) {
    const baseSlug = issue.newSlug.trim();
    finalSlug = await generateUniqueSlug("content/issues", baseSlug, ".json", slug);
  }

  // All'aggiornamento, last_update diventa la data e ora corrente
  const currentDateTime = new Date().toISOString();

  const updated: Issue = {
    id: existing.id,
    slug: finalSlug,
    title: issue.title ?? existing.title,
    description: issue.description ?? existing.description,
    cover: issue.cover ?? existing.cover,
    color: issue.color ?? existing.color,
    date: issue.date ?? existing.date,
    last_update: currentDateTime,
    published: issue.published !== undefined ? issue.published : existing.published,
    articlesOrder: issue.articlesOrder ?? existing.articlesOrder,
    showOrder: issue.showOrder !== undefined ? issue.showOrder : existing.showOrder,
    createdBy: existing.createdBy,
  };

  const content = JSON.stringify(
    {
      id: updated.id,
      slug: updated.slug,
      title: updated.title,
      description: updated.description,
      cover: updated.cover,
      color: updated.color,
      date: updated.date,
      last_update: updated.last_update,
      published: updated.published,
      articlesOrder: updated.articlesOrder,
      showOrder: updated.showOrder,
      createdBy: updated.createdBy,
    },
    null,
    2,
  );
  const newFilePath = `content/issues/${finalSlug}.json`;
  const oldFilePath = `content/issues/${slug}.json`;

  // Se lo slug è cambiato, rinomina il file, altrimenti aggiorna normalmente
  if (finalSlug !== slug) {
    await renameFile(
      oldFilePath,
      newFilePath,
      content,
      `Rename issue: ${updated.title} (${slug} -> ${finalSlug})`,
    );
  } else {
    await createOrUpdateFile(newFilePath, content, `Update issue: ${updated.title}`);
  }

  return updated;
}

export async function deleteIssue(slug: string) {
  // Verifica se l'issue esiste
  const issue = await getIssueBySlug(slug);
  if (!issue) {
    throw new Error(`Issue ${slug} not found`);
  }

  // Verifica se ci sono articoli che usano questa issue
  const articles = await getAllArticles();
  const articlesUsingIssue = articles.filter((article) => article.issueId === issue.id);

  if (articlesUsingIssue.length > 0) {
    const articleTitles = articlesUsingIssue.map((a) => a.title).join(", ");
    throw new Error(
      `Cannot delete issue "${issue.title}" because it is used by ${articlesUsingIssue.length} article(s): ${articleTitles}`,
    );
  }

  // Se non ci sono articoli che usano l'issue, procedi con l'eliminazione
  const filePath = `content/issues/${slug}.json`;
  await deleteFile(filePath, `Delete issue: ${slug}`);
}

/* **************************************************
 * Ordering helpers
 ************************************************** */

/**
 * Salva l'ordine completo degli articoli in una issue.
 * Questa è l'operazione usata dal drag & drop: salva la lista finale degli UUID.
 */
export async function reorderArticlesInIssue(
  issueSlug: string,
  orderedIds: string[],
): Promise<void> {
  const existing = await getIssueBySlug(issueSlug);
  if (!existing) {
    throw new Error(`Issue ${issueSlug} not found`);
  }

  const currentDateTime = new Date().toISOString();
  const content = JSON.stringify(
    {
      id: existing.id,
      slug: existing.slug,
      title: existing.title,
      description: existing.description,
      cover: existing.cover,
      color: existing.color,
      date: existing.date,
      last_update: currentDateTime,
      published: existing.published,
      articlesOrder: orderedIds,
      showOrder: existing.showOrder,
      createdBy: existing.createdBy,
    },
    null,
    2,
  );

  await createOrUpdateFile(
    `content/issues/${issueSlug}.json`,
    content,
    `Reorder articles in issue: ${existing.title}`,
  );
}

/**
 * Aggiunge l'UUID di un articolo in fondo all'ordine di una issue.
 * Idempotente: se l'UUID è già presente, non lo duplica.
 */
export async function addArticleToIssue(issueSlug: string, articleId: string): Promise<void> {
  const existing = await getIssueBySlug(issueSlug);
  if (!existing) {
    throw new Error(`Issue ${issueSlug} not found`);
  }

  // Idempotente: skip se già presente
  if (existing.articlesOrder.includes(articleId)) {
    return;
  }

  const newOrder = [...existing.articlesOrder, articleId];
  await reorderArticlesInIssue(issueSlug, newOrder);
}

/**
 * Rimuove l'UUID di un articolo dall'ordine di una issue.
 */
export async function removeArticleFromIssue(issueSlug: string, articleId: string): Promise<void> {
  const existing = await getIssueBySlug(issueSlug);
  if (!existing) {
    // Issue non trovata (potrebbe essere già stata eliminata): non è un errore critico
    return;
  }

  const newOrder = existing.articlesOrder.filter((id) => id !== articleId);
  if (newOrder.length === existing.articlesOrder.length) {
    // L'UUID non era nell'ordine: no-op
    return;
  }

  await reorderArticlesInIssue(issueSlug, newOrder);
}
