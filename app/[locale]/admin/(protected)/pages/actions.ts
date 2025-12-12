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

export async function deletePagesAction(
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
        await deletePage(slug);
        deleted++;
      } catch (error) {
        failed++;
        const errorMessage = error instanceof Error ? error.message : "Failed to delete page";
        errors.push(`${slug}: ${errorMessage}`);
      }
    }

    revalidatePath("/admin/pages");

    if (failed > 0) {
      return {
        success: false,
        error: `Eliminate ${deleted} pagine, ${failed} fallite. ${errors.join("; ")}`,
        errorType: "warning",
      };
    }

    return {
      success: true,
      data: { deleted, failed },
      message: `Eliminate con successo ${deleted} pagin${deleted === 1 ? "a" : "e"}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete pages",
      errorType: "error",
    };
  }
}
