/* **************************************************
 * Issue Actions - Server Actions con cache invalidation
 ************************************************** */
"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { getUser } from "@/lib/auth/server";
import {
  createIssue,
  updateIssue,
  deleteIssue,
} from "@/lib/github/issues";
import { uploadImage } from "@/lib/github/client";
import { ISSUE_CACHE_TAGS, ARTICLE_CACHE_TAGS } from "@/lib/services";
import type { Issue, ActionResponse } from "@/lib/github/types";

/**
 * Crea un nuovo issue e invalida la cache
 */
export async function createIssueAction(
  _prevState: ActionResponse<Issue> | null,
  formData: FormData,
): Promise<ActionResponse<Issue>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const cover = formData.get("cover") as string;
    const color = formData.get("color") as string;
    const date = formData.get("date") as string;
    const published = formData.get("published") === "on";
    const slug = formData.get("slug") as string | null;

    if (!title || !description || !color || !date) {
      return {
        success: false,
        error: "Title, description, color and date are required",
      };
    }

    // Handle image upload if cover is a base64 string (new image)
    let coverPath = cover;
    if (cover && cover.startsWith("data:image")) {
      try {
        coverPath = await uploadImage(cover);
      } catch (error) {
        return {
          success: false,
          error: `Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`,
        };
      }
    }

    const issueDate = date.trim();
    const issue = await createIssue({
      title: title.trim(),
      description: description.trim(),
      cover: coverPath,
      color: color.trim(),
      date: issueDate,
      last_update: issueDate,
      published,
      slug: slug?.trim() || undefined,
    });

    // Invalida la cache
    revalidateTag(ISSUE_CACHE_TAGS.all);
    revalidatePath("/admin/issues");

    return { success: true, data: issue };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create issue",
    };
  }
}

/**
 * Aggiorna un issue esistente e invalida la cache
 */
export async function updateIssueAction(
  _prevState: ActionResponse<Issue> | null,
  formData: FormData,
): Promise<ActionResponse<Issue>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const slug = formData.get("slug") as string;
    const newSlug = formData.get("newSlug") as string | null;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const cover = formData.get("cover") as string;
    const color = formData.get("color") as string;
    const date = formData.get("date") as string;
    const published = formData.get("published") === "on";

    if (!slug || !title || !description || !color || !date) {
      return {
        success: false,
        error: "Slug, title, description, color and date are required",
      };
    }

    // Handle image upload if cover is a base64 string (new image)
    let coverPath = cover;
    if (cover && cover.startsWith("data:image")) {
      try {
        coverPath = await uploadImage(cover);
      } catch (error) {
        return {
          success: false,
          error: `Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`,
        };
      }
    }

    const issue = await updateIssue(slug, {
      title: title.trim(),
      description: description.trim(),
      cover: coverPath,
      color: color.trim(),
      date: date.trim(),
      published,
      newSlug: newSlug?.trim() || undefined,
    });

    // Invalida la cache (vecchio slug e nuovo slug se cambiato)
    revalidateTag(ISSUE_CACHE_TAGS.all);
    revalidateTag(ISSUE_CACHE_TAGS.bySlug(slug));
    if (issue.slug !== slug) {
      revalidateTag(ISSUE_CACHE_TAGS.bySlug(issue.slug));
    }
    // Invalida anche gli articoli di questo issue
    revalidateTag(ARTICLE_CACHE_TAGS.byIssue(issue.slug));
    revalidatePath("/admin/issues");

    return { success: true, data: issue };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update issue",
    };
  }
}

/**
 * Elimina un issue e invalida la cache
 */
export async function deleteIssueAction(slug: string): Promise<ActionResponse> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    if (!slug) {
      return { success: false, error: "Slug is required" };
    }

    await deleteIssue(slug);

    // Invalida la cache
    revalidateTag(ISSUE_CACHE_TAGS.all);
    revalidateTag(ISSUE_CACHE_TAGS.bySlug(slug));
    revalidatePath("/admin/issues");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete issue",
    };
  }
}

/**
 * Elimina multipli issue (batch delete)
 */
export async function deleteIssuesAction(
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
        await deleteIssue(slug);
        deleted++;
      } catch (error) {
        failed++;
        const errorMessage = error instanceof Error ? error.message : "Failed to delete issue";
        errors.push(`${slug}: ${errorMessage}`);
      }
    }

    // Invalida la cache globale
    revalidateTag(ISSUE_CACHE_TAGS.all);
    revalidatePath("/admin/issues");

    if (failed > 0) {
      return {
        success: false,
        error: `Deleted ${deleted} issues, ${failed} failed. ${errors.join("; ")}`,
      };
    }

    return {
      success: true,
      data: { deleted, failed },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete issues",
    };
  }
}

/**
 * Pubblica un issue
 */
export async function publishIssueAction(slug: string): Promise<ActionResponse<Issue>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const issue = await updateIssue(slug, {
      published: true,
    });

    // Invalida la cache
    revalidateTag(ISSUE_CACHE_TAGS.all);
    revalidateTag(ISSUE_CACHE_TAGS.bySlug(slug));
    revalidatePath("/admin/issues");

    return { success: true, data: issue };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to publish issue",
    };
  }
}

/**
 * Unpubblica un issue
 */
export async function unpublishIssueAction(slug: string): Promise<ActionResponse<Issue>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const issue = await updateIssue(slug, {
      published: false,
    });

    // Invalida la cache
    revalidateTag(ISSUE_CACHE_TAGS.all);
    revalidateTag(ISSUE_CACHE_TAGS.bySlug(slug));
    revalidatePath("/admin/issues");

    return { success: true, data: issue };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to unpublish issue",
    };
  }
}
