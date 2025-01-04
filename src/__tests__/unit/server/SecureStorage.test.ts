/**
 * @jest-environment node
 */

import { jest } from '@jest/globals';
import { SecureStorage } from '../../../server/storage/SecureStorage';
import * as fs from 'fs';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn(),
}));

describe('SecureStorage', () => {
  let storage: SecureStorage;
  const testStoragePath = '/test/storage/storage.enc';
  const testEncryptionKey = 'test-key-32-chars-secure-storage-ok';

  beforeEach(() => {
    jest.clearAllMocks();
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    (fs.mkdirSync as jest.Mock).mockReturnValue(undefined);
    (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);
    storage = new SecureStorage({
      encryptionKey: testEncryptionKey,
      storagePath: testStoragePath,
    });
  });

  describe('initialization', () => {
    it('should create storage with encryption key', () => {
      expect(storage).toBeDefined();
    });

    it('should throw error when encryption key is missing', () => {
      expect(() => new SecureStorage({})).toThrow('Encryption key is required');
    });
  });

  describe('data operations', () => {
    it('should set and get items', async () => {
      await storage.set('test-key', 'test-value');
      const value = await storage.get('test-key');
      expect(value).toBe('test-value');
    });

    it('should remove items', async () => {
      await storage.set('test-key', 'test-value');
      await storage.remove('test-key');
      const value = await storage.get('test-key');
      expect(value).toBeNull();
    });

    it('should clear all items', async () => {
      await storage.set('key1', 'value1');
      await storage.set('key2', 'value2');
      await storage.clear();
      expect(await storage.get('key1')).toBeNull();
      expect(await storage.get('key2')).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should handle file read errors', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('File read failed');
      });

      expect(
        () =>
          new SecureStorage({
            encryptionKey: testEncryptionKey,
            storagePath: testStoragePath,
          })
      ).toThrow(/Failed to load secure storage/);
    });

    it('should handle file write errors', async () => {
      (fs.writeFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('File write failed');
      });

      await expect(storage.set('test', 'value')).rejects.toThrow(
        /Failed to save secure storage/
      );
    });
  });
});
