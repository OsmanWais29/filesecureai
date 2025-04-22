
// Document caching service using IndexedDB
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface DocumentCacheDB extends DBSchema {
  'document-cache': {
    key: string;
    value: {
      url: string;
      data: ArrayBuffer;
      timestamp: number;
      fileType: string;
    };
  };
}

class DocumentCacheService {
  private dbPromise: Promise<IDBPDatabase<DocumentCacheDB>>;
  private readonly DB_NAME = 'document-viewer-cache';
  private readonly STORE_NAME = 'document-cache';
  private readonly VERSION = 1;
  private readonly MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
  private readonly MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB limit

  constructor() {
    this.dbPromise = this.initDB();
  }

  private async initDB() {
    return openDB<DocumentCacheDB>(this.DB_NAME, this.VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('document-cache')) {
          db.createObjectStore('document-cache');
        }
      },
    });
  }

  async cacheDocument(url: string, data: ArrayBuffer, fileType: string): Promise<void> {
    try {
      const db = await this.dbPromise;
      await this.ensureCacheSize();

      await db.put(this.STORE_NAME, {
        url,
        data,
        timestamp: Date.now(),
        fileType
      }, url);

      console.log(`Document cached: ${url}`);
    } catch (error) {
      console.error('Failed to cache document:', error);
    }
  }

  async getDocument(url: string): Promise<ArrayBuffer | null> {
    try {
      const db = await this.dbPromise;
      const cachedDoc = await db.get(this.STORE_NAME, url);

      if (!cachedDoc) {
        return null;
      }

      // Check if document is too old
      if (Date.now() - cachedDoc.timestamp > this.MAX_AGE_MS) {
        await this.removeDocument(url);
        return null;
      }

      console.log(`Document loaded from cache: ${url}`);
      return cachedDoc.data;
    } catch (error) {
      console.error('Failed to get document from cache:', error);
      return null;
    }
  }

  async removeDocument(url: string): Promise<void> {
    try {
      const db = await this.dbPromise;
      await db.delete(this.STORE_NAME, url);
    } catch (error) {
      console.error('Failed to remove document from cache:', error);
    }
  }

  async clearCache(): Promise<void> {
    try {
      const db = await this.dbPromise;
      await db.clear(this.STORE_NAME);
      console.log('Document cache cleared');
    } catch (error) {
      console.error('Failed to clear document cache:', error);
    }
  }

  private async ensureCacheSize(): Promise<void> {
    try {
      const db = await this.dbPromise;
      const allCached = await db.getAll(this.STORE_NAME);

      let totalSize = allCached.reduce((size, doc) => size + doc.data.byteLength, 0);

      if (totalSize > this.MAX_CACHE_SIZE) {
        // Sort by timestamp (oldest first)
        allCached.sort((a, b) => a.timestamp - b.timestamp);

        // Remove oldest items until under limit
        for (const doc of allCached) {
          if (totalSize <= this.MAX_CACHE_SIZE * 0.8) { // Clear to 80% of max
            break;
          }
          await this.removeDocument(doc.url);
          totalSize -= doc.data.byteLength;
        }
      }
    } catch (error) {
      console.error('Failed to manage cache size:', error);
    }
  }
}

export const documentCache = new DocumentCacheService();

