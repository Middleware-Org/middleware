/* **************************************************
 * Imports
 **************************************************/
"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth/server";
import { createArticle, updateArticle, deleteArticle } from "@/lib/github/articles";
import type { Article } from "@/lib/github/types";

/* **************************************************
 * Types
 **************************************************/
export type ActionResult<T = void> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string; errorType?: "error" | "warning" };

/* **************************************************
 * Server Actions
 **************************************************/
export async function createArticleAction(
  _prevState: ActionResult<Article> | null,
  formData: FormData,
): Promise<ActionResult<Article>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized", errorType: "error" };
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
    const audio = formData.get("audio") as string | null;
    const audio_chunks = formData.get("audio_chunks") as string | null;
    const slug = formData.get("slug") as string | null;

    if (!title || !date || !author || !category || !issue || !content) {
      return {
        success: false,
        error: "Title, date, author, category, issue and content are required",
        errorType: "error",
      };
    }

    const articleDate = date.trim();
    const article = await createArticle({
      title: title.trim(),
      date: articleDate,
      last_update: articleDate, // Alla creazione, last_update = date
      author: author.trim(),
      category: category.trim(),
      issue: issue.trim(),
      in_evidence,
      published,
      excerpt: excerpt?.trim() || "",
      content: content.trim(),
      audio: audio?.trim() || undefined,
      audio_chunks: audio_chunks?.trim() || undefined,
      slug: slug?.trim() || undefined,
    });

    revalidatePath("/admin/articles");
    return { success: true, data: article, message: "Article created successfully" };
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
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized", errorType: "error" };
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
    const audio = formData.get("audio") as string | null;
    const audio_chunks = formData.get("audio_chunks") as string | null;

    if (!slug || !title || !date || !author || !category || !issue || !content) {
      return {
        success: false,
        error: "Slug, title, date, author, category, issue and content are required",
        errorType: "error",
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
      audio: audio?.trim() || undefined,
      audio_chunks: audio_chunks?.trim() || undefined,
      newSlug: newSlug?.trim() || undefined,
    });

    revalidatePath("/admin/articles");
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
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized", errorType: "error" };
    }

    if (!slug) {
      return { success: false, error: "Slug is required", errorType: "error" };
    }

    await deleteArticle(slug);
    revalidatePath("/admin/articles");

    return { success: true, message: "Article deleted successfully" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete article",
      errorType: "error",
    };
  }
}
