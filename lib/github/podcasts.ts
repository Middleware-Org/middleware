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
import type { Podcast } from "./types";

/* **************************************************
 * Podcasts
 ************************************************** */
export async function getAllPodcasts(): Promise<Podcast[]> {
  const files = await listDirectoryFiles("content/podcasts");
  const mdFiles = files.filter((f) => f.type === "file" && f.name.endsWith(".md"));

  const podcasts = await Promise.all(
    mdFiles.map(async (file) => {
      try {
        const content = await getFileContent(file.path);

        if (!content || content.trim().length === 0) {
          return null;
        }

        const { data } = matter(content);

        const podcastDate = data.date as string;

        return {
          slug: data.slug || file.name.replace(".md", ""),
          title: data.title,
          description: data.description || "",
          audio: data.audio,
          audio_chunks: data.audio_chunks,
          duration: data.duration,
          published: data.published ?? false,
          date: podcastDate,
        } as Podcast;
      } catch {
        return null;
      }
    }),
  );

  const validPodcasts = podcasts.filter((podcast): podcast is Podcast => podcast !== null);

  return validPodcasts.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPodcastBySlug(slug: string): Promise<Podcast | undefined> {
  try {
    const files = await listDirectoryFiles("content/podcasts");
    const mdFiles = files.filter((f) => f.type === "file" && f.name.endsWith(".md"));

    let file = mdFiles.find((f) => f.name === `${slug}.md`);

    if (!file) {
      for (const f of mdFiles) {
        try {
          const content = await getFileContent(f.path);
          if (!content || content.trim().length === 0) continue;

          const { data } = matter(content);
          if (data.slug === slug || f.name.replace(".md", "") === slug) {
            file = f;
            break;
          }
        } catch {
          continue;
        }
      }
    }

    if (!file) {
      return undefined;
    }

    const content = await getFileContent(file.path);

    if (!content || content.trim().length === 0) {
      return undefined;
    }

    try {
      const { data } = matter(content);

      const podcastDate = (data.date as string) || new Date().toISOString().split("T")[0];

      return {
        slug: (data.slug as string) || slug,
        title: (data.title as string) || "Untitled",
        description: (data.description as string) || "",
        audio: (data.audio as string) || "",
        audio_chunks: (data.audio_chunks as string) || "",
        duration: (data.duration as number) || undefined,
        published: (data.published as boolean) ?? false,
        date: podcastDate,
      } as Podcast;
    } catch {
      return undefined;
    }
  } catch {
    return undefined;
  }
}

export async function createPodcast(podcast: Omit<Podcast, "slug"> & { slug?: string }) {
  // Generate slug from title if not provided
  const baseSlug = podcast.slug || generateSlug(podcast.title);

  // Ensure slug is unique
  const slug = await generateUniqueSlug("content/podcasts", baseSlug, ".md");

  // Crea il frontmatter
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const frontmatter: Record<string, any> = {
    slug,
    title: podcast.title,
    description: podcast.description || "",
    audio: podcast.audio,
    audio_chunks: podcast.audio_chunks,
    published: podcast.published ?? false,
    date: podcast.date,
  };

  if (podcast.duration) {
    frontmatter.duration = podcast.duration;
  }

  // I podcast non hanno contenuto markdown, solo frontmatter
  const fileContent = matter.stringify("", frontmatter);

  const filePath = `content/podcasts/${slug}.md`;
  await createOrUpdateFile(filePath, fileContent, `Create podcast: ${podcast.title}`);

  return { ...podcast, slug };
}

export async function updatePodcast(
  slug: string,
  podcast: Partial<Omit<Podcast, "slug">> & { newSlug?: string },
) {
  // Trova il file reale usando lo stesso metodo di getPodcastBySlug
  const files = await listDirectoryFiles("content/podcasts");
  const mdFiles = files.filter((f) => f.type === "file" && f.name.endsWith(".md"));

  // Prima cerca per nome file esatto
  let file = mdFiles.find((f) => f.name === `${slug}.md`);

  // Se non trovato, cerca per slug nel frontmatter
  if (!file) {
    for (const f of mdFiles) {
      try {
        const content = await getFileContent(f.path);
        if (!content || content.trim().length === 0) continue;

        const { data } = matter(content);
        if (data.slug === slug || f.name.replace(".md", "") === slug) {
          file = f;
          break;
        }
      } catch {
        continue;
      }
    }
  }

  if (!file) {
    throw new Error(`Podcast file not found for slug: ${slug}`);
  }

  const fileSlug = file.name.replace(".md", "");
  const existing = await getPodcastBySlug(slug);

  if (!existing) {
    throw new Error(`Podcast ${slug} not found`);
  }

  // Gestisci cambio slug se necessario
  let finalSlug = fileSlug;
  if (podcast.newSlug && podcast.newSlug.trim() !== fileSlug) {
    const baseSlug = podcast.newSlug.trim();
    finalSlug = await generateUniqueSlug("content/podcasts", baseSlug, ".md", fileSlug);
  }

  const updated: Podcast = {
    slug: finalSlug,
    title: podcast.title ?? existing.title,
    description: podcast.description ?? existing.description,
    audio: podcast.audio ?? existing.audio,
    audio_chunks: podcast.audio_chunks ?? existing.audio_chunks,
    duration: podcast.duration !== undefined ? podcast.duration : existing.duration,
    published: podcast.published !== undefined ? podcast.published : existing.published,
    date: podcast.date ?? existing.date,
  };

  const frontmatter: Record<string, any> = {
    slug: finalSlug,
    title: updated.title,
    description: updated.description,
    audio: updated.audio,
    audio_chunks: updated.audio_chunks,
    published: updated.published,
    date: updated.date,
  };

  if (updated.duration) {
    frontmatter.duration = updated.duration;
  }

  const fileContent = matter.stringify("", frontmatter);
  const newFilePath = `content/podcasts/${finalSlug}.md`;
  const oldFilePath = `content/podcasts/${fileSlug}.md`;

  // Se lo slug è cambiato, rinomina il file, altrimenti aggiorna normalmente
  if (finalSlug !== fileSlug) {
    await renameFile(
      oldFilePath,
      newFilePath,
      fileContent,
      `Rename podcast: ${updated.title} (${fileSlug} -> ${finalSlug})`,
    );
  } else {
    await createOrUpdateFile(newFilePath, fileContent, `Update podcast: ${updated.title}`);
  }

  return updated;
}

export async function deletePodcast(slug: string) {
  const podcast = await getPodcastBySlug(slug);
  if (!podcast) {
    throw new Error(`Podcast ${slug} not found`);
  }

  const filePath = `content/podcasts/${slug}.md`;
  await deleteFile(filePath, `Delete podcast: ${slug}`);
}
