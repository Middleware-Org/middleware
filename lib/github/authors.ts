/* **************************************************
 * Imports
 **************************************************/
import { createOrUpdateFile, deleteFile, getFileContent, listDirectoryFiles, renameFile } from "./client";
import { getAllArticles } from "./articles";
import { generateSlug, generateUniqueSlug } from "./utils";
import type { Author } from "./types";

/* **************************************************
 * Authors
 ************************************************** */
export async function getAllAuthors(): Promise<Author[]> {
  const files = await listDirectoryFiles("content/authors");
  const jsonFiles = files.filter((f) => f.type === "file" && f.name.endsWith(".json"));

  const authors = await Promise.all(
    jsonFiles.map(async (file) => {
      try {
        const content = await getFileContent(file.path);

        if (!content || content.trim().length === 0) {
          return null;
        }

        const author = JSON.parse(content) as Author;
        author.slug = file.name.replace(".json", "");
        return author;
      } catch {
        return null;
      }
    }),
  );

  const validAuthors = authors.filter((author): author is Author => author !== null);

  return validAuthors.sort((a, b) => {
    return a.name.localeCompare(b.name);
  });
}

export async function getAuthorBySlug(slug: string): Promise<Author | undefined> {
  try {
    const content = await getFileContent(`content/authors/${slug}.json`);

    // Valida che il contenuto non sia vuoto
    if (!content || content.trim().length === 0) {
      return undefined;
    }

    const author = JSON.parse(content) as Author;
    author.slug = slug;
    return author;
  } catch {
    return undefined;
  }
}

export async function createAuthor(author: Omit<Author, "slug"> & { slug?: string }) {
  // Generate slug from name if not provided
  const baseSlug = author.slug || generateSlug(author.name);

  // Ensure slug is unique
  const slug = await generateUniqueSlug("content/authors", baseSlug, ".json");

  const filePath = `content/authors/${slug}.json`;
  const content = JSON.stringify(
    {
      slug,
      name: author.name,
      description: author.description,
    },
    null,
    2,
  );

  await createOrUpdateFile(filePath, content, `Create author: ${author.name}`);
  return { ...author, slug };
}

export async function updateAuthor(
  slug: string,
  author: Partial<Omit<Author, "slug">> & { newSlug?: string },
) {
  const existing = await getAuthorBySlug(slug);
  if (!existing) {
    throw new Error(`Author ${slug} not found`);
  }

  // Gestisci cambio slug se necessario
  let finalSlug = slug;
  if (author.newSlug && author.newSlug.trim() !== slug) {
    const baseSlug = author.newSlug.trim();
    finalSlug = await generateUniqueSlug("content/authors", baseSlug, ".json", slug);
  }

  const updated: Author = {
    slug: finalSlug,
    name: author.name ?? existing.name,
    description: author.description ?? existing.description,
  };

  const content = JSON.stringify(updated, null, 2);
  const newFilePath = `content/authors/${finalSlug}.json`;
  const oldFilePath = `content/authors/${slug}.json`;

  // Se lo slug è cambiato, rinomina il file, altrimenti aggiorna normalmente
  if (finalSlug !== slug) {
    await renameFile(oldFilePath, newFilePath, content, `Rename author: ${updated.name} (${slug} -> ${finalSlug})`);
  } else {
    await createOrUpdateFile(newFilePath, content, `Update author: ${updated.name}`);
  }

  return updated;
}

export async function deleteAuthor(slug: string) {
  // Verifica se l'autore esiste
  const author = await getAuthorBySlug(slug);
  if (!author) {
    throw new Error(`Author ${slug} not found`);
  }

  // Verifica se ci sono articoli che usano questo autore
  const articles = await getAllArticles();
  const articlesUsingAuthor = articles.filter((article) => article.author === slug);

  if (articlesUsingAuthor.length > 0) {
    const articleTitles = articlesUsingAuthor.map((a) => a.title).join(", ");
    throw new Error(
      `Cannot delete author "${author.name}" because it is used by ${articlesUsingAuthor.length} article(s): ${articleTitles}`,
    );
  }

  // Se non ci sono articoli che usano l'autore, procedi con l'eliminazione
  const filePath = `content/authors/${slug}.json`;
  await deleteFile(filePath, `Delete author: ${slug}`);
}
