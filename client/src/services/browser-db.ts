/**
 * BrowserDB - IndexedDB wrapper for large data storage
 * Uses IndexedDB for large datasets, localStorage for small data
 * Database is always the source of truth
 */

const DB_NAME = 'devprep-browser-db';
const DB_VERSION = 1;

interface DBSchema {
  questions: QuestionDBRecord;
  progress: ProgressDBRecord;
  bookmarks: BookmarkDBRecord;
  channels: ChannelDBRecord;
  activity: ActivityDBRecord;
  sync: SyncDBRecord;
}

interface QuestionDBRecord {
  id: string;
  data: string;
  channel: string;
  subChannel: string;
  difficulty: string;
  lastUpdated: number;
}

interface ProgressDBRecord {
  id: string;
  userId: string;
  channelId: string;
  completedQuestions: string[];
  markedQuestions: string[];
  lastVisitedIndex: number;
  lastUpdated: number;
}

interface BookmarkDBRecord {
  id: string;
  questionId: string;
  userId: string;
  createdAt: number;
}

interface ChannelDBRecord {
  id: string;
  data: string;
  lastUpdated: number;
}

interface ActivityDBRecord {
  id: string;
  date: string;
  count: number;
  userId: string;
}

interface SyncDBRecord {
  id: string;
  entity: string;
  entityId: string;
  action: 'create' | 'update' | 'delete';
  data: string;
  synced: boolean;
  createdAt: number;
}

class BrowserDB {
  private db: IDBDatabase | null = null;
  private dbReady: Promise<void>;
  private isDbReady = false;
  private syncInterval: number | null = null;

  constructor() {
    // Start init but don't block - lazy init pattern
    this.dbReady = this.initDB().then(() => {
      this.isDbReady = true;
    });
    // Don't start sync in constructor - let db-storage-sync handle it
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('questions')) {
          const questionStore = db.createObjectStore('questions', { keyPath: 'id' });
          questionStore.createIndex('channel', 'channel', { unique: false });
          questionStore.createIndex('subChannel', 'subChannel', { unique: false });
          questionStore.createIndex('difficulty', 'difficulty', { unique: false });
          questionStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
        }

        if (!db.objectStoreNames.contains('progress')) {
          const progressStore = db.createObjectStore('progress', { keyPath: 'id' });
          progressStore.createIndex('userId', 'userId', { unique: false });
          progressStore.createIndex('channelId', 'channelId', { unique: false });
        }

        if (!db.objectStoreNames.contains('bookmarks')) {
          const bookmarkStore = db.createObjectStore('bookmarks', { keyPath: 'id' });
          bookmarkStore.createIndex('questionId', 'questionId', { unique: false });
          bookmarkStore.createIndex('userId', 'userId', { unique: false });
        }

        if (!db.objectStoreNames.contains('channels')) {
          const channelStore = db.createObjectStore('channels', { keyPath: 'id' });
          channelStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
        }

        if (!db.objectStoreNames.contains('activity')) {
          const activityStore = db.createObjectStore('activity', { keyPath: 'id' });
          activityStore.createIndex('date', 'date', { unique: false });
          activityStore.createIndex('userId', 'userId', { unique: false });
        }

        if (!db.objectStoreNames.contains('sync')) {
          const syncStore = db.createObjectStore('sync', { keyPath: 'id' });
          syncStore.createIndex('entity', 'entity', { unique: false });
          syncStore.createIndex('synced', 'synced', { unique: false });
          syncStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }

  private startSync(): void {
    if (typeof window !== 'undefined') {
      this.syncInterval = window.setInterval(() => {
        this.syncWithDatabase().catch(err => {
          console.warn('Auto-sync failed:', err);
        });
      }, 30000);
    }
  }

  public stopSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  public startSyncIfEnabled(enabled: boolean): void {
    if (enabled) {
      this.startSync();
    }
  }

  async ready(): Promise<void> {
    // Already ready, return immediately
    if (this.isDbReady) return;
    // Wait for DB to finish initializing (or fail gracefully)
    try {
      await this.dbReady;
    } catch {
      // DB init failed, operations will gracefully skip
    }
  }

