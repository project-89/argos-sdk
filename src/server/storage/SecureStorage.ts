import { StorageInterface } from '../../shared/interfaces/environment';
import {
  createHash,
  randomBytes,
  createCipheriv,
  createDecipheriv,
} from 'crypto';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { mkdirSync } from 'fs';

export interface SecureStorageOptions {
  encryptionKey?: string;
  storagePath?: string;
}

export class SecureStorage implements StorageInterface {
  private encryptionKey: Buffer;
  private storagePath: string;
  private data: Map<string, string>;

  constructor(options: SecureStorageOptions = {}) {
    if (!options.encryptionKey) {
      throw new Error('Encryption key is required');
    }

    // Create a 32-byte key using SHA-256
    this.encryptionKey = createHash('sha256')
      .update(options.encryptionKey)
      .digest();

    this.storagePath =
      options.storagePath || join(process.cwd(), '.secure-storage');
    this.data = new Map();

    // Create storage directory if it doesn't exist
    const storageDir = dirname(this.storagePath);
    if (!existsSync(storageDir)) {
      mkdirSync(storageDir, { recursive: true });
    }

    this.loadFromDisk();
  }

  private encrypt(text: string): string {
    const iv = randomBytes(12); // GCM requires 12 bytes
    const cipher = createCipheriv('aes-256-gcm', this.encryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  private decrypt(text: string): string {
    try {
      const [ivHex, authTagHex, encryptedText] = text.split(':');
      if (!ivHex || !authTagHex || !encryptedText) {
        throw new Error('Invalid encrypted data format');
      }

      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const decipher = createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
      decipher.setAuthTag(authTag);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      if (error instanceof Error) {
        // Only log the error type and message, not the stack trace
        console.error('Decryption error:', error.name, error.message);
      }
      return '';
    }
  }

  private loadFromDisk(): void {
    if (existsSync(this.storagePath)) {
      try {
        const fileContent = readFileSync(this.storagePath, 'utf8');
        const decrypted = this.decrypt(fileContent);
        if (decrypted) {
          const parsed = JSON.parse(decrypted);
          this.data = new Map(Object.entries(parsed));
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error('Storage load error:', error.name, error.message);
        }
        this.data = new Map();
      }
    }
  }

  private saveToDisk(): void {
    try {
      const data = Object.fromEntries(this.data);
      const encrypted = this.encrypt(JSON.stringify(data));
      mkdirSync(dirname(this.storagePath), { recursive: true });
      writeFileSync(this.storagePath, encrypted);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Storage save error:', error.name, error.message);
      }
    }
  }

  // Implement StorageInterface methods
  async get(key: string): Promise<string | null> {
    return this.getItem(key);
  }

  async set(key: string, value: string): Promise<void> {
    this.setItem(key, value);
  }

  async remove(key: string): Promise<void> {
    this.removeItem(key);
  }

  async clear(): Promise<void> {
    this.data.clear();
    if (existsSync(this.storagePath)) {
      unlinkSync(this.storagePath);
    }
  }

  // Legacy methods for backward compatibility
  setItem(key: string, value: string): void {
    this.data.set(key, value);
    this.saveToDisk();
  }

  getItem(key: string): string | null {
    return this.data.get(key) || null;
  }

  removeItem(key: string): void {
    this.data.delete(key);
    this.saveToDisk();
  }
}
