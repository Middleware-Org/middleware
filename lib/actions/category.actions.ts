/* **************************************************
 * Category Actions - Server Actions con cache invalidation
 ************************************************** */
"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { getUser } from "@/lib/auth/server";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/github/categories";
import { CATEGORY_CACHE_TAGS, ARTICLE_CACHE_TAGS } from "@/lib/services";
import type { Category, ActionResponse } from "@/lib/github/types";

/**
 * Crea una nuova categoria e invalida la cache
 */
export async function createCategoryAction(
  _prevState: ActionResponse<Category> | null,
  formData: FormData,
): Promise<ActionResponse<Category>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const slug = formData.get("slug") as string | null;

    if (!name || !description) {
      return {
        success: false,
        error: "Name and description are required",
      };
    }

    const category = await createCategory({
      name: name.trim(),
      description: description.trim(),
      slug: slug?.trim() || undefined,
    });

    // Invalida la cache
    revalidateTag(CATEGORY_CACHE_TAGS.all);
    revalidatePath("/admin/categories");

    return { success: true, data: category };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create category",
    };
  }
}

/**
 * Aggiorna una categoria esistente e invalida la cache
 */
export async function updateCategoryAction(
  _prevState: ActionResponse<Category> | null,
  formData: FormData,
): Promise<ActionResponse<Category>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const slug = formData.get("slug") as string;
    const newSlug = formData.get("newSlug") as string | null;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    if (!slug || !name || !description) {
      return {
        success: false,
        error: "Slug, name and description are required",
      };
    }

    const category = await updateCategory(slug, {
      name: name.trim(),
      description: description.trim(),
      newSlug: newSlug?.trim() || undefined,
    });

    // Invalida la cache (vecchio slug e nuovo slug se cambiato)
    revalidateTag(CATEGORY_CACHE_TAGS.all);
    revalidateTag(CATEGORY_CACHE_TAGS.bySlug(slug));
    if (category.slug !== slug) {
      revalidateTag(CATEGORY_CACHE_TAGS.bySlug(category.slug));
    }
    // Invalida anche gli articoli di questa categoria
    revalidateTag(ARTICLE_CACHE_TAGS.byCategory(category.slug));
    revalidatePath("/admin/categories");

    return { success: true, data: category };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update category",
    };
  }
}

/**
 * Elimina una categoria e invalida la cache
 */
export async function deleteCategoryAction(slug: string): Promise<ActionResponse> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    if (!slug) {
      return { success: false, error: "Slug is required" };
    }

    await deleteCategory(slug);

    // Invalida la cache
    revalidateTag(CATEGORY_CACHE_TAGS.all);
    revalidateTag(CATEGORY_CACHE_TAGS.bySlug(slug));
    revalidatePath("/admin/categories");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete category",
    };
  }
}

/**
 * Elimina multiple categorie (batch delete)
 */
export async function deleteCategoriesAction(
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
        await deleteCategory(slug);
        deleted++;
      } catch (error) {
        failed++;
        const errorMessage = error instanceof Error ? error.message : "Failed to delete category";
        errors.push(`${slug}: ${errorMessage}`);
      }
    }

    // Invalida la cache globale
    revalidateTag(CATEGORY_CACHE_TAGS.all);
    revalidatePath("/admin/categories");

    if (failed > 0) {
      return {
        success: false,
        error: `Deleted ${deleted} categories, ${failed} failed. ${errors.join("; ")}`,
      };
    }

    return {
      success: true,
      data: { deleted, failed },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete categories",
    };
  }
}
