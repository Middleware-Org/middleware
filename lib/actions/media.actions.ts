/**
 * Media Actions
 * Server Actions per la gestione dei media con invalidazione cache
 */
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { getUser } from '@/lib/auth/server';
import {
  deleteMediaFile,
  uploadMediaFile,
  renameMediaFile,
  getAllMediaFiles,
  type MediaFile,
} from '@/lib/github/media';
import { MEDIA_CACHE_TAGS } from '@/lib/services/media.service';

export type ActionResult<T = void> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string; errorType?: 'error' | 'warning' };

export async function uploadMediaAction(
  _prevState: ActionResult<string> | null,
  formData: FormData
): Promise<ActionResult<string>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: 'Unauthorized', errorType: 'error' };
    }

    const fileInput = formData.get('file');
    const filename = formData.get('filename') as string | null;
    const fileType = (formData.get('fileType') as 'image' | 'audio' | 'json') || 'image';

    if (!fileInput) {
      return {
        success: false,
        error: 'File is required',
        errorType: 'error',
      };
    }

    let fileBase64: string;
    if (fileInput instanceof File) {
      const arrayBuffer = await fileInput.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const mimeType = fileInput.type || 'image/jpeg';
      fileBase64 = `data:${mimeType};base64,${buffer.toString('base64')}`;
    } else {
      fileBase64 = fileInput as string;
    }

    const filePath = await uploadMediaFile(fileBase64, filename?.trim() || undefined, fileType);

    revalidateTag(MEDIA_CACHE_TAGS.all);
    revalidatePath('/admin/media');

    return { success: true, data: filePath, message: 'File uploaded successfully' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload file',
      errorType: 'error',
    };
  }
}

export async function deleteMediaAction(filename: string): Promise<ActionResult> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: 'Unauthorized', errorType: 'error' };
    }

    if (!filename) {
      return { success: false, error: 'Filename is required', errorType: 'error' };
    }

    await deleteMediaFile(filename);

    revalidateTag(MEDIA_CACHE_TAGS.all);
    revalidatePath('/admin/media');

    return { success: true, message: 'File deleted successfully' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete image';
    const isRelationError = errorMessage.includes('used by');

    return {
      success: false,
      error: errorMessage,
      errorType: isRelationError ? 'warning' : 'error',
    };
  }
}

export async function deleteMediaFilesAction(
  filenames: string[]
): Promise<ActionResult<{ deleted: number; failed: number }>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: 'Unauthorized', errorType: 'error' };
    }

    if (!filenames || filenames.length === 0) {
      return { success: false, error: 'At least one filename is required', errorType: 'error' };
    }

    let deleted = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const filename of filenames) {
      try {
        await deleteMediaFile(filename);
        deleted++;
      } catch (error) {
        failed++;
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete file';
        errors.push(`${filename}: ${errorMessage}`);
      }
    }

    revalidateTag(MEDIA_CACHE_TAGS.all);
    revalidatePath('/admin/media');

    if (failed > 0) {
      return {
        success: false,
        error: `Eliminati ${deleted} file, ${failed} falliti. ${errors.join('; ')}`,
        errorType: 'warning',
      };
    }

    return {
      success: true,
      data: { deleted, failed },
      message: `Eliminati con successo ${deleted} file`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete files',
      errorType: 'error',
    };
  }
}

export async function renameMediaAction(
  oldFilename: string,
  newFilename: string
): Promise<ActionResult<string>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: 'Unauthorized', errorType: 'error' };
    }

    if (!oldFilename || !newFilename) {
      return { success: false, error: 'Filename is required', errorType: 'error' };
    }

    const newUrl = await renameMediaFile(oldFilename, newFilename);

    revalidateTag(MEDIA_CACHE_TAGS.all);
    revalidatePath('/admin/media');

    return { success: true, data: newUrl, message: 'File renamed successfully' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to rename file';
    const isConflictError = errorMessage.includes('already exists');

    return {
      success: false,
      error: errorMessage,
      errorType: isConflictError ? 'warning' : 'error',
    };
  }
}

export async function getAllMediaAction(): Promise<ActionResult<MediaFile[]>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: 'Unauthorized', errorType: 'error' };
    }

    const mediaFiles = await getAllMediaFiles();
    return { success: true, data: mediaFiles };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch media files',
      errorType: 'error',
    };
  }
}
