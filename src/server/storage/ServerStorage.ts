import { StorageInterface } from '../../core/interfaces/environment';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

interface PersistenceConfig {
  enabled: boolean;
  directory: string;
  filename: string;
}

export class ServerStorage implements StorageInterface {
  private storage: Map<string, string>;
  private readonly prefix: string;
  private debug: boolean;
  private persistence?: PersistenceConfig;

  constructor(
    config: {
      prefix?: string;
      debug?: boolean;
      persistence?: PersistenceConfig;
    } = {}
  ) {
    this.prefix = config.prefix || 'argos_';
    this.debug = config.debug || false;
    this.persistence = config.persistence;
    this.storage = new Map<string, string>();

    if (this.persistence?.enabled) {
      this.loadFromDisk();
    }
  }

  private getFullKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  private loadFromDisk(): void {
    if (!this.persistence?.enabled) return;

    try {
      const { directory, filename } = this.persistence;
      const filePath = join(directory, filename);

      if (!existsSync(directory)) {
        mkdirSync(directory, { recursive: true });
      }

      if (existsSync(filePath)) {
        const data = readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(data);
        this.storage = new Map(Object.entries(parsed));

        if (this.debug) {
          console.log('[Argos] Loaded storage from disk:', {
            path: filePath,
            items: this.storage.size,
          });
        }
      }
    } catch (error) {
      if (this.debug) {
        console.error('[Argos] Failed to load storage from disk:', error);
      }
    }
  }

  private saveToDisk(): void {
    if (!this.persistence?.enabled) return;

    try {
      const { directory, filename } = this.persistence;
      const filePath = join(directory, filename);

      if (!existsSync(directory)) {
        mkdirSync(directory, { recursive: true });
      }

      const data = Object.fromEntries(this.storage.entries());
      writeFileSync(filePath, JSON.stringify(data, null, 2));

      if (this.debug) {
        console.log('[Argos] Saved storage to disk:', {
          path: filePath,
          items: this.storage.size,
        });
      }
    } catch (error) {
      if (this.debug) {
        console.error('[Argos] Failed to save storage to disk:', error);
      }
    }
  }

  getItem(key: string): string | null {
    const fullKey = this.getFullKey(key);
    const value = this.storage.get(fullKey) || null;

    if (this.debug) {
      console.log('[Argos] Getting storage item:', {
        key: fullKey,
        hasValue: !!value,
      });
    }

    return value;
  }

  setItem(key: string, value: string): void {
    const fullKey = this.getFullKey(key);

    if (this.debug) {
      console.log('[Argos] Setting storage item:', {
        key: fullKey,
        hasValue: !!value,
      });
    }

    this.storage.set(fullKey, value);

    if (this.persistence?.enabled) {
      this.saveToDisk();
    }
  }

  removeItem(key: string): void {
    const fullKey = this.getFullKey(key);

    if (this.debug) {
      console.log('[Argos] Removing storage item:', { key: fullKey });
    }

    this.storage.delete(fullKey);

    if (this.persistence?.enabled) {
      this.saveToDisk();
    }
  }

  clear(): void {
    if (this.debug) {
      console.log('[Argos] Clearing all storage items');
    }

    this.storage.clear();

    if (this.persistence?.enabled) {
      this.saveToDisk();
    }
  }
}
