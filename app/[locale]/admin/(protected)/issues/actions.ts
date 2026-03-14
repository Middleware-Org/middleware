/* **************************************************
 * Imports
 **************************************************/
"use server";

import { getCmsUser } from "@/lib/auth/server";
import { createIssue, updateIssue, deleteIssue, reorderArticlesInIssue } from "@/lib/github/issues";
import { uploadImage } from "@/lib/github/client";
import type { Issue } from "@/lib/github/types";
import type { ActionResult } from "@/lib/actions/types";
import { revalidateAdminPath } from "@/lib/cache/revalidate";

/* **************************************************
 * Types
 **************************************************/
export type { ActionResult };

/* **************************************************
 * Server Actions
 **************************************************/
export async function createIssueAction(
  _prevState: ActionResult<Issue> | null,
  formData: FormData,
): Promise<ActionResult<Issue>> {
  try {
    const user = await getCmsUser();
    if (!user) {
      return { success: false, error: "Unauthorized", errorType: "error" };
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const cover = formData.get("cover") as string; // Base64 image or existing path
    const color = formData.get("color") as string;
    const date = formData.get("date") as string;
    const published = formData.get("published") === "on";
    const showOrder = formData.get("showOrder") === "on";
    const slug = formData.get("slug") as string | null;

    if (!title || !description || !color || !date) {
      return {
        success: false,
        error: "Title, description, color and date are required",
        errorType: "error",
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
          errorType: "error",
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
      showOrder,
      slug: slug?.trim() || undefined,
      createdBy: user.id,
    });

    revalidateAdminPath("/admin/issues");
    return { success: true, data: issue as Issue, message: "Issue created successfully" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create issue",
      errorType: "error",
    };
  }
}

export async function updateIssueAction(
  _prevState: ActionResult<Issue> | null,
  formData: FormData,
): Promise<ActionResult<Issue>> {
  try {
    const user = await getCmsUser();
    if (!user) {
      return { success: false, error: "Unauthorized", errorType: "error" };
    }

    const slug = formData.get("slug") as string;
    const newSlug = formData.get("newSlug") as string | null;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const cover = formData.get("cover") as string; // Base64 image or existing path
    const color = formData.get("color") as string;
    const date = formData.get("date") as string;
    const published = formData.get("published") === "on";
    const showOrder = formData.get("showOrder") === "on";

    if (!slug || !title || !description || !color || !date) {
      return {
        success: false,
        error: "Slug, title, description, color and date are required",
        errorType: "error",
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
          errorType: "error",
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
      showOrder,
      newSlug: newSlug?.trim() || undefined,
    });

    revalidateAdminPath("/admin/issues");
    return { success: true, data: issue, message: "Issue updated successfully" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update issue",
      errorType: "error",
    };
  }
}

export async function deleteIssueAction(slug: string): Promise<ActionResult> {
  try {
    const user = await getCmsUser();
    if (!user) {
      return { success: false, error: "Unauthorized", errorType: "error" };
    }

    if (!slug) {
      return { success: false, error: "Slug is required", errorType: "error" };
    }

    await deleteIssue(slug);
    revalidateAdminPath("/admin/issues");

    return { success: true, message: "Issue deleted successfully" };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to delete issue";
    const isRelationError = errorMessage.includes("used by");

    return {
      success: false,
      error: errorMessage,
      errorType: isRelationError ? "warning" : "error",
    };
  }
}

export async function deleteIssuesAction(
  slugs: string[],
): Promise<ActionResult<{ deleted: number; failed: number }>> {
  try {
    const user = await getCmsUser();
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
        await deleteIssue(slug);
        deleted++;
      } catch (error) {
        failed++;
        const errorMessage = error instanceof Error ? error.message : "Failed to delete issue";
        errors.push(`${slug}: ${errorMessage}`);
      }
    }

    revalidateAdminPath("/admin/issues");

    if (failed > 0) {
      return {
        success: false,
        error: `Eliminate ${deleted} issue, ${failed} fallite. ${errors.join("; ")}`,
        errorType: "warning",
      };
    }

    return {
      success: true,
      data: { deleted, failed },
      message: `Eliminate con successo ${deleted} issue`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete issues",
      errorType: "error",
    };
  }
}

export async function reorderIssueArticlesAction(
  issueSlug: string,
  orderedIds: string[],
): Promise<ActionResult> {
  try {
    const user = await getCmsUser();
    if (!user) {
      return { success: false, error: "Unauthorized", errorType: "error" };
    }

    if (!issueSlug) {
      return { success: false, error: "Issue slug is required", errorType: "error" };
    }

    await reorderArticlesInIssue(issueSlug, orderedIds);
    revalidateAdminPath("/admin/issues");

    return { success: true, message: "Articles reordered successfully" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reorder articles",
      errorType: "error",
    };
  }
}
