/* **************************************************
 * Podcast Actions - Server Actions con cache invalidation
 ************************************************** */
"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { getUser } from "@/lib/auth/server";
import {
  createPodcast,
  updatePodcast,
  deletePodcast,
} from "@/lib/github/podcasts";
import { PODCAST_CACHE_TAGS } from "@/lib/services";
import type { Podcast, ActionResponse } from "@/lib/github/types";

/**
 * Crea un nuovo podcast e invalida la cache
 */
export async function createPodcastAction(
  _prevState: ActionResponse<Podcast> | null,
  formData: FormData,
): Promise<ActionResponse<Podcast>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const date = formData.get("date") as string;
    const audio = formData.get("audio") as string | null;
    const audio_chunks = formData.get("audio_chunks") as string | null;
    const cover = formData.get("cover") as string | null;
    const published = formData.get("published") === "true";
    const slug = formData.get("slug") as string | null;

    if (!title || !date || !audio || !audio_chunks) {
      return {
        success: false,
        error: "Title, date, audio and audio_chunks are required",
      };
    }

    const podcastDate = date.trim();
    const podcast = await createPodcast({
      title: title.trim(),
      description: description?.trim() || "",
      date: podcastDate,
      last_update: podcastDate,
      audio: audio.trim(),
      audio_chunks: audio_chunks.trim(),
      cover: cover?.trim() || undefined,
      published,
      slug: slug?.trim() || undefined,
    });

    // Invalida la cache
    revalidateTag(PODCAST_CACHE_TAGS.all);
    revalidatePath("/admin/podcasts");
    revalidatePath(`/podcast/${podcast.slug}`);

    return { success: true, data: podcast };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create podcast",
    };
  }
}

/**
 * Aggiorna un podcast esistente e invalida la cache
 */
export async function updatePodcastAction(
  _prevState: ActionResponse<Podcast> | null,
  formData: FormData,
): Promise<ActionResponse<Podcast>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const slug = formData.get("slug") as string;
    const newSlug = formData.get("newSlug") as string | null;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const date = formData.get("date") as string;
    const audio = formData.get("audio") as string | null;
    const audio_chunks = formData.get("audio_chunks") as string | null;
    const cover = formData.get("cover") as string | null;
    const published = formData.get("published") === "true";

    if (!slug || !title || !date || !audio || !audio_chunks) {
      return {
        success: false,
        error: "Slug, title, date, audio and audio_chunks are required",
      };
    }

    const podcast = await updatePodcast(slug, {
      title: title.trim(),
      description: description?.trim() || "",
      date: date.trim(),
      audio: audio.trim(),
      audio_chunks: audio_chunks.trim(),
      cover: cover?.trim() || undefined,
      published,
      newSlug: newSlug?.trim() || undefined,
    });

    // Invalida la cache (vecchio slug e nuovo slug se cambiato)
    revalidateTag(PODCAST_CACHE_TAGS.all);
    revalidateTag(PODCAST_CACHE_TAGS.bySlug(slug));
    if (podcast.slug !== slug) {
      revalidateTag(PODCAST_CACHE_TAGS.bySlug(podcast.slug));
    }
    revalidatePath("/admin/podcasts");
    revalidatePath(`/podcast/${slug}`);
    if (podcast.slug !== slug) {
      revalidatePath(`/podcast/${podcast.slug}`);
    }

    return { success: true, data: podcast };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update podcast",
    };
  }
}

/**
 * Elimina un podcast e invalida la cache
 */
export async function deletePodcastAction(slug: string): Promise<ActionResponse> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    if (!slug) {
      return { success: false, error: "Slug is required" };
    }

    await deletePodcast(slug);

    // Invalida la cache
    revalidateTag(PODCAST_CACHE_TAGS.all);
    revalidateTag(PODCAST_CACHE_TAGS.bySlug(slug));
    revalidatePath("/admin/podcasts");
    revalidatePath(`/podcast/${slug}`);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete podcast",
    };
  }
}

/**
 * Elimina multipli podcast (batch delete)
 */
export async function deletePodcastsAction(
  slugs: string[],
): Promise<ActionResponse<{ deleted: number; failed: number }>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    if (!slugs || slugs.length === 0) {
      return { success: false, error: "At least one slug is required" };
    }

    let deleted = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const slug of slugs) {
      try {
        await deletePodcast(slug);
        deleted++;
      } catch (error) {
        failed++;
        const errorMessage = error instanceof Error ? error.message : "Failed to delete podcast";
        errors.push(`${slug}: ${errorMessage}`);
      }
    }

    // Invalida la cache globale
    revalidateTag(PODCAST_CACHE_TAGS.all);
    revalidatePath("/admin/podcasts");

    if (failed > 0) {
      return {
        success: false,
        error: `Deleted ${deleted} podcasts, ${failed} failed. ${errors.join("; ")}`,
      };
    }

    return {
      success: true,
      data: { deleted, failed },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete podcasts",
    };
  }
}

/**
 * Pubblica un podcast
 */
export async function publishPodcastAction(slug: string): Promise<ActionResponse<Podcast>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const podcast = await updatePodcast(slug, {
      published: true,
    });

    // Invalida la cache
    revalidateTag(PODCAST_CACHE_TAGS.all);
    revalidateTag(PODCAST_CACHE_TAGS.bySlug(slug));
    revalidatePath("/admin/podcasts");
    revalidatePath(`/podcast/${slug}`);

    return { success: true, data: podcast };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to publish podcast",
    };
  }
}

/**
 * Unpubblica un podcast
 */
export async function unpublishPodcastAction(slug: string): Promise<ActionResponse<Podcast>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const podcast = await updatePodcast(slug, {
      published: false,
    });

    // Invalida la cache
    revalidateTag(PODCAST_CACHE_TAGS.all);
    revalidateTag(PODCAST_CACHE_TAGS.bySlug(slug));
    revalidatePath("/admin/podcasts");
    revalidatePath(`/podcast/${slug}`);

    return { success: true, data: podcast };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to unpublish podcast",
    };
  }
}
