/* **************************************************
 * User Service - Cache-aware con Next.js
 ************************************************** */

import type { User } from "@/lib/github/types";
import {
  getAllUsers as getUsersFromDB,
  getUserById as getUserFromDB,
} from "@/lib/github/users";

/**
 * Cache tags per invalidazione granulare
 */
export const USER_CACHE_TAGS = {
  all: "users",
  byId: (id: string) => `user-${id}`,
} as const;

/**
 * User Service
 */
export class UserService {
  /**
   * Recupera tutti gli utenti
   */
  static async getAll(): Promise<User[]> {
    return await getUsersFromDB();
  }

  /**
   * Recupera un singolo utente per ID
   */
  static async getById(id: string): Promise<User | undefined> {
    return await getUserFromDB(id);
  }
}
