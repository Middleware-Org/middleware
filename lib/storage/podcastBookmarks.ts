import { openDB, DBSchema, IDBPDatabase } from "idb";

/* **************************************************
 * Types
 **************************************************/
export interface PodcastBookmark {
  id: string; // ID univoco del segnaposto
  podcastSlug: string; // Slug del podcast
  time: number; // Tempo in secondi nel podcast
  selector?: string; // Selettore CSS opzionale per trovare l'elemento nella trascrizione
  offsetTop?: number; // Offset opzionale relativo al contenitore della trascrizione
  createdAt: number; // Timestamp di creazione
}

interface PodcastBookmarksDB extends DBSchema {
  podcastBookmarks: {
    key: string; // ID del segnaposto
    value: PodcastBookmark;
    indexes: {
      "by-podcastSlug": string; // Indice per trovare tutti i segnaposto di un podcast
      "by-time": number; // Indice per ordinare per tempo
      "by-createdAt": number; // Indice per ordinare per data di creazione
    };
  };
}

/* **************************************************
 * PodcastBookmarksStorage
 * Gestisce lo storage dei segnaposto dei podcast
 **************************************************/
class PodcastBookmarksStorage {
  private dbName = "podcast-bookmarks-db";
  private dbVersion = 1;
  private db: IDBPDatabase<PodcastBookmarksDB> | null = null;

  /**
   * Inizializza il database IndexedDB
   */
  async init(): Promise<void> {
    if (typeof window === "undefined") {
      console.warn("PodcastBookmarksStorage: window is undefined, skipping init");
      return;
    }

    // Verifica che IndexedDB sia disponibile
    if (!window.indexedDB) {
      console.error("PodcastBookmarksStorage: IndexedDB non è disponibile su questo browser");
      throw new Error("IndexedDB non disponibile");
    }

    if (this.db) {
      return;
    }

    try {
      this.db = await openDB<PodcastBookmarksDB>(this.dbName, this.dbVersion, {
        upgrade(db) {
          if (!db.objectStoreNames.contains("podcastBookmarks")) {
            const store = db.createObjectStore("podcastBookmarks", {
              keyPath: "id",
            });
            store.createIndex("by-podcastSlug", "podcastSlug");
            store.createIndex("by-time", "time");
            store.createIndex("by-createdAt", "createdAt");
          }
        },
      });

      if (!this.db) {
        throw new Error("Database non inizializzato correttamente");
      }
    } catch (error) {
      console.error("Errore nell'inizializzazione del database:", error);
      this.db = null;
      throw error;
    }
  }

  /**
   * Ottiene tutti i segnaposto per un podcast
   */
  async getBookmarks(podcastSlug: string): Promise<PodcastBookmark[]> {
    if (!this.db) {
      try {
        await this.init();
      } catch (error) {
        console.error("Errore nell'inizializzazione del database per getBookmarks:", error);
        return [];
      }
    }

    if (!this.db) {
      return [];
    }

    try {
      const bookmarks = await this.db.getAllFromIndex(
        "podcastBookmarks",
        "by-podcastSlug",
        podcastSlug,
      );
      // Ordina per tempo (dall'inizio alla fine)
      return bookmarks.sort((a, b) => a.time - b.time);
    } catch (error) {
      console.error(`Errore nel recupero dei segnaposto per ${podcastSlug}:`, error);
      return [];
    }
  }

  /**
   * Salva un nuovo segnaposto
   */
  async saveBookmark(
    bookmark: Omit<PodcastBookmark, "id" | "createdAt">,
  ): Promise<PodcastBookmark> {
    if (!this.db) {
      try {
        await this.init();
      } catch (error) {
        console.error("Errore nell'inizializzazione del database durante il salvataggio:", error);
        throw error;
      }
    }

    if (!this.db) {
      throw new Error("Database non disponibile");
    }

    try {
      const newBookmark: PodcastBookmark = {
        ...bookmark,
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        createdAt: Date.now(),
      };

      await this.db.put("podcastBookmarks", newBookmark);
      return newBookmark;
    } catch (error) {
      console.error("Errore nel salvataggio del segnaposto:", error);
      throw error;
    }
  }

  /**
   * Elimina un segnaposto
   */
  async deleteBookmark(bookmarkId: string): Promise<void> {
    if (!this.db) {
      try {
        await this.init();
      } catch (error) {
        console.error("Errore nell'inizializzazione del database durante l'eliminazione:", error);
        return;
      }
    }

    if (!this.db) {
      return;
    }

    try {
      await this.db.delete("podcastBookmarks", bookmarkId);
    } catch (error) {
      console.error(`Errore nella rimozione del segnaposto ${bookmarkId}:`, error);
      throw error;
    }
  }

  /**
   * Elimina tutti i segnaposto di un podcast
   */
  async deleteBookmarksByPodcast(podcastSlug: string): Promise<void> {
    if (!this.db) {
      try {
        await this.init();
      } catch (error) {
        console.error("Errore nell'inizializzazione del database durante l'eliminazione:", error);
        return;
      }
    }

    if (!this.db) {
      return;
    }

    try {
      const bookmarks = await this.db.getAllFromIndex(
        "podcastBookmarks",
        "by-podcastSlug",
        podcastSlug,
      );
      const deletePromises = bookmarks.map((bookmark) =>
        this.db!.delete("podcastBookmarks", bookmark.id),
      );
      await Promise.all(deletePromises);
    } catch (error) {
      console.error(`Errore nella rimozione dei segnaposto per ${podcastSlug}:`, error);
      throw error;
    }
  }

  /**
   * Verifica se un segnaposto esiste già in un tempo simile
   */
  async findBookmarkAtTime(
    podcastSlug: string,
    time: number,
    tolerance: number = 2, // Tolleranza di 2 secondi
  ): Promise<PodcastBookmark | null> {
    if (!this.db) {
      try {
        await this.init();
      } catch {
        return null;
      }
    }

    if (!this.db) {
      return null;
    }

    try {
      const bookmarks = await this.db.getAllFromIndex(
        "podcastBookmarks",
        "by-podcastSlug",
        podcastSlug,
      );
      // Cerca un segnaposto con tempo molto vicino
      return bookmarks.find((b) => Math.abs(b.time - time) < tolerance) || null;
    } catch {
      return null;
    }
  }

  /**
   * Chiude la connessione al database
   */
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Esporta un'istanza singleton
export const podcastBookmarksStorage = new PodcastBookmarksStorage();
