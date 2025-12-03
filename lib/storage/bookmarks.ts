import { openDB, DBSchema, IDBPDatabase } from "idb";

/* **************************************************
 * Types
 **************************************************/
export interface Bookmark {
  id: string; // ID univoco del segnalibro
  articleSlug: string; // Slug dell'articolo
  selector: string; // Selettore CSS per trovare l'elemento nel DOM
  offsetTop: number; // Offset relativo al contenitore del contenuto (in pixel)
  createdAt: number; // Timestamp di creazione
}

interface BookmarksDB extends DBSchema {
  bookmarks: {
    key: string; // ID del segnalibro
    value: Bookmark;
    indexes: {
      "by-articleSlug": string; // Indice per trovare tutti i segnalibri di un articolo
      "by-createdAt": number; // Indice per ordinare per data di creazione
    };
  };
}

/* **************************************************
 * BookmarksStorage
 * Gestisce lo storage dei segnalibri degli articoli
 **************************************************/
class BookmarksStorage {
  private dbName = "bookmarks-db";
  private dbVersion = 1;
  private db: IDBPDatabase<BookmarksDB> | null = null;

  /**
   * Inizializza il database IndexedDB
   */
  async init(): Promise<void> {
    if (typeof window === "undefined") {
      console.warn("BookmarksStorage: window is undefined, skipping init");
      return;
    }

    // Verifica che IndexedDB sia disponibile
    if (!window.indexedDB) {
      console.error("BookmarksStorage: IndexedDB non è disponibile su questo browser");
      throw new Error("IndexedDB non disponibile");
    }

    if (this.db) {
      return;
    }

    try {
      this.db = await openDB<BookmarksDB>(this.dbName, this.dbVersion, {
        upgrade(db) {
          if (!db.objectStoreNames.contains("bookmarks")) {
            const store = db.createObjectStore("bookmarks", {
              keyPath: "id",
            });
            store.createIndex("by-articleSlug", "articleSlug");
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
   * Ottiene tutti i segnalibri per un articolo
   */
  async getBookmarks(articleSlug: string): Promise<Bookmark[]> {
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
      const bookmarks = await this.db.getAllFromIndex("bookmarks", "by-articleSlug", articleSlug);
      // Ordina per offsetTop (dall'alto verso il basso)
      return bookmarks.sort((a, b) => a.offsetTop - b.offsetTop);
    } catch (error) {
      console.error(`Errore nel recupero dei segnalibri per ${articleSlug}:`, error);
      return [];
    }
  }

  /**
   * Salva un nuovo segnalibro
   */
  async saveBookmark(bookmark: Omit<Bookmark, "id" | "createdAt">): Promise<Bookmark> {
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
      const newBookmark: Bookmark = {
        ...bookmark,
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        createdAt: Date.now(),
      };

      await this.db.put("bookmarks", newBookmark);
      return newBookmark;
    } catch (error) {
      console.error("Errore nel salvataggio del segnalibro:", error);
      throw error;
    }
  }

  /**
   * Elimina un segnalibro
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
      await this.db.delete("bookmarks", bookmarkId);
    } catch (error) {
      console.error(`Errore nella rimozione del segnalibro ${bookmarkId}:`, error);
      throw error;
    }
  }

  /**
   * Elimina tutti i segnalibri di un articolo
   */
  async deleteBookmarksByArticle(articleSlug: string): Promise<void> {
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
      const bookmarks = await this.db.getAllFromIndex("bookmarks", "by-articleSlug", articleSlug);
      const deletePromises = bookmarks.map((bookmark) => this.db!.delete("bookmarks", bookmark.id));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error(`Errore nella rimozione dei segnalibri per ${articleSlug}:`, error);
      throw error;
    }
  }

  /**
   * Verifica se un segnalibro esiste già in una posizione simile
   */
  async findBookmarkAtPosition(
    articleSlug: string,
    selector: string,
    tolerance: number = 50,
  ): Promise<Bookmark | null> {
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
      const bookmarks = await this.db.getAllFromIndex("bookmarks", "by-articleSlug", articleSlug);
      // Cerca un segnalibro con lo stesso selettore o offsetTop molto vicino
      return (
        bookmarks.find(
          (b) =>
            b.selector === selector ||
            Math.abs(b.offsetTop - (bookmarks[0]?.offsetTop || 0)) < tolerance,
        ) || null
      );
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
export const bookmarksStorage = new BookmarksStorage();
