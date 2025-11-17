/* **************************************************
 * Imports
 **************************************************/
import { createOrUpdateFile, deleteFile, getFileContent, listDirectoryFiles } from "./client";
import { getAllArticles } from "./articles";
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
    const orderA = a.order ?? Infinity;
    const orderB = b.order ?? Infinity;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
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
  const slug = author.slug || author.name.toLowerCase().replace(/\s+/g, "-");

  // Se order non è specificato, assegna l'ultimo order + 1
  let order = author.order;
  if (order === undefined) {
    const allAuthors = await getAllAuthors();
    const maxOrder = allAuthors.reduce((max, auth) => {
      const authOrder = auth.order ?? 0;
      return Math.max(max, authOrder);
    }, -1);
    order = maxOrder + 1;
  }

  const filePath = `content/authors/${slug}.json`;
  const content = JSON.stringify(
    {
      slug,
      name: author.name,
      description: author.description,
      order,
    },
    null,
    2,
  );

  await createOrUpdateFile(filePath, content, `Create author: ${author.name}`);
  return { ...author, slug, order };
}

export async function updateAuthor(slug: string, author: Partial<Omit<Author, "slug">>) {
  const existing = await getAuthorBySlug(slug);
  if (!existing) {
    throw new Error(`Author ${slug} not found`);
  }

  const updated: Author = {
    slug,
    name: author.name ?? existing.name,
    description: author.description ?? existing.description,
    order: author.order !== undefined ? author.order : existing.order,
  };

  const filePath = `content/authors/${slug}.json`;
  const content = JSON.stringify(updated, null, 2);

  await createOrUpdateFile(filePath, content, `Update author: ${updated.name}`);
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

export async function updateAuthorsOrder(slugs: string[]): Promise<void> {
  // Aggiorna l'order di tutti gli autori in base alla nuova posizione
  const updatePromises = slugs.map(async (slug, index) => {
    const author = await getAuthorBySlug(slug);
    if (!author) {
      throw new Error(`Author ${slug} not found`);
    }

    const updated: Author = {
      ...author,
      order: index,
    };

    const filePath = `content/authors/${slug}.json`;
    const content = JSON.stringify(updated, null, 2);
    await createOrUpdateFile(filePath, content, `Update author order: ${author.name}`);
  });

  await Promise.all(updatePromises);
}
