import { openDB, DBSchema, IDBPDatabase } from "idb";

/* **************************************************
 * Types
 **************************************************/
interface PodcastProgress {
  podcastId: string;
  currentTime: number;
  totalTime: number;
  progressPercentage: number;
  lastUpdated: number;
  isCompleted: boolean;
}

interface PodcastProgressDB extends DBSchema {
  podcastProgress: {
    key: string;
    value: PodcastProgress;
    indexes: { "by-lastUpdated": number };
  };
}

/* **************************************************
 * PodcastProgressStorage
 * Gestisce lo storage del progresso di ascolto dei podcast
 **************************************************/
class PodcastProgressStorage {
  private dbName = "podcast-progress-db";
  private dbVersion = 1;
  private db: IDBPDatabase<PodcastProgressDB> | null = null;
  private saveInterval: NodeJS.Timeout | null = null;
  private pendingSaveTimeout: NodeJS.Timeout | null = null;
  private lastSavedTime: number = -1;
  private lastSavedProgress: number = -1;
  private pendingSave: boolean = false;
  private saveIntervalMs = 5000; // 5 secondi
  private pendingSaveTimeoutMs = 2000; // 2 secondi di timeout per pendingSave

  /**
   * Inizializza il database IndexedDB
   */
  async init(): Promise<void> {
    if (typeof window === "undefined") {
      console.warn("PodcastProgressStorage: window is undefined, skipping init");
      return;
    }

    // Verifica che IndexedDB sia disponibile
    if (!window.indexedDB) {
      console.error("PodcastProgressStorage: IndexedDB non è disponibile su questo browser");
      throw new Error("IndexedDB non disponibile");
    }

    if (this.db) {
      return;
    }

    try {
      this.db = await openDB<PodcastProgressDB>(this.dbName, this.dbVersion, {
        upgrade(db) {
          if (!db.objectStoreNames.contains("podcastProgress")) {
            const store = db.createObjectStore("podcastProgress", {
              keyPath: "podcastId",
            });
            store.createIndex("by-lastUpdated", "lastUpdated");
          }
        },
      });

      // Verifica che il database sia effettivamente aperto
      if (!this.db) {
        throw new Error("Database non inizializzato correttamente");
      }
    } catch (error) {
      console.error("Errore nell'inizializzazione del database:", error);
      this.db = null; // Reset per permettere un nuovo tentativo
      throw error;
    }
  }

  /**
   * Ottiene il progresso salvato per un podcast
   */
  async getProgress(podcastId: string): Promise<PodcastProgress | null> {
    // Assicurati che il database sia inizializzato
    if (!this.db) {
      try {
        await this.init();
      } catch (error) {
        console.error("Errore nell'inizializzazione del database per getProgress:", error);
        return null;
      }
    }

    if (!this.db) {
      console.warn("Database non disponibile per il recupero del progresso");
      return null;
    }

    try {
      const progress = await this.db.get("podcastProgress", podcastId);
      return progress || null;
    } catch (error) {
      console.error(`Errore nel recupero del progresso per ${podcastId}:`, error);
      return null;
    }
  }

  /**
   * Salva il progresso di un podcast
   */
  async saveProgress(
    podcastId: string,
    currentTime: number,
    totalTime: number,
    progressPercentage: number,
    isCompleted: boolean = false,
    force: boolean = false,
  ): Promise<void> {
    if (!this.db) {
      try {
        await this.init();
      } catch (error) {
        console.error("Errore nell'inizializzazione del database durante il salvataggio:", error);
        return;
      }
    }

    if (!this.db) {
      console.warn("Database non disponibile per il salvataggio");
      return;
    }

    // Se c'è un salvataggio in corso e non è forzato, aspetta o salta
    if (this.pendingSave && !force) {
      return;
    }

    // Pulisci il timeout precedente se esiste
    if (this.pendingSaveTimeout) {
      clearTimeout(this.pendingSaveTimeout);
      this.pendingSaveTimeout = null;
    }

    this.pendingSave = true;

    // Timeout di sicurezza per evitare che pendingSave rimanga bloccato
    this.pendingSaveTimeout = setTimeout(() => {
      if (this.pendingSave) {
        console.warn("Timeout del salvataggio, resettando pendingSave");
        this.pendingSave = false;
      }
      if (this.pendingSaveTimeout) {
        clearTimeout(this.pendingSaveTimeout);
        this.pendingSaveTimeout = null;
      }
    }, this.pendingSaveTimeoutMs);

    try {
      const progress: PodcastProgress = {
        podcastId,
        currentTime,
        totalTime,
        progressPercentage,
        lastUpdated: Date.now(),
        isCompleted,
      };

      await this.db.put("podcastProgress", progress);
      this.lastSavedTime = currentTime;
      this.lastSavedProgress = progressPercentage;
    } catch (error) {
      console.error(`Errore nel salvataggio del progresso per ${podcastId}:`, error);
      // Su mobile, a volte IndexedDB può fallire silenziosamente
      // Proviamo a reinizializzare il database
      try {
        const oldDb = this.db;
        this.db = null;
        await this.init();
        // Riprova il salvataggio una volta
        if (this.db) {
          const progress: PodcastProgress = {
            podcastId,
            currentTime,
            totalTime,
            progressPercentage,
            lastUpdated: Date.now(),
            isCompleted,
          };
          await (this.db as IDBPDatabase<PodcastProgressDB>).put("podcastProgress", progress);
          this.lastSavedTime = currentTime;
          this.lastSavedProgress = progressPercentage;
        } else {
          // Se il retry fallisce, ripristina il vecchio db
          this.db = oldDb;
        }
      } catch (retryError) {
        console.error(`Errore nel retry del salvataggio per ${podcastId}:`, retryError);
      }
    } finally {
      this.pendingSave = false;
      if (this.pendingSaveTimeout) {
        clearTimeout(this.pendingSaveTimeout);
        this.pendingSaveTimeout = null;
      }
    }
  }

