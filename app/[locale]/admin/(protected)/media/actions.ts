/* **************************************************
 * Imports
 **************************************************/
"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth/server";
import { deleteMediaFile, uploadMediaFile, getAllMediaFiles } from "@/lib/github/media";

/* **************************************************
 * Types
 **************************************************/
export type ActionResult<T = void> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string; errorType?: "error" | "warning" };

/* **************************************************
 * Server Actions
 **************************************************/
export async function uploadMediaAction(
  _prevState: ActionResult<string> | null,
  formData: FormData,
): Promise<ActionResult<string>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized", errorType: "error" };
    }

    const imageBase64 = formData.get("image") as string;
    const filename = formData.get("filename") as string | null;

    if (!imageBase64) {
      return {
        success: false,
        error: "Image is required",
        errorType: "error",
      };
    }

    const imagePath = await uploadMediaFile(imageBase64, filename?.trim() || undefined);

    revalidatePath("/admin/media");
    return { success: true, data: imagePath, message: "Image uploaded successfully" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload image",
      errorType: "error",
    };
  }
}

export async function deleteMediaAction(filename: string): Promise<ActionResult> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized", errorType: "error" };
    }

    if (!filename) {
      return { success: false, error: "Filename is required", errorType: "error" };
    }

    await deleteMediaFile(filename);
    revalidatePath("/admin/media");

    return { success: true, message: "Image deleted successfully" };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to delete image";
    const isRelationError = errorMessage.includes("used by");

    return {
      success: false,
      error: errorMessage,
      errorType: isRelationError ? "warning" : "error",
    };
  }
}

export async function getAllMediaAction(): Promise<ActionResult> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized", errorType: "error" };
    }

    const mediaFiles = await getAllMediaFiles();
    return { success: true, data: mediaFiles };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch media files",
      errorType: "error",
    };
  }
}

