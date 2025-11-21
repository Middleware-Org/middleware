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
  private storeName = "podcastProgress";
  private db: IDBPDatabase<PodcastProgressDB> | null = null;
  private saveInterval: NodeJS.Timeout | null = null;
  private lastSavedTime: number = -1;
  private lastSavedProgress: number = -1;
  private pendingSave: boolean = false;
  private saveIntervalMs = 5000; // 5 secondi

  /**
   * Inizializza il database IndexedDB
   */
  async init(): Promise<void> {
    if (typeof window === "undefined") {
      console.warn("PodcastProgressStorage: window is undefined, skipping init");
      return;
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
    } catch (error) {
      console.error("Errore nell'inizializzazione del database:", error);
      throw error;
    }
  }

  /**
   * Ottiene il progresso salvato per un podcast
   */
  async getProgress(podcastId: string): Promise<PodcastProgress | null> {
    if (!this.db) {
      await this.init();
    }

    if (!this.db) {
      return null;
    }

    try {
      const progress = await this.db.get(this.storeName, podcastId);
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
  ): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    if (!this.db) {
      return;
    }

    if (this.pendingSave) {
      return;
    }

    this.pendingSave = true;

    try {
      const progress: PodcastProgress = {
        podcastId,
        currentTime,
        totalTime,
        progressPercentage,
        lastUpdated: Date.now(),
        isCompleted,
      };

      await this.db.put(this.storeName, progress);
      this.lastSavedTime = currentTime;
      this.lastSavedProgress = progressPercentage;
    } catch (error) {
      console.error(`Errore nel salvataggio del progresso per ${podcastId}:`, error);
    } finally {
      this.pendingSave = false;
    }
  }

  /**
   * Avvia il salvataggio automatico periodico
   */
  startAutoSave(
    podcastId: string,
    getCurrentTime: () => number,
    getTotalTime: () => number,
  ): void {
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
    await this.saveProgress(podcastId, currentTime, totalTime, progressPercentage, false);
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
      await this.db.delete(this.storeName, podcastId);
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
      return await this.db.getAll(this.storeName);
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