  private getStore(name: keyof DBSchema, mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
    if (!this.db) throw new Error('Database not initialized');
    const transaction = this.db.transaction(name, mode);
    return transaction.objectStore(name);
  }

  async put<T>(storeName: keyof DBSchema, data: T & { id: string }): Promise<void> {
    // Non-blocking: fire-and-forget init, proceed with operation
    this.ready().catch(() => {});
    if (!this.db) return Promise.resolve(); // Skip if DB not ready
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readwrite');
      const request = store.put(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async get<T>(storeName: keyof DBSchema, id: string): Promise<T | undefined> {
    this.ready().catch(() => {});
    if (!this.db) return undefined;
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result as T);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T>(storeName: keyof DBSchema): Promise<T[]> {
    this.ready().catch(() => {});
    if (!this.db) return [];
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error);
    });
  }

  async getByIndex<T>(
    storeName: keyof DBSchema,
    indexName: string,
    value: IDBValidKey
  ): Promise<T[]> {
    this.ready().catch(() => {});
    if (!this.db) return [];
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);
      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: keyof DBSchema, id: string): Promise<void> {
    this.ready().catch(() => {});
    if (!this.db) return;
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readwrite');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName: keyof DBSchema): Promise<void> {
    this.ready().catch(() => {});
    if (!this.db) return;
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readwrite');
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async bulkPut<T extends { id: string }>(storeName: keyof DBSchema, data: T[]): Promise<void> {
    this.ready().catch(() => {});
    if (!this.db) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      
      data.forEach(item => store.put(item));
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async queueSync(entity: string, entityId: string, action: 'create' | 'update' | 'delete', data: unknown): Promise<void> {
    const syncRecord: SyncDBRecord = {
      id: `${entity}-${entityId}-${Date.now()}`,
      entity,
      entityId,
      action,
      data: JSON.stringify(data),
      synced: false,
      createdAt: Date.now(),
    };
    await this.put('sync', syncRecord);
  }

  async getPendingSyncs(): Promise<SyncDBRecord[]> {
    const all = await this.getAll<SyncDBRecord>('sync');
    return all.filter(s => !s.synced);
  }

  async markSynced(id: string): Promise<void> {
    const sync = await this.get<SyncDBRecord>('sync', id);
    if (sync) {
      sync.synced = true;
      await this.put('sync', sync);
    }
  }

  async syncWithDatabase(): Promise<void> {
    const pendingSyncs = await this.getPendingSyncs();
    
    for (const sync of pendingSyncs) {
      try {
        const endpoint = `/api/sync`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: sync.data,
        });
        
        if (response.ok) {
          await this.markSynced(sync.id);
        }
      } catch (error) {
        console.warn('Sync failed, will retry:', error);
      }
    }
  }

  async getQuestionsByChannel(channel: string): Promise<QuestionDBRecord[]> {
    return this.getByIndex<QuestionDBRecord>('questions', 'channel', channel);
  }

  async getProgress(userId: string, channelId: string): Promise<ProgressDBRecord | undefined> {
    const allProgress = await this.getByIndex<ProgressDBRecord>('progress', 'userId', userId);
    return allProgress.find(p => p.channelId === channelId);
  }

  async updateProgress(userId: string, channelId: string, updates: Partial<ProgressDBRecord>): Promise<void> {
    const existing = await this.getProgress(userId, channelId);
    const progress: ProgressDBRecord = {
      id: existing?.id || `${userId}-${channelId}`,
      userId,
      channelId,
      completedQuestions: existing?.completedQuestions || [],
      markedQuestions: existing?.markedQuestions || [],
      lastVisitedIndex: existing?.lastVisitedIndex || 0,
      lastUpdated: Date.now(),
      ...updates,
    };
    await this.put('progress', progress);
    await this.queueSync('progress', progress.id, 'update', progress);
  }

  destroy(): void {
    this.stopSync();
    if (this.db) {
      this.db.close();
    }
  }
}

export const browserDB = new BrowserDB();
export default browserDB;
