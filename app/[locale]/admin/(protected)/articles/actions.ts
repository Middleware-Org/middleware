/* **************************************************
 * Imports
 **************************************************/
"use server";

import { getCmsUser } from "@/lib/auth/server";
import { createArticle, updateArticle, deleteArticle } from "@/lib/github/articles";
import type { Article } from "@/lib/github/types";
import type { ActionResult } from "@/lib/actions/types";
import { revalidateAdminPath } from "@/lib/cache/revalidate";

/* **************************************************
 * Server Actions
 **************************************************/
export async function createArticleAction(
  _prevState: ActionResult<Article> | null,
  formData: FormData,
): Promise<ActionResult<Article>> {
  try {
    const user = await getCmsUser();
    if (!user) {
      return { success: false, error: "Unauthorized", errorType: "error" };
    }

    const title = formData.get("title") as string;
    const date = formData.get("date") as string;
    const authorId = formData.get("authorId") as string;
    const categoryId = formData.get("categoryId") as string;
    const issueId = formData.get("issueId") as string | null;
    const in_evidence = formData.get("in_evidence") === "true";
    const published = formData.get("published") === "true";
    const excerpt = formData.get("excerpt") as string;
    const content = formData.get("content") as string;
    const podcastId = formData.get("podcastId") as string | null;
    const slug = formData.get("slug") as string | null;

    if (!title || !date || !authorId || !categoryId || !content) {
      return {
        success: false,
        error: "Title, date, author, category and content are required",
        errorType: "error",
      };
    }

    const articleDate = date.trim();
    const article = await createArticle({
      title: title.trim(),
      date: articleDate,
      last_update: articleDate,
      authorId: authorId.trim(),
      categoryId: categoryId.trim(),
      issueId: issueId?.trim() || undefined,
      in_evidence,
      published,
      excerpt: excerpt?.trim() || "",
      content: content.trim(),
      podcastId: podcastId?.trim() || undefined,
      slug: slug?.trim() || undefined,
      createdBy: user.id,
    });

    revalidateAdminPath("/admin/articles");
    return { success: true, data: article as Article, message: "Article created successfully" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create article",
      errorType: "error",
    };
  }
}

export async function updateArticleAction(
  _prevState: ActionResult<Article> | null,
  formData: FormData,
): Promise<ActionResult<Article>> {
  try {
    const user = await getCmsUser();
    if (!user) {
      return { success: false, error: "Unauthorized", errorType: "error" };
    }

    const slug = formData.get("slug") as string;
    const newSlug = formData.get("newSlug") as string | null;
    const title = formData.get("title") as string;
    const date = formData.get("date") as string;
    const authorId = formData.get("authorId") as string;
    const categoryId = formData.get("categoryId") as string;
    const issueId = formData.get("issueId") as string | null;
    const in_evidence = formData.get("in_evidence") === "true";
    const published = formData.get("published") === "true";
    const excerpt = formData.get("excerpt") as string;
    const content = formData.get("content") as string;
    const podcastId = formData.get("podcastId") as string | null;

    if (!slug || !title || !date || !authorId || !categoryId || !content) {
      return {
        success: false,
        error: "Slug, title, date, author, category and content are required",
        errorType: "error",
      };
    }

    const article = await updateArticle(slug, {
      title: title.trim(),
      date: date.trim(),
      authorId: authorId.trim(),
      categoryId: categoryId.trim(),
      issueId: issueId?.trim() || undefined,
      in_evidence,
      published,
      excerpt: excerpt?.trim() || "",
      content: content.trim(),
      podcastId: podcastId?.trim() || undefined,
      newSlug: newSlug?.trim() || undefined,
    });

    revalidateAdminPath("/admin/articles");
    return { success: true, data: article, message: "Article updated successfully" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update article",
      errorType: "error",
    };
  }
}

export async function deleteArticleAction(slug: string): Promise<ActionResult> {
  try {
    const user = await getCmsUser();
    if (!user) {
      return { success: false, error: "Unauthorized", errorType: "error" };
    }

    if (!slug) {
      return { success: false, error: "Slug is required", errorType: "error" };
    }

    await deleteArticle(slug);
    revalidateAdminPath("/admin/articles");

    return { success: true, message: "Article deleted successfully" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete article",
      errorType: "error",
    };
  }
}

export async function deleteArticlesAction(
  slugs: string[],
): Promise<ActionResult<{ deleted: number; failed: number }>> {
  try {
    const user = await getCmsUser();
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
        await deleteArticle(slug);
        deleted++;
      } catch (error) {
        failed++;
        const errorMessage = error instanceof Error ? error.message : "Failed to delete article";
        errors.push(`${slug}: ${errorMessage}`);
      }
    }

    revalidateAdminPath("/admin/articles");

    if (failed > 0) {
      return {
        success: false,
        error: `Eliminati ${deleted} articoli, ${failed} falliti. ${errors.join("; ")}`,
        errorType: "warning",
      };
    }

    return {
      success: true,
      data: { deleted, failed },
      message: `Eliminati con successo ${deleted} articoli`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete articles",
      errorType: "error",
    };
  }
}
