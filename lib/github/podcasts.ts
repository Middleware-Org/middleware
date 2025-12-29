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
import { generateSlug, generateUniqueSlug } from "./utils";
import type { Podcast } from "./types";

/* **************************************************
 * Podcasts
 ************************************************** */
export async function getAllPodcasts(): Promise<Podcast[]> {
  const files = await listDirectoryFiles("content/podcasts");
  const jsonFiles = files.filter((f) => f.type === "file" && f.name.endsWith(".json"));

  const podcasts = await Promise.all(
    jsonFiles.map(async (file) => {
      try {
        const content = await getFileContent(file.path);

        if (!content || content.trim().length === 0) {
          return null;
        }

        const podcast = JSON.parse(content) as Podcast;
        const podcastDate = podcast.date as string;
        const lastUpdate = (podcast.last_update as string) || podcastDate;

        return {
          slug: podcast.slug || file.name.replace(".json", ""),
          title: podcast.title,
          description: podcast.description || "",
          date: podcastDate,
          last_update: lastUpdate,
          audio: podcast.audio || "",
          audio_chunks: podcast.audio_chunks || "",
          cover: podcast.cover,
          issue: podcast.issue,
          published: podcast.published ?? false,
        } as Podcast;
      } catch {
        return null;
      }
    }),
  );

  const validPodcasts = podcasts.filter((podcast): podcast is Podcast => podcast !== null);

  return validPodcasts.sort((a, b) => b.last_update.localeCompare(a.last_update));
}

export async function getPodcastBySlug(slug: string): Promise<Podcast | undefined> {
  try {
    const files = await listDirectoryFiles("content/podcasts");
    const jsonFiles = files.filter((f) => f.type === "file" && f.name.endsWith(".json"));

    let file = jsonFiles.find((f) => f.name === `${slug}.json`);

    if (!file) {
      for (const f of jsonFiles) {
        try {
          const content = await getFileContent(f.path);
          if (!content || content.trim().length === 0) continue;

          const podcast = JSON.parse(content) as Podcast;
          if (podcast.slug === slug || f.name.replace(".json", "") === slug) {
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
      const podcast = JSON.parse(content) as Podcast;
      const podcastDate = (podcast.date as string) || new Date().toISOString().split("T")[0];
      const lastUpdate = (podcast.last_update as string) || podcastDate;

      return {
        slug: (podcast.slug as string) || slug,
        title: (podcast.title as string) || "Untitled",
        description: (podcast.description as string) || "",
        date: podcastDate,
        last_update: lastUpdate,
        audio: (podcast.audio as string) || "",
        audio_chunks: (podcast.audio_chunks as string) || "",
        cover: podcast.cover,
        issue: podcast.issue,
        published: (podcast.published as boolean) ?? false,
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
  const slug = await generateUniqueSlug("content/podcasts", baseSlug, ".json");

  const podcastDate = podcast.date || new Date().toISOString().split("T")[0];
  const lastUpdate = podcast.last_update || podcastDate;

  const podcastData = {
    slug,
    title: podcast.title,
    description: podcast.description || "",
    date: podcastDate,
    last_update: lastUpdate,
    audio: podcast.audio || "",
    audio_chunks: podcast.audio_chunks || "",
    cover: podcast.cover,
    issue: podcast.issue,
    published: podcast.published ?? false,
  };

  const filePath = `content/podcasts/${slug}.json`;
  const content = JSON.stringify(podcastData, null, 2);

  await createOrUpdateFile(filePath, content, `Create podcast: ${podcast.title}`);

  return { ...podcastData, slug };
}

export async function updatePodcast(
  slug: string,
  podcast: Partial<Omit<Podcast, "slug">> & { newSlug?: string },
) {
  // Trova il file reale usando lo stesso metodo di getPodcastBySlug
  const files = await listDirectoryFiles("content/podcasts");
  const jsonFiles = files.filter((f) => f.type === "file" && f.name.endsWith(".json"));

  // Prima cerca per nome file esatto
  let file = jsonFiles.find((f) => f.name === `${slug}.json`);

  // Se non trovato, cerca per slug nel JSON
  if (!file) {
    for (const f of jsonFiles) {
      try {
        const content = await getFileContent(f.path);
        if (!content || content.trim().length === 0) continue;

        const podcastData = JSON.parse(content) as Podcast;
        if (podcastData.slug === slug || f.name.replace(".json", "") === slug) {
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

  const fileSlug = file.name.replace(".json", "");
  const existing = await getPodcastBySlug(slug);

  if (!existing) {
    throw new Error(`Podcast ${slug} not found`);
  }

  // Gestisci cambio slug se necessario
  let finalSlug = fileSlug;
  if (podcast.newSlug && podcast.newSlug.trim() !== fileSlug) {
    const baseSlug = podcast.newSlug.trim();
    finalSlug = await generateUniqueSlug("content/podcasts", baseSlug, ".json", fileSlug);
  }

  // All'aggiornamento, last_update diventa la data e ora corrente
  const currentDateTime = new Date().toISOString();

  const updated: Podcast = {
    slug: finalSlug,
    title: podcast.title ?? existing.title,
    description: podcast.description ?? existing.description,
    date: podcast.date ?? existing.date,
    last_update: currentDateTime,
    audio: podcast.audio !== undefined ? podcast.audio : existing.audio,
    audio_chunks: podcast.audio_chunks !== undefined ? podcast.audio_chunks : existing.audio_chunks,
    cover: podcast.cover !== undefined ? podcast.cover : existing.cover,
    issue: podcast.issue !== undefined ? podcast.issue : existing.issue,
    published: podcast.published !== undefined ? podcast.published : existing.published,
  };

  const content = JSON.stringify(updated, null, 2);
  const newFilePath = `content/podcasts/${finalSlug}.json`;
  const oldFilePath = `content/podcasts/${fileSlug}.json`;

  // Se lo slug è cambiato, rinomina il file, altrimenti aggiorna normalmente
  if (finalSlug !== fileSlug) {
    await renameFile(
      oldFilePath,
      newFilePath,
      content,
      `Rename podcast: ${updated.title} (${fileSlug} -> ${finalSlug})`,
    );
  } else {
    await createOrUpdateFile(newFilePath, content, `Update podcast: ${updated.title}`);
  }

  return updated;
}

export async function deletePodcast(slug: string) {
  const podcast = await getPodcastBySlug(slug);
  if (!podcast) {
    throw new Error(`Podcast ${slug} not found`);
  }

  const filePath = `content/podcasts/${slug}.json`;
  await deleteFile(filePath, `Delete podcast: ${slug}`);
}
