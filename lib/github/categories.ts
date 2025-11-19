/* **************************************************
 * Imports
 **************************************************/
import { createOrUpdateFile, deleteFile, getFileContent, listDirectoryFiles, renameFile } from "./client";
import { getAllArticles } from "./articles";
import { generateSlug, generateUniqueSlug } from "./utils";
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

        if (!content || content.trim().length === 0) {
          return null;
        }

        const category = JSON.parse(content) as Category;
        category.slug = file.name.replace(".json", "");
        return category;
      } catch {
        return null;
      }
    }),
  );

  const validCategories = categories.filter((cat): cat is Category => cat !== null);

  return validCategories.sort((a, b) => {
    const orderA = a.order ?? Infinity;
    const orderB = b.order ?? Infinity;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return a.name.localeCompare(b.name);
  });
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
  } catch {
    return undefined;
  }
}

export async function createCategory(category: Omit<Category, "slug"> & { slug?: string }) {
  // Generate slug from name if not provided
  const baseSlug = category.slug || generateSlug(category.name);

  // Ensure slug is unique
  const slug = await generateUniqueSlug("content/categories", baseSlug, ".json");

  // Se order non è specificato, assegna l'ultimo order + 1
  let order = category.order;
  if (order === undefined) {
    const allCategories = await getAllCategories();
    const maxOrder = allCategories.reduce((max, cat) => {
      const catOrder = cat.order ?? 0;
      return Math.max(max, catOrder);
    }, -1);
    order = maxOrder + 1;
  }

  const filePath = `content/categories/${slug}.json`;
  const content = JSON.stringify(
    {
      slug,
      name: category.name,
      description: category.description,
      order,
    },
    null,
    2,
  );

  await createOrUpdateFile(filePath, content, `Create category: ${category.name}`);
  return { ...category, slug, order };
}

export async function updateCategory(
  slug: string,
  category: Partial<Omit<Category, "slug">> & { newSlug?: string },
) {
  const existing = await getCategoryBySlug(slug);
  if (!existing) {
    throw new Error(`Category ${slug} not found`);
  }

  // Gestisci cambio slug se necessario
  let finalSlug = slug;
  if (category.newSlug && category.newSlug.trim() !== slug) {
    const baseSlug = category.newSlug.trim();
    finalSlug = await generateUniqueSlug("content/categories", baseSlug, ".json", slug);
  }

  const updated: Category = {
    slug: finalSlug,
    name: category.name ?? existing.name,
    description: category.description ?? existing.description,
    order: category.order !== undefined ? category.order : existing.order,
  };

  const content = JSON.stringify(updated, null, 2);
  const newFilePath = `content/categories/${finalSlug}.json`;
  const oldFilePath = `content/categories/${slug}.json`;

  // Se lo slug è cambiato, rinomina il file, altrimenti aggiorna normalmente
  if (finalSlug !== slug) {
    await renameFile(oldFilePath, newFilePath, content, `Rename category: ${updated.name} (${slug} -> ${finalSlug})`);
  } else {
    await createOrUpdateFile(newFilePath, content, `Update category: ${updated.name}`);
  }

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

export async function updateCategoriesOrder(slugs: string[]): Promise<void> {
  // Aggiorna l'order di tutte le categorie in base alla nuova posizione
  const updatePromises = slugs.map(async (slug, index) => {
    const category = await getCategoryBySlug(slug);
    if (!category) {
      throw new Error(`Category ${slug} not found`);
    }

    const updated: Category = {
      ...category,
      order: index,
    };

    const filePath = `content/categories/${slug}.json`;
    const content = JSON.stringify(updated, null, 2);
    await createOrUpdateFile(filePath, content, `Update category order: ${category.name}`);
  });

  await Promise.all(updatePromises);
}
