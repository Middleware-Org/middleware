/* **************************************************
 * Author Actions - Server Actions con cache invalidation
 ************************************************** */
"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { getUser } from "@/lib/auth/server";
import {
  createAuthor,
  updateAuthor,
  deleteAuthor,
} from "@/lib/github/authors";
import { AUTHOR_CACHE_TAGS, ARTICLE_CACHE_TAGS } from "@/lib/services";
import type { Author, ActionResponse } from "@/lib/github/types";

/**
 * Crea un nuovo autore e invalida la cache
 */
export async function createAuthorAction(
  _prevState: ActionResponse<Author> | null,
  formData: FormData,
): Promise<ActionResponse<Author>> {
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

    const author = await createAuthor({
      name: name.trim(),
      description: description.trim(),
      slug: slug?.trim() || undefined,
    });

    // Invalida la cache
    revalidateTag(AUTHOR_CACHE_TAGS.all);
    revalidatePath("/admin/authors");

    return { success: true, data: author };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create author",
    };
  }
}

/**
 * Aggiorna un autore esistente e invalida la cache
 */
export async function updateAuthorAction(
  _prevState: ActionResponse<Author> | null,
  formData: FormData,
): Promise<ActionResponse<Author>> {
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

    const author = await updateAuthor(slug, {
      name: name.trim(),
      description: description.trim(),
      newSlug: newSlug?.trim() || undefined,
    });

    // Invalida la cache (vecchio slug e nuovo slug se cambiato)
    revalidateTag(AUTHOR_CACHE_TAGS.all);
    revalidateTag(AUTHOR_CACHE_TAGS.bySlug(slug));
    if (author.slug !== slug) {
      revalidateTag(AUTHOR_CACHE_TAGS.bySlug(author.slug));
    }
    // Invalida anche gli articoli di questo autore
    revalidateTag(ARTICLE_CACHE_TAGS.byAuthor(author.slug));
    revalidatePath("/admin/authors");

    return { success: true, data: author };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update author",
    };
  }
}

/**
 * Elimina un autore e invalida la cache
 */
export async function deleteAuthorAction(slug: string): Promise<ActionResponse> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    if (!slug) {
      return { success: false, error: "Slug is required" };
    }

    await deleteAuthor(slug);

    // Invalida la cache
    revalidateTag(AUTHOR_CACHE_TAGS.all);
    revalidateTag(AUTHOR_CACHE_TAGS.bySlug(slug));
    revalidatePath("/admin/authors");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete author",
    };
  }
}

/**
 * Elimina multipli autori (batch delete)
 */
export async function deleteAuthorsAction(
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
        await deleteAuthor(slug);
        deleted++;
      } catch (error) {
        failed++;
        const errorMessage = error instanceof Error ? error.message : "Failed to delete author";
        errors.push(`${slug}: ${errorMessage}`);
      }
    }

    // Invalida la cache globale
    revalidateTag(AUTHOR_CACHE_TAGS.all);
    revalidatePath("/admin/authors");

    if (failed > 0) {
      return {
        success: false,
        error: `Deleted ${deleted} authors, ${failed} failed. ${errors.join("; ")}`,
      };
    }

    return {
      success: true,
      data: { deleted, failed },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete authors",
    };
  }
}
