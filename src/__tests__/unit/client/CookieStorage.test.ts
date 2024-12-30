/**
 * @jest-environment jsdom
 */

import { CookieStorage } from '../../../client/storage/CookieStorage';
import Cookies from 'js-cookie';

// Mock js-cookie
jest.mock('js-cookie', () => ({
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
}));

describe('CookieStorage', () => {
  let storage: CookieStorage;
  let mockCookies: { [key: string]: string } = {};

  beforeEach(() => {
    // Reset mock cookies
    mockCookies = {};

    // Mock js-cookie implementation
    (Cookies.get as jest.Mock).mockImplementation((key?: string) =>
      key ? mockCookies[key] : mockCookies
    );
    (Cookies.set as jest.Mock).mockImplementation(
      (key: string, value: string) => {
        mockCookies[key] = value;
      }
    );
    (Cookies.remove as jest.Mock).mockImplementation((key: string) => {
      delete mockCookies[key];
    });

    storage = new CookieStorage({
      secure: false,
      sameSite: 'lax',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should store and retrieve a value', async () => {
    const key = 'testKey';
    const value = 'testValue';

    await storage.set(key, value);
    const retrieved = await storage.get(key);

    expect(Cookies.set).toHaveBeenCalledWith(
      'argos_testKey',
      'testValue',
      expect.any(Object)
    );
    expect(retrieved).toBe(value);
  });

  describe('edge cases', () => {
    it('should handle empty string values', async () => {
      await storage.set('test', '');
      const value = await storage.get('test');
      expect(value).toBe('');
      expect(Cookies.set).toHaveBeenCalledWith(
        'argos_test',
        '',
        expect.any(Object)
      );
    });

    it('should handle special characters in keys', async () => {
      const key = 'test@#$%^&*';
      const value = 'value';
      await storage.set(key, value);
      expect(await storage.get(key)).toBe(value);
      expect(Cookies.set).toHaveBeenCalledWith(
        `argos_${key}`,
        value,
        expect.any(Object)
      );
    });

    it('should handle special characters in values', async () => {
      const key = 'test';
      const value = 'value@#$%^&*';
      await storage.set(key, value);
      expect(await storage.get(key)).toBe(value);
      expect(Cookies.set).toHaveBeenCalledWith(
        'argos_test',
        value,
        expect.any(Object)
      );
    });

    it('should handle very long values', async () => {
      const key = 'test';
      const value = 'x'.repeat(1000);
      await storage.set(key, value);
      expect(await storage.get(key)).toBe(value);
      expect(Cookies.set).toHaveBeenCalledWith(
        'argos_test',
        value,
        expect.any(Object)
      );
    });

    it('should handle JSON stringified values', async () => {
      const key = 'test';
      const value = JSON.stringify({ test: 'value' });
      await storage.set(key, value);
      expect(await storage.get(key)).toBe(value);
      expect(Cookies.set).toHaveBeenCalledWith(
        'argos_test',
        value,
        expect.any(Object)
      );
    });
  });

  it('should return null for non-existent key', async () => {
    expect(await storage.get('nonexistent')).toBeNull();
    expect(Cookies.get).toHaveBeenCalledWith('argos_nonexistent');
  });

  it('should remove stored value', async () => {
    const key = 'testKey';
    const value = 'testValue';

    await storage.set(key, value);
    expect(await storage.get(key)).toBe(value);

    await storage.remove(key);
    expect(await storage.get(key)).toBeNull();
    expect(Cookies.remove).toHaveBeenCalledWith(
      'argos_testKey',
      expect.any(Object)
    );
  });

  it('should clear all stored values', async () => {
    await storage.set('key1', 'value1');
    await storage.set('key2', 'value2');

    mockCookies['other_cookie'] = 'value';

    await storage.clear();

    expect(await storage.get('key1')).toBeNull();
    expect(await storage.get('key2')).toBeNull();
    expect(mockCookies['other_cookie']).toBe('value');
  });

  it('should not affect non-prefixed cookies', async () => {
    mockCookies['other_cookie'] = 'value';

    await storage.set('key1', 'value1');
    await storage.clear();

    expect(await storage.get('key1')).toBeNull();
    expect(mockCookies['other_cookie']).toBe('value');
  });
});
