/* **************************************************
 * Article Actions - Server Actions con cache invalidation
 *
 * Gestisce tutte le mutations degli articoli con invalidazione
 * granulare della cache tramite revalidateTag e revalidatePath.
 ************************************************** */
"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { getUser } from "@/lib/auth/server";
import {
  createArticle,
  updateArticle,
  deleteArticle,
} from "@/lib/github/articles";
import { ARTICLE_CACHE_TAGS } from "@/lib/services";
import type { Article, ActionResponse } from "@/lib/github/types";

/**
 * Crea un nuovo articolo e invalida la cache
 */
export async function createArticleAction(
  _prevState: ActionResponse<Article> | null,
  formData: FormData,
): Promise<ActionResponse<Article>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const title = formData.get("title") as string;
    const date = formData.get("date") as string;
    const author = formData.get("author") as string;
    const category = formData.get("category") as string;
    const issue = formData.get("issue") as string;
    const in_evidence = formData.get("in_evidence") === "true";
    const published = formData.get("published") === "true";
    const excerpt = formData.get("excerpt") as string;
    const content = formData.get("content") as string;
    const podcast = formData.get("podcast") as string | null;
    const slug = formData.get("slug") as string | null;

    if (!title || !date || !author || !category || !issue || !content) {
      return {
        success: false,
        error: "Title, date, author, category, issue and content are required",
      };
    }

    const articleDate = date.trim();
    const article = await createArticle({
      title: title.trim(),
      date: articleDate,
      last_update: articleDate,
      author: author.trim(),
      category: category.trim(),
      issue: issue.trim(),
      in_evidence,
      published,
      excerpt: excerpt?.trim() || "",
      content: content.trim(),
      podcast: podcast?.trim() || undefined,
      slug: slug?.trim() || undefined,
    });

    // Invalida la cache
    revalidateTag(ARTICLE_CACHE_TAGS.all);
    revalidateTag(ARTICLE_CACHE_TAGS.byIssue(article.issue));
    revalidateTag(ARTICLE_CACHE_TAGS.byAuthor(article.author));
    revalidateTag(ARTICLE_CACHE_TAGS.byCategory(article.category));
    revalidatePath("/admin/articles");
    revalidatePath(`/articles/${article.slug}`);

    return { success: true, data: article };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create article",
    };
  }
}

/**
 * Aggiorna un articolo esistente e invalida la cache
 */
export async function updateArticleAction(
  _prevState: ActionResponse<Article> | null,
  formData: FormData,
): Promise<ActionResponse<Article>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const slug = formData.get("slug") as string;
    const newSlug = formData.get("newSlug") as string | null;
    const title = formData.get("title") as string;
    const date = formData.get("date") as string;
    const author = formData.get("author") as string;
    const category = formData.get("category") as string;
    const issue = formData.get("issue") as string;
    const in_evidence = formData.get("in_evidence") === "true";
    const published = formData.get("published") === "true";
    const excerpt = formData.get("excerpt") as string;
    const content = formData.get("content") as string;
    const podcast = formData.get("podcast") as string | null;

    if (!slug || !title || !date || !author || !category || !issue || !content) {
      return {
        success: false,
        error: "Slug, title, date, author, category, issue and content are required",
      };
    }

    const article = await updateArticle(slug, {
      title: title.trim(),
      date: date.trim(),
      author: author.trim(),
      category: category.trim(),
      issue: issue.trim(),
      in_evidence,
      published,
      excerpt: excerpt?.trim() || "",
      content: content.trim(),
      podcast: podcast?.trim() || undefined,
      newSlug: newSlug?.trim() || undefined,
    });

    // Invalida la cache (vecchio slug e nuovo slug se cambiato)
    revalidateTag(ARTICLE_CACHE_TAGS.all);
    revalidateTag(ARTICLE_CACHE_TAGS.bySlug(slug));
    if (article.slug !== slug) {
      revalidateTag(ARTICLE_CACHE_TAGS.bySlug(article.slug));
    }
    revalidateTag(ARTICLE_CACHE_TAGS.byIssue(article.issue));
    revalidateTag(ARTICLE_CACHE_TAGS.byAuthor(article.author));
    revalidateTag(ARTICLE_CACHE_TAGS.byCategory(article.category));
    revalidatePath("/admin/articles");
    revalidatePath(`/articles/${slug}`);
    if (article.slug !== slug) {
      revalidatePath(`/articles/${article.slug}`);
    }

    return { success: true, data: article };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update article",
    };
  }
}

/**
 * Elimina un articolo e invalida la cache
 */
export async function deleteArticleAction(slug: string): Promise<ActionResponse> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    if (!slug) {
      return { success: false, error: "Slug is required" };
    }

    await deleteArticle(slug);

    // Invalida la cache
    revalidateTag(ARTICLE_CACHE_TAGS.all);
    revalidateTag(ARTICLE_CACHE_TAGS.bySlug(slug));
    revalidatePath("/admin/articles");
    revalidatePath(`/articles/${slug}`);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete article",
    };
  }
}

/**
 * Elimina multipli articoli (batch delete)
 */
export async function deleteArticlesAction(
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
        await deleteArticle(slug);
        deleted++;
      } catch (error) {
        failed++;
        const errorMessage = error instanceof Error ? error.message : "Failed to delete article";
        errors.push(`${slug}: ${errorMessage}`);
      }
    }

    // Invalida la cache globale
    revalidateTag(ARTICLE_CACHE_TAGS.all);
    revalidatePath("/admin/articles");

    if (failed > 0) {
      return {
        success: false,
        error: `Deleted ${deleted} articles, ${failed} failed. ${errors.join("; ")}`,
      };
    }

    return {
      success: true,
      data: { deleted, failed },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete articles",
    };
  }
}

/**
 * Pubblica un articolo (cambia published da false a true)
 */
export async function publishArticleAction(slug: string): Promise<ActionResponse<Article>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const article = await updateArticle(slug, {
      published: true,
    });

    // Invalida la cache
    revalidateTag(ARTICLE_CACHE_TAGS.all);
    revalidateTag(ARTICLE_CACHE_TAGS.bySlug(slug));
    revalidateTag(ARTICLE_CACHE_TAGS.byIssue(article.issue));
    revalidatePath("/admin/articles");
    revalidatePath(`/articles/${slug}`);

    return { success: true, data: article };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to publish article",
    };
  }
}

/**
 * Unpubblica un articolo (cambia published da true a false)
 */
export async function unpublishArticleAction(slug: string): Promise<ActionResponse<Article>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const article = await updateArticle(slug, {
      published: false,
    });

    // Invalida la cache
    revalidateTag(ARTICLE_CACHE_TAGS.all);
    revalidateTag(ARTICLE_CACHE_TAGS.bySlug(slug));
    revalidateTag(ARTICLE_CACHE_TAGS.byIssue(article.issue));
    revalidatePath("/admin/articles");
    revalidatePath(`/articles/${slug}`);

    return { success: true, data: article };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to unpublish article",
    };
  }
}
