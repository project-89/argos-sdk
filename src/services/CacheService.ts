export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  storage?: Storage; // Optional storage mechanism (defaults to localStorage)
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class CacheService {
  private storage: Storage;
  private ttl: number;
  private prefix = "argos_cache_";

  constructor(config: CacheConfig) {
    this.ttl = config.ttl;
    this.storage =
      config.storage ||
      (typeof localStorage !== "undefined"
        ? localStorage
        : new MemoryStorage());
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = this.storage.getItem(this.prefix + key);
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);
      if (Date.now() - entry.timestamp > this.ttl) {
        this.storage.removeItem(this.prefix + key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  async set<T>(key: string, data: T): Promise<void> {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
      };
      this.storage.setItem(this.prefix + key, JSON.stringify(entry));
    } catch (error) {
      console.error("Cache set error:", error);
    }
  }

  clear(prefix?: string): void {
    try {
      if (prefix) {
        const fullPrefix = this.prefix + prefix;
        for (let i = 0; i < this.storage.length; i++) {
          const key = this.storage.key(i);
          if (key?.startsWith(fullPrefix)) {
            this.storage.removeItem(key);
          }
        }
      } else {
        for (let i = 0; i < this.storage.length; i++) {
          const key = this.storage.key(i);
          if (key?.startsWith(this.prefix)) {
            this.storage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.error("Cache clear error:", error);
    }
  }
}

// Fallback memory storage for environments without localStorage
class MemoryStorage implements Storage {
  private data: Map<string, string> = new Map();

  get length(): number {
    return this.data.size;
  }

  clear(): void {
    this.data.clear();
  }

  getItem(key: string): string | null {
    return this.data.get(key) || null;
  }

  key(index: number): string | null {
    return Array.from(this.data.keys())[index] || null;
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
}
