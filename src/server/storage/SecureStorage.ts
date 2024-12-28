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
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-cbc', this.encryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  private decrypt(text: string): string {
    try {
      const [ivHex, encryptedText] = text.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const decipher = createDecipheriv('aes-256-cbc', this.encryptionKey, iv);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
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
        console.error('Failed to load secure storage:', error);
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
      console.error('Failed to save secure storage:', error);
    }
  }

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

  clear(): void {
    this.data.clear();
    if (existsSync(this.storagePath)) {
      unlinkSync(this.storagePath);
    }
  }
}
