/* **************************************************
 * Imports
 **************************************************/
"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth/server";
import { createPage, updatePage, deletePage } from "@/lib/github/pages";
import type { Page } from "@/lib/github/types";

/* **************************************************
 * Types
 **************************************************/
export type ActionResult<T = void> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string; errorType?: "error" | "warning" };

/* **************************************************
 * Server Actions
 **************************************************/
export async function createPageAction(
  _prevState: ActionResult<Page> | null,
  formData: FormData,
): Promise<ActionResult<Page>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized", errorType: "error" };
    }

    const slug = formData.get("slug") as string | null;
    const title = formData.get("title") as string;
    const excerpt = formData.get("excerpt") as string | null;
    const content = formData.get("content") as string;

    if (!title || !content) {
      return {
        success: false,
        error: "Title and content are required",
        errorType: "error",
      };
    }

    const page = await createPage({
      slug: slug?.trim() || undefined,
      title: title.trim(),
      excerpt: excerpt?.trim() || "",
      content: content.trim(),
    });

    revalidatePath("/admin/pages");
    return { success: true, data: page, message: "Page created successfully" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create page",
      errorType: "error",
    };
  }
}

export async function updatePageAction(
  _prevState: ActionResult<Page> | null,
  formData: FormData,
): Promise<ActionResult<Page>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized", errorType: "error" };
    }

    const slug = formData.get("slug") as string;
    const newSlug = formData.get("newSlug") as string | null;
    const title = formData.get("title") as string;
    const excerpt = formData.get("excerpt") as string | null;
    const content = formData.get("content") as string;

    if (!slug || !title || !content) {
      return {
        success: false,
        error: "Slug, title and content are required",
        errorType: "error",
      };
    }

    const page = await updatePage(slug, {
      title: title.trim(),
      excerpt: excerpt?.trim() || "",
      content: content.trim(),
      newSlug: newSlug?.trim() || undefined,
    });

    revalidatePath("/admin/pages");
    return { success: true, data: page, message: "Page updated successfully" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update page",
      errorType: "error",
    };
  }
}

export async function deletePageAction(slug: string): Promise<ActionResult> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized", errorType: "error" };
    }

    if (!slug) {
      return { success: false, error: "Slug is required", errorType: "error" };
    }

    await deletePage(slug);
    revalidatePath("/admin/pages");

    return { success: true, message: "Page deleted successfully" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete page",
      errorType: "error",
    };
  }
}
