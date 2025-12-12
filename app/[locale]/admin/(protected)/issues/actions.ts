/* **************************************************
 * Imports
 **************************************************/
"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth/server";
import { createIssue, updateIssue, deleteIssue } from "@/lib/github/issues";
import { uploadImage } from "@/lib/github/client";
import type { Issue } from "@/lib/github/types";

/* **************************************************
 * Types
 **************************************************/
export type ActionResult<T = void> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string; errorType?: "error" | "warning" };

/* **************************************************
 * Server Actions
 **************************************************/
export async function createIssueAction(
  _prevState: ActionResult<Issue> | null,
  formData: FormData,
): Promise<ActionResult<Issue>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized", errorType: "error" };
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const cover = formData.get("cover") as string; // Base64 image or existing path
    const color = formData.get("color") as string;
    const date = formData.get("date") as string;
    const published = formData.get("published") === "on";
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
      last_update: issueDate, // Alla creazione, last_update = date
      published,
      slug: slug?.trim() || undefined,
    });

    revalidatePath("/admin/issues");
    return { success: true, data: issue, message: "Issue created successfully" };
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
    const user = await getUser();
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
      newSlug: newSlug?.trim() || undefined,
    });

    revalidatePath("/admin/issues");
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
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized", errorType: "error" };
    }

    if (!slug) {
      return { success: false, error: "Slug is required", errorType: "error" };
    }

    await deleteIssue(slug);
    revalidatePath("/admin/issues");

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
        await deleteIssue(slug);
        deleted++;
      } catch (error) {
        failed++;
        const errorMessage = error instanceof Error ? error.message : "Failed to delete issue";
        errors.push(`${slug}: ${errorMessage}`);
      }
    }

    revalidatePath("/admin/issues");

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
