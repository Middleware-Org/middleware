/**
 * Category Actions
 * Server Actions per la gestione delle categorie con invalidazione cache
 */
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { getUser } from '@/lib/auth/server';
import { createCategory, updateCategory, deleteCategory } from '@/lib/github/categories';
import { CATEGORY_CACHE_TAGS } from '@/lib/services/category.service';
import type { Category } from '@/lib/github/types';

export type ActionResult<T = void> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string; errorType?: 'error' | 'warning' };

export async function createCategoryAction(
  _prevState: ActionResult<Category> | null,
  formData: FormData
): Promise<ActionResult<Category>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: 'Unauthorized', errorType: 'error' };
    }

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const slug = formData.get('slug') as string | null;

    if (!name || !description) {
      return {
        success: false,
        error: 'Name and description are required',
        errorType: 'error',
      };
    }

    const category = await createCategory({
      name: name.trim(),
      description: description.trim(),
      slug: slug?.trim() || undefined,
    });

    revalidateTag(CATEGORY_CACHE_TAGS.all);
    revalidatePath('/admin/categories');
    revalidatePath('/[locale]/categories', 'page');

    return { success: true, data: category, message: 'Category created successfully' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create category',
      errorType: 'error',
    };
  }
}

export async function updateCategoryAction(
  _prevState: ActionResult<Category> | null,
  formData: FormData
): Promise<ActionResult<Category>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: 'Unauthorized', errorType: 'error' };
    }

    const slug = formData.get('slug') as string;
    const newSlug = formData.get('newSlug') as string | null;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    if (!slug || !name || !description) {
      return {
        success: false,
        error: 'Slug, name and description are required',
        errorType: 'error',
      };
    }

    const category = await updateCategory(slug, {
      name: name.trim(),
      description: description.trim(),
      newSlug: newSlug?.trim() || undefined,
    });

    revalidateTag(CATEGORY_CACHE_TAGS.detail(slug));
    if (newSlug) revalidateTag(CATEGORY_CACHE_TAGS.detail(newSlug));
    revalidateTag(CATEGORY_CACHE_TAGS.all);
    revalidatePath('/admin/categories');
    revalidatePath('/[locale]/categories', 'page');

    return { success: true, data: category, message: 'Category updated successfully' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update category',
      errorType: 'error',
    };
  }
}

export async function deleteCategoryAction(slug: string): Promise<ActionResult> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: 'Unauthorized', errorType: 'error' };
    }

    if (!slug) {
      return { success: false, error: 'Slug is required', errorType: 'error' };
    }

    await deleteCategory(slug);

    revalidateTag(CATEGORY_CACHE_TAGS.detail(slug));
    revalidateTag(CATEGORY_CACHE_TAGS.all);
    revalidatePath('/admin/categories');
    revalidatePath('/[locale]/categories', 'page');

    return { success: true, message: 'Category deleted successfully' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete category';
    const isRelationError = errorMessage.includes('used by');

    return {
      success: false,
      error: errorMessage,
      errorType: isRelationError ? 'warning' : 'error',
    };
  }
}

export async function deleteCategoriesAction(
  slugs: string[]
): Promise<ActionResult<{ deleted: number; failed: number }>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: 'Unauthorized', errorType: 'error' };
    }

    if (!slugs || slugs.length === 0) {
      return { success: false, error: 'At least one slug is required', errorType: 'error' };
    }

    let deleted = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const slug of slugs) {
      try {
        await deleteCategory(slug);
        revalidateTag(CATEGORY_CACHE_TAGS.detail(slug));
        deleted++;
      } catch (error) {
        failed++;
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete category';
        errors.push(`${slug}: ${errorMessage}`);
      }
    }

    revalidateTag(CATEGORY_CACHE_TAGS.all);
    revalidatePath('/admin/categories');
    revalidatePath('/[locale]/categories', 'page');

    if (failed > 0) {
      return {
        success: false,
        error: `Eliminate ${deleted} categorie, ${failed} fallite. ${errors.join('; ')}`,
        errorType: 'warning',
      };
    }

    return {
      success: true,
      data: { deleted, failed },
      message: `Eliminate con successo ${deleted} categor${deleted === 1 ? 'ia' : 'ie'}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete categories',
      errorType: 'error',
    };
  }
}
