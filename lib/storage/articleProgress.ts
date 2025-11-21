/* **************************************************
 * Article Progress Storage Service (IndexedDB)
 **************************************************/

import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "articleProgress";
const DB_VERSION = 1;
const STORE_NAME = "progress";

export type ArticleProgress = {
  articleId: string;
  currentTime: number;
  totalTime: number;
  progressPercentage: number;
  lastUpdated: number;
  isCompleted: boolean;
};

type DB = IDBPDatabase<{
  progress: {
    key: string;
    value: ArticleProgress;
    indexes: { lastUpdated: number; isCompleted: boolean };
  };
}>;

let dbPromise: Promise<DB> | null = null;

/**
 * Inizializza il database IndexedDB
 */
async function getDB(): Promise<DB> {
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = openDB<{
    progress: {
      key: string;
      value: ArticleProgress;
      indexes: { lastUpdated: number; isCompleted: boolean };
    };
  }>(DB_NAME, DB_VERSION, {
    upgrade(database) {
      // Crea lo store se non esiste
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = database.createObjectStore(STORE_NAME, {
          keyPath: "articleId",
        });

        // Crea indici per query più efficienti
        objectStore.createIndex("lastUpdated", "lastUpdated", { unique: false });
        objectStore.createIndex("isCompleted", "isCompleted", { unique: false });
      }
    },
  });

  return dbPromise;
}

/**
 * Salva il progresso di lettura di un articolo
 */
export async function saveArticleProgress(
  articleId: string,
  currentTime: number,
  totalTime: number,
  progressPercentage: number,
): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const database = await getDB();

    const progress: ArticleProgress = {
      articleId,
      currentTime,
      totalTime,
      progressPercentage,
      lastUpdated: Date.now(),
      isCompleted: progressPercentage >= 99, // Considera completato se >= 99%
    };

    await database.put(STORE_NAME, progress);
  } catch (error) {
    console.error("Errore nel salvataggio del progresso:", error);
    throw error;
  }
}

/**
 * Recupera il progresso di lettura di un articolo
 */
export async function getArticleProgress(articleId: string): Promise<ArticleProgress | null> {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const database = await getDB();
    return (await database.get(STORE_NAME, articleId)) || null;
  } catch (error) {
    console.error("Errore nel recupero del progresso:", error);
    return null;
  }
}

/**
 * Elimina il progresso di un articolo
 */
export async function deleteArticleProgress(articleId: string): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const database = await getDB();
    await database.delete(STORE_NAME, articleId);
  } catch (error) {
    console.error("Errore nell'eliminazione del progresso:", error);
    throw error;
  }
}

/**
 * Recupera tutti i progressi salvati
 */
export async function getAllProgress(): Promise<ArticleProgress[]> {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const database = await getDB();
    return await database.getAll(STORE_NAME);
  } catch (error) {
    console.error("Errore nel recupero di tutti i progressi:", error);
    return [];
  }
}
