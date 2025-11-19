/* **************************************************
 * Imports
 **************************************************/
import {
  createOrUpdateFile,
  deleteFile,
  getFileContent,
  listDirectoryFiles,
  renameFile,
} from "./client";
import { getAllArticles } from "./articles";
import { generateSlug, generateUniqueSlug } from "./utils";
import type { Issue } from "./types";

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
    const orderA = a.order ?? Infinity;
    const orderB = b.order ?? Infinity;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return b.date.localeCompare(a.date); // Most recent first if same order
  });
}

export async function getIssueBySlug(slug: string): Promise<Issue | undefined> {
  try {
    const content = await getFileContent(`content/issues/${slug}.json`);

    // Valida che il contenuto non sia vuoto
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

export async function createIssue(issue: Omit<Issue, "slug"> & { slug?: string }) {
  // Generate slug from title if not provided
  const baseSlug = issue.slug || generateSlug(issue.title);

  // Ensure slug is unique
  const slug = await generateUniqueSlug("content/issues", baseSlug, ".json");

  // Se order non è specificato, assegna l'ultimo order + 1
  let order = issue.order;
  if (order === undefined) {
    const allIssues = await getAllIssues();
    const maxOrder = allIssues.reduce((max, iss) => {
      const issOrder = iss.order ?? 0;
      return Math.max(max, issOrder);
    }, -1);
    order = maxOrder + 1;
  }

  const filePath = `content/issues/${slug}.json`;
  const content = JSON.stringify(
    {
      slug,
      title: issue.title,
      description: issue.description,
      cover: issue.cover,
      color: issue.color,
      date: issue.date,
      order,
    },
    null,
    2,
  );

  await createOrUpdateFile(filePath, content, `Create issue: ${issue.title}`);
  return { ...issue, slug, order };
}

export async function updateIssue(
  slug: string,
  issue: Partial<Omit<Issue, "slug">> & { newSlug?: string },
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

  const updated: Issue = {
    slug: finalSlug,
    title: issue.title ?? existing.title,
    description: issue.description ?? existing.description,
    cover: issue.cover ?? existing.cover,
    color: issue.color ?? existing.color,
    date: issue.date ?? existing.date,
    order: issue.order !== undefined ? issue.order : existing.order,
  };

  const content = JSON.stringify(updated, null, 2);
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
  const articlesUsingIssue = articles.filter((article) => article.issue === slug);

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

export async function updateIssuesOrder(slugs: string[]): Promise<void> {
  // Aggiorna l'order di tutte le issue in base alla nuova posizione
  const updatePromises = slugs.map(async (slug, index) => {
    const issue = await getIssueBySlug(slug);
    if (!issue) {
      throw new Error(`Issue ${slug} not found`);
    }

    const updated: Issue = {
      ...issue,
      order: index,
    };

    const filePath = `content/issues/${slug}.json`;
    const content = JSON.stringify(updated, null, 2);
    await createOrUpdateFile(filePath, content, `Update issue order: ${issue.title}`);
  });

  await Promise.all(updatePromises);
}
