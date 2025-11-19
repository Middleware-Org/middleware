/* **************************************************
 * Imports
 **************************************************/
import matter from "gray-matter";
import {
  createOrUpdateFile,
  deleteFile,
  getFileContent,
  listDirectoryFiles,
  renameFile,
} from "./client";
import { generateSlug, generateUniqueSlug } from "./utils";
import type { Page } from "./types";

/* **************************************************
 * Pages
 ************************************************** */
export async function getAllPages(): Promise<Page[]> {
  const files = await listDirectoryFiles("content/pages");
  const mdFiles = files.filter((f) => f.type === "file" && f.name.endsWith(".md"));

  const pages = await Promise.all(
    mdFiles.map(async (file) => {
      try {
        const content = await getFileContent(file.path);

        if (!content || content.trim().length === 0) {
          return null;
        }

        const { data, content: markdownContent } = matter(content);

        return {
          slug: data.slug || file.name.replace(".md", ""),
          content: markdownContent,
        } as Page;
      } catch {
        return null;
      }
    }),
  );

  return pages.filter((p): p is Page => p !== null);
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  try {
    const content = await getFileContent(`content/pages/${slug}.md`);

    if (!content || content.trim().length === 0) {
      return null;
    }

    const { data, content: markdownContent } = matter(content);

    return {
      slug: data.slug || slug,
      content: markdownContent,
    };
  } catch {
    return null;
  }
}

export async function createPage(page: Omit<Page, "slug"> & { slug?: string }): Promise<Page> {
  const baseSlug = page.slug || generateSlug("page");
  const slug = await generateUniqueSlug("content/pages", baseSlug, ".md");

  const frontmatter = {
    slug,
  };

  const content = matter.stringify(page.content, frontmatter);

  await createOrUpdateFile(`content/pages/${slug}.md`, content, `Create page: ${slug}`);

  return {
    slug,
    content: page.content,
  };
}

export async function updatePage(
  slug: string,
  page: Partial<Omit<Page, "slug">> & { newSlug?: string },
): Promise<Page> {
  const existing = await getPageBySlug(slug);
  if (!existing) {
    throw new Error(`Page with slug "${slug}" not found`);
  }

  let finalSlug = slug;
  if (page.newSlug && page.newSlug.trim() !== slug) {
    const baseSlug = page.newSlug.trim();
    finalSlug = await generateUniqueSlug("content/pages", baseSlug, ".md", slug);
  }

  const updated: Page = {
    slug: finalSlug,
    content: page.content !== undefined ? page.content : existing.content,
  };

  const frontmatter = {
    slug: finalSlug,
  };

  const content = matter.stringify(updated.content, frontmatter);
  const newFilePath = `content/pages/${finalSlug}.md`;
  const oldFilePath = `content/pages/${slug}.md`;

  if (finalSlug !== slug) {
    await renameFile(oldFilePath, newFilePath, content, `Rename page: ${slug} -> ${finalSlug}`);
  } else {
    await createOrUpdateFile(newFilePath, content, `Update page: ${finalSlug}`);
  }

  return updated;
}

export async function deletePage(slug: string): Promise<void> {
  await deleteFile(`content/pages/${slug}.md`, `Delete page: ${slug}`);
}
