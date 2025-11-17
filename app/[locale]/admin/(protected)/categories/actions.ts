/* **************************************************
 * Imports
 **************************************************/
"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth/server";
import { createCategory, updateCategory, deleteCategory, updateCategoriesOrder } from "@/lib/github/categories";
import type { Category } from "@/lib/github/types";

/* **************************************************
 * Types
 **************************************************/
export type ActionResult<T = void> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string; errorType?: "error" | "warning" };

/* **************************************************
 * Server Actions
 **************************************************/
export async function createCategoryAction(
  _prevState: ActionResult<Category> | null,
  formData: FormData,
): Promise<ActionResult<Category>> {
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

    const category = await createCategory({
      name: name.trim(),
      description: description.trim(),
      slug: slug?.trim() || undefined,
    });

    revalidatePath("/admin/categories");
    return { success: true, data: category, message: "Category created successfully" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create category",
      errorType: "error",
    };
  }
}

export async function updateCategoryAction(
  _prevState: ActionResult<Category> | null,
  formData: FormData,
): Promise<ActionResult<Category>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized", errorType: "error" };
    }

    const slug = formData.get("slug") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    if (!slug || !name || !description) {
      return {
        success: false,
        error: "Slug, name and description are required",
        errorType: "error",
      };
    }

    const category = await updateCategory(slug, {
      name: name.trim(),
      description: description.trim(),
    });

    revalidatePath("/admin/categories");
    return { success: true, data: category, message: "Category updated successfully" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update category",
      errorType: "error",
    };
  }
}

export async function deleteCategoryAction(slug: string): Promise<ActionResult> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized", errorType: "error" };
    }

    if (!slug) {
      return { success: false, error: "Slug is required", errorType: "error" };
    }

    await deleteCategory(slug);
    revalidatePath("/admin/categories");

    return { success: true, message: "Category deleted successfully" };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to delete category";
    const isRelationError = errorMessage.includes("used by");

    return {
      success: false,
      error: errorMessage,
      errorType: isRelationError ? "warning" : "error",
    };
  }
}

export async function reorderCategoriesAction(slugs: string[]): Promise<ActionResult> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized", errorType: "error" };
    }

    if (!slugs || slugs.length === 0) {
      return { success: false, error: "Slugs array is required", errorType: "error" };
    }

    await updateCategoriesOrder(slugs);
    revalidatePath("/admin/categories");

    return { success: true, message: "Categories reordered successfully" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reorder categories",
      errorType: "error",
    };
  }
}
