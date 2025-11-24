/* **************************************************
 * Imports
 **************************************************/
"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth/server";
import { createAuthor, updateAuthor, deleteAuthor } from "@/lib/github/authors";
import type { Author } from "@/lib/github/types";

/* **************************************************
 * Types
 **************************************************/
export type ActionResult<T = void> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string; errorType?: "error" | "warning" };

/* **************************************************
 * Server Actions
 **************************************************/
export async function createAuthorAction(
  _prevState: ActionResult<Author> | null,
  formData: FormData,
): Promise<ActionResult<Author>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized", errorType: "error" };
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const slug = formData.get("slug") as string | null;

    if (!name || !description) {
      return {
        success: false,
        error: "Name and description are required",
        errorType: "error",
      };
    }

    const author = await createAuthor({
      name: name.trim(),
      description: description.trim(),
      slug: slug?.trim() || undefined,
    });

    revalidatePath("/admin/authors");
    return { success: true, data: author, message: "Author created successfully" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create author",
      errorType: "error",
    };
  }
}

export async function updateAuthorAction(
  _prevState: ActionResult<Author> | null,
  formData: FormData,
): Promise<ActionResult<Author>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized", errorType: "error" };
    }

    const slug = formData.get("slug") as string;
    const newSlug = formData.get("newSlug") as string | null;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    if (!slug || !name || !description) {
      return {
        success: false,
        error: "Slug, name and description are required",
        errorType: "error",
      };
    }

    const author = await updateAuthor(slug, {
      name: name.trim(),
      description: description.trim(),
      newSlug: newSlug?.trim() || undefined,
    });

    revalidatePath("/admin/authors");
    return { success: true, data: author, message: "Author updated successfully" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update author",
      errorType: "error",
    };
  }
}

export async function deleteAuthorAction(slug: string): Promise<ActionResult> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized", errorType: "error" };
    }

    if (!slug) {
      return { success: false, error: "Slug is required", errorType: "error" };
    }

    await deleteAuthor(slug);
    revalidatePath("/admin/authors");

    return { success: true, message: "Author deleted successfully" };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to delete author";
    const isRelationError = errorMessage.includes("used by");

    return {
      success: false,
      error: errorMessage,
      errorType: isRelationError ? "warning" : "error",
    };
  }
}
