/* **************************************************
 * Imports
 **************************************************/
"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth/server";
import { deleteMediaFile, uploadMediaFile, getAllMediaFiles, type MediaFile } from "@/lib/github/media";

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

    const fileBase64 = formData.get("file") as string;
    const filename = formData.get("filename") as string | null;
    const fileType = (formData.get("fileType") as "image" | "audio" | "json") || "image";

    if (!fileBase64) {
      return {
        success: false,
        error: "File is required",
        errorType: "error",
      };
    }

    const filePath = await uploadMediaFile(
      fileBase64,
      filename?.trim() || undefined,
      fileType,
    );

    revalidatePath("/admin/media");
    return { success: true, data: filePath, message: "File uploaded successfully" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload file",
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

    return { success: true, message: "File deleted successfully" };
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

export async function getAllMediaAction(): Promise<ActionResult<MediaFile[]>> {
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

