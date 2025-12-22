/* **************************************************
 * Imports
 **************************************************/
"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth/server";
import { createPodcast, updatePodcast, deletePodcast } from "@/lib/github/podcasts";
import type { Podcast } from "@/lib/github/types";

/* **************************************************
 * Types
 **************************************************/
export type ActionResult<T = void> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string; errorType?: "error" | "warning" };

/* **************************************************
 * Server Actions
 **************************************************/
export async function createPodcastAction(
  _prevState: ActionResult<Podcast> | null,
  formData: FormData,
): Promise<ActionResult<Podcast>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized", errorType: "error" };
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const date = formData.get("date") as string;
    const audio = formData.get("audio") as string | null;
    const audio_chunks = formData.get("audio_chunks") as string | null;
    const published = formData.get("published") === "true";
    const slug = formData.get("slug") as string | null;

    if (!title || !date || !audio || !audio_chunks) {
      return {
        success: false,
        error: "Title, date, audio and audio_chunks are required",
        errorType: "error",
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
      published,
      slug: slug?.trim() || undefined,
    });

    revalidatePath("/admin/podcasts");
    return { success: true, data: podcast, message: "Podcast created successfully" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create podcast",
      errorType: "error",
    };
  }
}

export async function updatePodcastAction(
  _prevState: ActionResult<Podcast> | null,
  formData: FormData,
): Promise<ActionResult<Podcast>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized", errorType: "error" };
    }

    const slug = formData.get("slug") as string;
    const newSlug = formData.get("newSlug") as string | null;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const date = formData.get("date") as string;
    const audio = formData.get("audio") as string | null;
    const audio_chunks = formData.get("audio_chunks") as string | null;
    const published = formData.get("published") === "true";

    if (!slug || !title || !date || !audio || !audio_chunks) {
      return {
        success: false,
        error: "Slug, title, date, audio and audio_chunks are required",
        errorType: "error",
      };
    }

    const podcast = await updatePodcast(slug, {
      title: title.trim(),
      description: description?.trim() || "",
      date: date.trim(),
      audio: audio.trim(),
      audio_chunks: audio_chunks.trim(),
      published,
      newSlug: newSlug?.trim() || undefined,
    });

    revalidatePath("/admin/podcasts");
    return { success: true, data: podcast, message: "Podcast updated successfully" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update podcast",
      errorType: "error",
    };
  }
}

export async function deletePodcastAction(slug: string): Promise<ActionResult> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized", errorType: "error" };
    }

    if (!slug) {
      return { success: false, error: "Slug is required", errorType: "error" };
    }

    await deletePodcast(slug);
    revalidatePath("/admin/podcasts");

    return { success: true, message: "Podcast deleted successfully" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete podcast",
      errorType: "error",
    };
  }
}

export async function deletePodcastsAction(
  slugs: string[],
): Promise<ActionResult<{ deleted: number; failed: number }>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized", errorType: "error" };
    }

    if (!slugs || slugs.length === 0) {
      return { success: false, error: "At least one slug is required", errorType: "error" };
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

    revalidatePath("/admin/podcasts");

    if (failed > 0) {
      return {
        success: false,
        error: `Eliminati ${deleted} podcasts, ${failed} falliti. ${errors.join("; ")}`,
        errorType: "warning",
      };
    }

    return {
      success: true,
      data: { deleted, failed },
      message: `Eliminati con successo ${deleted} podcasts`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete podcasts",
      errorType: "error",
    };
  }
}