  /**
   * Avvia il salvataggio automatico periodico
   */
  startAutoSave(podcastId: string, getCurrentTime: () => number, getTotalTime: () => number): void {
    this.stopAutoSave();

    this.saveInterval = setInterval(() => {
      const currentTime = getCurrentTime();
      const totalTime = getTotalTime();

      if (totalTime === 0 || currentTime === 0) {
        return;
      }

      const progressPercentage = (currentTime / totalTime) * 100;
      const timeDifference = Math.abs(currentTime - this.lastSavedTime);
      const progressDifference = Math.abs(progressPercentage - this.lastSavedProgress);

      // Salva solo se c'è stato un cambiamento significativo
      // (almeno 1 secondo o 1% di progresso)
      if (timeDifference >= 1 || progressDifference >= 1) {
        this.saveProgress(podcastId, currentTime, totalTime, progressPercentage, false).catch(
          (error) => {
            console.error("Errore nel salvataggio automatico:", error);
          },
        );
      }
    }, this.saveIntervalMs);
  }

  /**
   * Ferma il salvataggio automatico
   */
  stopAutoSave(): void {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }
    if (this.pendingSaveTimeout) {
      clearTimeout(this.pendingSaveTimeout);
      this.pendingSaveTimeout = null;
    }
  }

  /**
   * Salva immediatamente il progresso (usato quando cambia la timeline manualmente)
   */
  async saveImmediately(
    podcastId: string,
    currentTime: number,
    totalTime: number,
    progressPercentage: number,
  ): Promise<void> {
    // Assicurati che il database sia inizializzato prima di salvare
    if (!this.db) {
      try {
        await this.init();
      } catch (error) {
        console.error("Errore nell'inizializzazione del database per saveImmediately:", error);
        throw error;
      }
    }

    // Forza il salvataggio anche se c'è un salvataggio in corso
    await this.saveProgress(podcastId, currentTime, totalTime, progressPercentage, false, true);
  }

  /**
   * Segna un podcast come completato
   */
  async markAsCompleted(podcastId: string, totalTime: number): Promise<void> {
    await this.saveProgress(podcastId, totalTime, totalTime, 100, true);
  }

  /**
   * Rimuove il progresso salvato per un podcast
   */
  async deleteProgress(podcastId: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    if (!this.db) {
      return;
    }

    try {
      await this.db.delete("podcastProgress", podcastId);
    } catch (error) {
      console.error(`Errore nella rimozione del progresso per ${podcastId}:`, error);
    }
  }

  /**
   * Ottiene tutti i progressi salvati
   */
  async getAllProgress(): Promise<PodcastProgress[]> {
    if (!this.db) {
      await this.init();
    }

    if (!this.db) {
      return [];
    }

    try {
      return await this.db.getAll("podcastProgress");
    } catch (error) {
      console.error("Errore nel recupero di tutti i progressi:", error);
      return [];
    }
  }

  /**
   * Chiude la connessione al database
   */
  async close(): Promise<void> {
    this.stopAutoSave();
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Esporta un'istanza singleton
export const podcastProgressStorage = new PodcastProgressStorage();
