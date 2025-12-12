/* **************************************************
 * Imports
 **************************************************/
"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth/server";
import { createUser, updateUser, deleteUser } from "@/lib/github/users";
import type { User } from "@/lib/github/users";

/* **************************************************
 * Types
 **************************************************/
export type ActionResult<T = void> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string; errorType?: "error" | "warning" };

/* **************************************************
 * Server Actions
 **************************************************/
export async function createUserAction(
  _prevState: ActionResult<User> | null,
  formData: FormData,
): Promise<ActionResult<User>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized", errorType: "error" };
    }

    const email = formData.get("email") as string;
    const name = formData.get("name") as string | null;
    const password = formData.get("password") as string;

    if (!email) {
      return {
        success: false,
        error: "Email is required",
        errorType: "error",
      };
    }

    if (!password || password.length < 8) {
      return {
        success: false,
        error: "Password is required and must be at least 8 characters long",
        errorType: "error",
      };
    }

    const userData = await createUser({
      email: email.trim(),
      name: name?.trim() || null,
      password,
    });

    revalidatePath("/admin/users");
    return { success: true, data: userData, message: "User created successfully" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create user",
      errorType: "error",
    };
  }
}

export async function updateUserAction(
  _prevState: ActionResult<User> | null,
  formData: FormData,
): Promise<ActionResult<User>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized", errorType: "error" };
    }

    const id = formData.get("id") as string;
    const email = formData.get("email") as string;
    const name = formData.get("name") as string | null;
    const password = formData.get("password") as string | null;

    if (!id || !email) {
      return {
        success: false,
        error: "ID and email are required",
        errorType: "error",
      };
    }

    // La password è opzionale in edit mode (se vuota, non viene aggiornata)
    const updateData: Parameters<typeof updateUser>[1] = {
      email: email.trim(),
      name: name?.trim() || null,
    };

    if (password && password.trim().length > 0) {
      if (password.length < 8) {
        return {
          success: false,
          error: "Password must be at least 8 characters long",
          errorType: "error",
        };
      }
      updateData.password = password.trim();
    }

    const userData = await updateUser(id, updateData);

    revalidatePath("/admin/users");
    return { success: true, data: userData, message: "User updated successfully" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update user",
      errorType: "error",
    };
  }
}

export async function deleteUserAction(id: string): Promise<ActionResult> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized", errorType: "error" };
    }

    if (!id) {
      return { success: false, error: "ID is required", errorType: "error" };
    }

    await deleteUser(id);
    revalidatePath("/admin/users");

    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to delete user";
    const isRelationError = errorMessage.includes("used by") || errorMessage.includes("constraint");

    return {
      success: false,
      error: errorMessage,
      errorType: isRelationError ? "warning" : "error",
    };
  }
}

export async function deleteUsersAction(
  ids: string[],
): Promise<ActionResult<{ deleted: number; failed: number }>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized", errorType: "error" };
    }

    if (!ids || ids.length === 0) {
      return { success: false, error: "At least one ID is required", errorType: "error" };
    }

    let deleted = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const id of ids) {
      try {
        await deleteUser(id);
        deleted++;
      } catch (error) {
        failed++;
        const errorMessage = error instanceof Error ? error.message : "Failed to delete user";
        errors.push(`${id}: ${errorMessage}`);
      }
    }

    revalidatePath("/admin/users");

    if (failed > 0) {
      return {
        success: false,
        error: `Eliminati ${deleted} utenti, ${failed} falliti. ${errors.join("; ")}`,
        errorType: "warning",
      };
    }

    return {
      success: true,
      data: { deleted, failed },
      message: `Eliminati con successo ${deleted} utente${deleted === 1 ? "" : "i"}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete users",
      errorType: "error",
    };
  }
}
