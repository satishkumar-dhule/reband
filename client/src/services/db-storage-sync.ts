/**
 * Database Storage Sync Service
 * Ensures database is always the source of truth
 * Uses IndexedDB for offline-first experience with sync
 */

import { browserDB } from './browser-db';
import { storage } from './storage.service';

export interface SyncConfig {
  autoSync: boolean;
  syncInterval: number;
  retryAttempts: number;
}

const DEFAULT_SYNC_CONFIG: SyncConfig = {
  autoSync: true,
  syncInterval: 30000,
  retryAttempts: 3,
};

class DatabaseStorageSync {
  private config: SyncConfig = DEFAULT_SYNC_CONFIG;
  private syncInProgress = false;
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private userId = 'anonymous';

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    await browserDB.ready();
    this.loadUserId();
    
    if (this.config.autoSync) {
      this.startAutoSync();
    }
  }

  private loadUserId(): void {
    const preferences = storage.preferences.get();
    if (preferences.createdAt) {
      this.userId = preferences.createdAt;
    }
  }

  private startAutoSync(): void {
    if (this.syncInterval) clearInterval(this.syncInterval);
    this.syncInterval = setInterval(async () => {
      try {
        await this.syncWithDatabase();
      } catch (error) {
        console.error('Auto-sync failed:', error);
      }
    }, this.config.syncInterval);
  }

  private stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async setUserId(userId: string): Promise<void> {
    this.userId = userId;
  }

  async syncWithDatabase(): Promise<SyncResult> {
    if (this.syncInProgress) {
      return { success: false, error: 'Sync already in progress', synced: 0, failed: 0, pending: 0 };
    }

    this.syncInProgress = true;
    const result: SyncResult = {
      success: true,
      synced: 0,
      failed: 0,
      pending: 0,
    };

    try {
      const pendingSyncs = await browserDB.getPendingSyncs();
      result.pending = pendingSyncs.length;

      for (const sync of pendingSyncs) {
        try {
          const success = await this.syncRecord(sync);
          if (success) {
            await browserDB.markSynced(sync.id);
            result.synced++;
          } else {
            result.failed++;
          }
        } catch (error) {
          result.failed++;
          console.error('Sync failed for record:', sync.id, error);
        }
      }

      if (result.synced > 0) {
        await this.fetchLatestFromDatabase();
      }
    } catch (error) {
      result.success = false;
      result.error = String(error);
    } finally {
      this.syncInProgress = false;
    }

    return result;
  }

  private async syncRecord(sync: SyncRecord): Promise<boolean> {
    try {
      const endpoint = `/api/sync`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: sync.entity,
          entityId: sync.entityId,
          action: sync.action,
          data: JSON.parse(sync.data),
        }),
      });
      
      if (!response.ok) {
        const errorBody = await response.text().catch(() => 'Unknown error');
        console.warn(`Sync record failed: ${response.status} - ${errorBody}`);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Sync record error:', error);
      return false;
    }
  }

  private async fetchLatestFromDatabase(): Promise<void> {
    try {
      const channelsResponse = await fetch('/api/channels');
      if (channelsResponse.ok) {
        const channels = await channelsResponse.json();
        
        for (const channel of channels) {
          await browserDB.put('channels', {
            id: channel.id,
            data: JSON.stringify(channel),
            lastUpdated: Date.now(),
          });
        }
      } else {
        console.warn(`Failed to fetch channels: ${channelsResponse.status}`);
      }

      const progressResponse = await fetch(`/api/progress/${this.userId}`);
      if (progressResponse.ok) {
        const progress = await progressResponse.json();
        
        for (const p of progress) {
          await browserDB.put('progress', {
            id: `${this.userId}-${p.channelId}`,
            userId: this.userId,
            channelId: p.channelId,
            completedQuestions: p.completedQuestions || [],
            markedQuestions: p.markedQuestions || [],
            lastVisitedIndex: p.lastVisitedIndex || 0,
            lastUpdated: Date.now(),
          });
        }
      } else {
        console.warn(`Failed to fetch progress: ${progressResponse.status}`);
      }
    } catch (error) {
      console.warn('Failed to fetch latest from database:', error);
    }
  }

  async getProgress(channelId: string): Promise<ProgressData | null> {
    const local = await browserDB.getProgress(this.userId, channelId);
    
    if (local) {
      return {
        completedQuestions: local.completedQuestions,
        markedQuestions: local.markedQuestions,
        lastVisitedIndex: local.lastVisitedIndex,
        synced: true,
        lastUpdated: local.lastUpdated,
      };
    }
    
    return null;
  }

  async saveProgress(channelId: string, data: Partial<ProgressData>): Promise<void> {
    await browserDB.updateProgress(this.userId, channelId, {
      completedQuestions: data.completedQuestions,
      markedQuestions: data.markedQuestions,
      lastVisitedIndex: data.lastVisitedIndex,
    });
  }

  async markQuestionComplete(channelId: string, questionId: string): Promise<void> {
    const existing = await browserDB.getProgress(this.userId, channelId);
    const completed = existing?.completedQuestions || [];
    
    if (!completed.includes(questionId)) {
      completed.push(questionId);
      await browserDB.updateProgress(this.userId, channelId, { completedQuestions: completed });
    }
  }

  async toggleBookmark(channelId: string, questionId: string): Promise<boolean> {
    const existing = await browserDB.getProgress(this.userId, channelId);
    const marked = existing?.markedQuestions || [];
    
    const index = marked.indexOf(questionId);
    const isBookmarked = index === -1;
    
    if (isBookmarked) {
      marked.push(questionId);
    } else {
      marked.splice(index, 1);
    }
    
    await browserDB.updateProgress(this.userId, channelId, { markedQuestions: marked });
    
    return isBookmarked;
  }

  async getQuestions(channel: string): Promise<QuestionData[]> {
    const cached = await browserDB.getQuestionsByChannel(channel);
    
    if (cached.length > 0) {
      return cached.map(q => JSON.parse(q.data));
    }
    
    try {
      const response = await fetch(`/api/questions?channel=${channel}`);
      if (response.ok) {
        const questions = await response.json();
        
        await browserDB.bulkPut('questions', questions.map((q: QuestionData) => ({
          id: q.id,
          data: JSON.stringify(q),
          channel: q.channel || channel,
          subChannel: q.subChannel || '',
          difficulty: q.difficulty || 'beginner',
          lastUpdated: Date.now(),
        })));
        
        return questions;
      } else {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`Failed to fetch questions: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    }
    
    return [];
  }

  async cacheQuestion(question: QuestionData): Promise<void> {
    await browserDB.put('questions', {
      id: question.id,
      data: JSON.stringify(question),
      channel: question.channel || '',
      subChannel: question.subChannel || '',
      difficulty: question.difficulty || 'beginner',
      lastUpdated: Date.now(),
    });
  }

  async getCacheStats(): Promise<CacheStats> {
    const questions = await browserDB.getAll<{id: string; lastUpdated: number}>('questions');
    const progress = await browserDB.getAll<{id: string}>('progress');
    const pendingSyncs = await browserDB.getPendingSyncs();
    
    return {
      questionsCount: questions.length,
      progressCount: progress.length,
      pendingSyncs: pendingSyncs.length,
      oldestCache: questions.length > 0 
        ? Math.min(...questions.map(q => q.lastUpdated))
        : null,
    };
  }

  async clearCache(): Promise<void> {
    await browserDB.clear('questions');
  }

  configure(config: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (config.autoSync !== undefined) {
      if (config.autoSync) {
        this.startAutoSync();
      } else {
        this.stopAutoSync();
      }
    }
  }

  getConfig(): SyncConfig {
    return { ...this.config };
  }

  isSyncing(): boolean {
    return this.syncInProgress;
  }

  destroy(): void {
    this.stopAutoSync();
  }
}

interface SyncRecord {
  id: string;
  entity: string;
  entityId: string;
  action: string;
  data: string;
  synced: boolean;
  createdAt: number;
}

interface ProgressData {
  completedQuestions: string[];
  markedQuestions: string[];
  lastVisitedIndex: number;
  synced?: boolean;
  lastUpdated?: number;
}

interface QuestionData {
  id: string;
  question: string;
  answer: string;
  channel?: string;
  subChannel?: string;
  difficulty?: string;
  [key: string]: unknown;
}

interface CacheStats {
  questionsCount: number;
  progressCount: number;
  pendingSyncs: number;
  oldestCache: number | null;
}

interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  pending: number;
  error?: string;
}

export const dbStorageSync = new DatabaseStorageSync();
export default dbStorageSync;
