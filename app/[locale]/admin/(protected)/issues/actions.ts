/* **************************************************
 * Imports
 **************************************************/
"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth/server";
import { createIssue, updateIssue, deleteIssue, updateIssuesOrder } from "@/lib/github/issues";
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

    const issue = await createIssue({
      title: title.trim(),
      description: description.trim(),
      cover: coverPath,
      color: color.trim(),
      date: date.trim(),
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

export async function reorderIssuesAction(slugs: string[]): Promise<ActionResult> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized", errorType: "error" };
    }

    if (!slugs || slugs.length === 0) {
      return { success: false, error: "Slugs array is required", errorType: "error" };
    }

    await updateIssuesOrder(slugs);
    revalidatePath("/admin/issues");

    return { success: true, message: "Issues reordered successfully" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reorder issues",
      errorType: "error",
    };
  }
}

