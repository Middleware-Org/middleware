/* **************************************************
 * Page Actions - Server Actions con cache invalidation
 ************************************************** */
"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { getUser } from "@/lib/auth/server";
import {
  createPage,
  updatePage,
  deletePage,
} from "@/lib/github/pages";
import { PAGE_CACHE_TAGS } from "@/lib/services";
import type { Page, ActionResponse } from "@/lib/github/types";

/**
 * Crea una nuova pagina e invalida la cache
 */
export async function createPageAction(
  _prevState: ActionResponse<Page> | null,
  formData: FormData,
): Promise<ActionResponse<Page>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const slug = formData.get("slug") as string | null;
    const title = formData.get("title") as string;
    const excerpt = formData.get("excerpt") as string | null;
    const content = formData.get("content") as string;

    if (!title || !content) {
      return {
        success: false,
        error: "Title and content are required",
      };
    }

    const page = await createPage({
      slug: slug?.trim() || undefined,
      title: title.trim(),
      excerpt: excerpt?.trim() || "",
      content: content.trim(),
    });

    // Invalida la cache
    revalidateTag(PAGE_CACHE_TAGS.all);
    revalidatePath("/admin/pages");
    revalidatePath(`/${page.slug}`);

    return { success: true, data: page };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create page",
    };
  }
}

/**
 * Aggiorna una pagina esistente e invalida la cache
 */
export async function updatePageAction(
  _prevState: ActionResponse<Page> | null,
  formData: FormData,
): Promise<ActionResponse<Page>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
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
      };
    }

    const page = await updatePage(slug, {
      title: title.trim(),
      excerpt: excerpt?.trim() || "",
      content: content.trim(),
      newSlug: newSlug?.trim() || undefined,
    });

    // Invalida la cache (vecchio slug e nuovo slug se cambiato)
    revalidateTag(PAGE_CACHE_TAGS.all);
    revalidateTag(PAGE_CACHE_TAGS.bySlug(slug));
    if (page.slug !== slug) {
      revalidateTag(PAGE_CACHE_TAGS.bySlug(page.slug));
    }
    revalidatePath("/admin/pages");
    revalidatePath(`/${slug}`);
    if (page.slug !== slug) {
      revalidatePath(`/${page.slug}`);
    }

    return { success: true, data: page };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update page",
    };
  }
}

/**
 * Elimina una pagina e invalida la cache
 */
export async function deletePageAction(slug: string): Promise<ActionResponse> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    if (!slug) {
      return { success: false, error: "Slug is required" };
    }

    await deletePage(slug);

    // Invalida la cache
    revalidateTag(PAGE_CACHE_TAGS.all);
    revalidateTag(PAGE_CACHE_TAGS.bySlug(slug));
    revalidatePath("/admin/pages");
    revalidatePath(`/${slug}`);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete page",
    };
  }
}

/**
 * Elimina multiple pagine (batch delete)
 */
export async function deletePagesAction(
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
        await deletePage(slug);
        deleted++;
      } catch (error) {
        failed++;
        const errorMessage = error instanceof Error ? error.message : "Failed to delete page";
        errors.push(`${slug}: ${errorMessage}`);
      }
    }

    // Invalida la cache globale
    revalidateTag(PAGE_CACHE_TAGS.all);
    revalidatePath("/admin/pages");

    if (failed > 0) {
      return {
        success: false,
        error: `Deleted ${deleted} pages, ${failed} failed. ${errors.join("; ")}`,
      };
    }

    return {
      success: true,
      data: { deleted, failed },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete pages",
    };
  }
}
