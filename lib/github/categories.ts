/* **************************************************
 * Imports
 **************************************************/
import { createOrUpdateFile, deleteFile, getFileContent, listDirectoryFiles } from "./client";
import { getAllArticles } from "./articles";
import type { Category } from "./types";

/* **************************************************
 * Categories
 ************************************************** */
export async function getAllCategories(): Promise<Category[]> {
  const files = await listDirectoryFiles("content/categories");
  const jsonFiles = files.filter((f) => f.type === "file" && f.name.endsWith(".json"));

  const categories = await Promise.all(
    jsonFiles.map(async (file) => {
      try {
        const content = await getFileContent(file.path);

        // Valida che il contenuto non sia vuoto
        if (!content || content.trim().length === 0) {
          console.warn(`File ${file.path} is empty, skipping`);
          return null;
        }

        const category = JSON.parse(content) as Category;
        category.slug = file.name.replace(".json", "");
        return category;
      } catch (error) {
        console.error(`Error parsing category file ${file.path}:`, error);
        return null;
      }
    }),
  );

  // Filtra i valori null (file non validi)
  return categories.filter((cat): cat is Category => cat !== null);
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  try {
    const content = await getFileContent(`content/categories/${slug}.json`);

    // Valida che il contenuto non sia vuoto
    if (!content || content.trim().length === 0) {
      return undefined;
    }

    const category = JSON.parse(content) as Category;
    category.slug = slug;
    return category;
  } catch (error) {
    console.error(`Error getting category ${slug}:`, error);
    return undefined;
  }
}

export async function createCategory(category: Omit<Category, "slug"> & { slug?: string }) {
  const slug = category.slug || category.name.toLowerCase().replace(/\s+/g, "-");
  const filePath = `content/categories/${slug}.json`;
  const content = JSON.stringify(
    {
      slug,
      name: category.name,
      description: category.description,
    },
    null,
    2,
  );

  await createOrUpdateFile(filePath, content, `Create category: ${category.name}`);
  return { ...category, slug };
}

export async function updateCategory(slug: string, category: Partial<Omit<Category, "slug">>) {
  const existing = await getCategoryBySlug(slug);
  if (!existing) {
    throw new Error(`Category ${slug} not found`);
  }

  const updated: Category = {
    slug,
    name: category.name ?? existing.name,
    description: category.description ?? existing.description,
  };

  const filePath = `content/categories/${slug}.json`;
  const content = JSON.stringify(updated, null, 2);

  await createOrUpdateFile(filePath, content, `Update category: ${updated.name}`);
  return updated;
}

export async function deleteCategory(slug: string) {
  // Verifica se la categoria esiste
  const category = await getCategoryBySlug(slug);
  if (!category) {
    throw new Error(`Category ${slug} not found`);
  }

  // Verifica se ci sono articoli che usano questa categoria
  const articles = await getAllArticles();
  const articlesUsingCategory = articles.filter((article) => article.category === slug);

  if (articlesUsingCategory.length > 0) {
    const articleTitles = articlesUsingCategory.map((a) => a.title).join(", ");
    throw new Error(
      `Cannot delete category "${category.name}" because it is used by ${articlesUsingCategory.length} article(s): ${articleTitles}`,
    );
  }

  // Se non ci sono articoli che usano la categoria, procedi con l'eliminazione
  const filePath = `content/categories/${slug}.json`;
  await deleteFile(filePath, `Delete category: ${slug}`);
}
