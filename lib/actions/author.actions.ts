/**
 * Author Actions
 * Server Actions per la gestione degli autori con invalidazione cache
 */
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { getUser } from '@/lib/auth/server';
import { createAuthor, updateAuthor, deleteAuthor } from '@/lib/github/authors';
import { AUTHOR_CACHE_TAGS } from '@/lib/services/author.service';
import type { Author } from '@/lib/github/types';

export type ActionResult<T = void> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string; errorType?: 'error' | 'warning' };

export async function createAuthorAction(
  _prevState: ActionResult<Author> | null,
  formData: FormData
): Promise<ActionResult<Author>> {
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

    const author = await createAuthor({
      name: name.trim(),
      description: description.trim(),
      slug: slug?.trim() || undefined,
    });

    revalidateTag(AUTHOR_CACHE_TAGS.all);
    revalidatePath('/admin/authors');
    revalidatePath('/[locale]/authors', 'page');

    return { success: true, data: author, message: 'Author created successfully' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create author',
      errorType: 'error',
    };
  }
}

export async function updateAuthorAction(
  _prevState: ActionResult<Author> | null,
  formData: FormData
): Promise<ActionResult<Author>> {
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

    const author = await updateAuthor(slug, {
      name: name.trim(),
      description: description.trim(),
      newSlug: newSlug?.trim() || undefined,
    });

    revalidateTag(AUTHOR_CACHE_TAGS.detail(slug));
    if (newSlug) revalidateTag(AUTHOR_CACHE_TAGS.detail(newSlug));
    revalidateTag(AUTHOR_CACHE_TAGS.all);
    revalidatePath('/admin/authors');
    revalidatePath('/[locale]/authors', 'page');

    return { success: true, data: author, message: 'Author updated successfully' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update author',
      errorType: 'error',
    };
  }
}

export async function deleteAuthorAction(slug: string): Promise<ActionResult> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: 'Unauthorized', errorType: 'error' };
    }

    if (!slug) {
      return { success: false, error: 'Slug is required', errorType: 'error' };
    }

    await deleteAuthor(slug);

    revalidateTag(AUTHOR_CACHE_TAGS.detail(slug));
    revalidateTag(AUTHOR_CACHE_TAGS.all);
    revalidatePath('/admin/authors');
    revalidatePath('/[locale]/authors', 'page');

    return { success: true, message: 'Author deleted successfully' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete author';
    const isRelationError = errorMessage.includes('used by');

    return {
      success: false,
      error: errorMessage,
      errorType: isRelationError ? 'warning' : 'error',
    };
  }
}

export async function deleteAuthorsAction(
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
        await deleteAuthor(slug);
        revalidateTag(AUTHOR_CACHE_TAGS.detail(slug));
        deleted++;
      } catch (error) {
        failed++;
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete author';
        errors.push(`${slug}: ${errorMessage}`);
      }
    }

    revalidateTag(AUTHOR_CACHE_TAGS.all);
    revalidatePath('/admin/authors');
    revalidatePath('/[locale]/authors', 'page');

    if (failed > 0) {
      return {
        success: false,
        error: `Eliminati ${deleted} autori, ${failed} falliti. ${errors.join('; ')}`,
        errorType: 'warning',
      };
    }

    return {
      success: true,
      data: { deleted, failed },
      message: `Eliminati con successo ${deleted} autor${deleted === 1 ? 'e' : 'i'}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete authors',
      errorType: 'error',
    };
  }
}
