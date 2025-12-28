/* **************************************************
 * User Actions - Server Actions con cache invalidation
 ************************************************** */
"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { getUser } from "@/lib/auth/server";
import {
  createUser,
  updateUser,
  deleteUser,
} from "@/lib/github/users";
import { USER_CACHE_TAGS } from "@/lib/services";
import type { User, ActionResponse } from "@/lib/github/types";

/**
 * Crea un nuovo utente e invalida la cache
 */
export async function createUserAction(
  _prevState: ActionResponse<User> | null,
  formData: FormData,
): Promise<ActionResponse<User>> {
  try {
    const currentUser = await getUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    const email = formData.get("email") as string;
    const name = formData.get("name") as string | null;
    const password = formData.get("password") as string;

    if (!email) {
      return {
        success: false,
        error: "Email is required",
      };
    }

    if (!password || password.length < 8) {
      return {
        success: false,
        error: "Password is required and must be at least 8 characters long",
      };
    }

    const userData = await createUser({
      email: email.trim(),
      name: name?.trim() || null,
      password,
    });

    // Invalida la cache
    revalidateTag(USER_CACHE_TAGS.all);
    revalidatePath("/admin/users");

    return { success: true, data: userData };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create user",
    };
  }
}

/**
 * Aggiorna un utente esistente e invalida la cache
 */
export async function updateUserAction(
  _prevState: ActionResponse<User> | null,
  formData: FormData,
): Promise<ActionResponse<User>> {
  try {
    const currentUser = await getUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    const id = formData.get("id") as string;
    const email = formData.get("email") as string;
    const name = formData.get("name") as string | null;
    const password = formData.get("password") as string | null;

    if (!id || !email) {
      return {
        success: false,
        error: "ID and email are required",
      };
    }

    // La password è opzionale in edit mode
    const updateData: Parameters<typeof updateUser>[1] = {
      email: email.trim(),
      name: name?.trim() || null,
    };

    if (password && password.trim().length > 0) {
      if (password.length < 8) {
        return {
          success: false,
          error: "Password must be at least 8 characters long",
        };
      }
      updateData.password = password.trim();
    }

    const userData = await updateUser(id, updateData);

    // Invalida la cache
    revalidateTag(USER_CACHE_TAGS.all);
    revalidateTag(USER_CACHE_TAGS.byId(id));
    revalidatePath("/admin/users");

    return { success: true, data: userData };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update user",
    };
  }
}

/**
 * Elimina un utente e invalida la cache
 */
export async function deleteUserAction(id: string): Promise<ActionResponse> {
  try {
    const currentUser = await getUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    if (!id) {
      return { success: false, error: "ID is required" };
    }

    await deleteUser(id);

    // Invalida la cache
    revalidateTag(USER_CACHE_TAGS.all);
    revalidateTag(USER_CACHE_TAGS.byId(id));
    revalidatePath("/admin/users");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete user",
    };
  }
}

/**
 * Elimina multipli utenti (batch delete)
 */
export async function deleteUsersAction(
  ids: string[],
): Promise<ActionResponse<{ deleted: number; failed: number }>> {
  try {
    const currentUser = await getUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    if (!ids || ids.length === 0) {
      return { success: false, error: "At least one ID is required" };
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

    // Invalida la cache globale
    revalidateTag(USER_CACHE_TAGS.all);
    revalidatePath("/admin/users");

    if (failed > 0) {
      return {
        success: false,
        error: `Deleted ${deleted} users, ${failed} failed. ${errors.join("; ")}`,
      };
    }

    return {
      success: true,
      data: { deleted, failed },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete users",
    };
  }
}
