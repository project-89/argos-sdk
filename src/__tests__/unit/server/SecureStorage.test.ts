/**
 * @jest-environment node
 */

// Only mock the filesystem operations
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  readFileSync: jest.fn().mockReturnValue(''),
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

// Import dependencies
import { SecureStorage } from '../../../server/storage/SecureStorage';
import fs from 'fs';
import { dirname } from 'path';

describe('SecureStorage', () => {
  let storage: SecureStorage;
  const testStoragePath = '/test/storage/storage.enc';
  const testEncryptionKey = '30313233343536373839616263646566'; // 32 bytes hex

  beforeEach(() => {
    jest.clearAllMocks();
    storage = new SecureStorage({
      encryptionKey: testEncryptionKey,
      storagePath: testStoragePath,
    });
  });

  describe('initialization', () => {
    it('should create storage directory if it does not exist', () => {
      (fs.existsSync as jest.Mock).mockReturnValueOnce(false);
      new SecureStorage({
        encryptionKey: testEncryptionKey,
        storagePath: testStoragePath,
      });
      expect(fs.mkdirSync).toHaveBeenCalledWith(dirname(testStoragePath), {
        recursive: true,
      });
    });

    it('should throw error if encryption key is not provided', () => {
      expect(
        () =>
          new SecureStorage({
            encryptionKey: '',
            storagePath: testStoragePath,
          })
      ).toThrow('Encryption key is required');
    });
  });

  describe('setItem/getItem', () => {
    it('should encrypt and decrypt values correctly', () => {
      const testKey = 'testKey';
      const testValue = 'testValue';

      storage.setItem(testKey, testValue);
      const value = storage.getItem(testKey);

      expect(value).toBe(testValue);
    });

    it('should use correct storage path', () => {
      storage.setItem('test', 'value');
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        testStoragePath,
        expect.any(String)
      );
    });

    it('should return null for non-existent key', () => {
      expect(storage.getItem('nonexistent')).toBeNull();
    });
  });

  describe('removeItem', () => {
    it('should remove item and save changes', () => {
      storage.setItem('test', 'value');
      storage.removeItem('test');
      expect(storage.getItem('test')).toBeNull();
    });
  });

  describe('clear', () => {
    it('should clear all items', () => {
      storage.setItem('test1', 'value1');
      storage.setItem('test2', 'value2');
      storage.clear();
      expect(storage.getItem('test1')).toBeNull();
      expect(storage.getItem('test2')).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should handle file read errors gracefully', () => {
      (fs.readFileSync as jest.Mock).mockImplementationOnce(() => {
        throw new Error('File read failed');
      });
      expect(storage.getItem('test')).toBeNull();
    });

    it('should handle file write errors gracefully', () => {
      (fs.writeFileSync as jest.Mock).mockImplementationOnce(() => {
        throw new Error('File write failed');
      });
      expect(() => storage.setItem('test', 'value')).not.toThrow();
    });
  });
});
