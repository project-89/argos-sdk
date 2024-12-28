/**
 * @jest-environment jsdom
 */

import { CookieStorage } from '../../../client/storage/CookieStorage';
import Cookies from 'js-cookie';

describe('CookieStorage', () => {
  let storage: CookieStorage;

  beforeEach(() => {
    // Clear all cookies
    Object.keys(Cookies.get()).forEach((key) => {
      Cookies.remove(key);
    });

    storage = new CookieStorage({
      secure: false,
      sameSite: 'strict',
    });
  });

  it('should store and retrieve a value', () => {
    const key = 'testKey';
    const value = 'testValue';

    storage.setItem(key, value);
    console.log('All cookies after set:', Cookies.get());

    const retrieved = storage.getItem(key);
    console.log('Retrieved value:', retrieved);

    expect(retrieved).toBe(value);
  });

  describe('edge cases', () => {
    it('should handle empty string values', () => {
      // Test js-cookie directly first
      Cookies.set('direct_test', '');
      console.log('Direct cookie value:', Cookies.get('direct_test'));

      // Then test through CookieStorage
      storage.setItem('test', '');
      console.log('All cookies after empty set:', Cookies.get());
      const value = storage.getItem('test');
      console.log('Retrieved empty value:', value);
      expect(value).toBe('');
    });

    it('should handle special characters in keys', () => {
      const key = 'test@#$%^&*';
      const value = 'value';
      storage.setItem(key, value);
      expect(storage.getItem(key)).toBe(value);
    });

    it('should handle special characters in values', () => {
      const key = 'test';
      const value = 'value@#$%^&*';
      storage.setItem(key, value);
      expect(storage.getItem(key)).toBe(value);
    });

    it('should handle very long values', () => {
      const key = 'test';
      const value = 'x'.repeat(1000);
      storage.setItem(key, value);
      expect(storage.getItem(key)).toBe(value);
    });

    it('should handle JSON stringified values', () => {
      const key = 'test';
      const value = JSON.stringify({ test: 'value' });
      storage.setItem(key, value);
      expect(storage.getItem(key)).toBe(value);
    });
  });

  it('should return null for non-existent key', () => {
    expect(storage.getItem('nonexistent')).toBeNull();
  });

  it('should remove stored value', () => {
    const key = 'testKey';
    const value = 'testValue';

    storage.setItem(key, value);
    expect(storage.getItem(key)).toBe(value);

    storage.removeItem(key);
    expect(storage.getItem(key)).toBeNull();
  });

  it('should clear all stored values', () => {
    storage.setItem('key1', 'value1');
    storage.setItem('key2', 'value2');

    storage.clear();

    expect(storage.getItem('key1')).toBeNull();
    expect(storage.getItem('key2')).toBeNull();
  });

  it('should not affect non-prefixed cookies', () => {
    // Set a cookie without the prefix
    Cookies.set('other_cookie', 'value');

    storage.setItem('key1', 'value1');
    storage.clear();

    // Our prefixed cookie should be gone but the other should remain
    expect(storage.getItem('key1')).toBeNull();
    expect(Cookies.get('other_cookie')).toBe('value');
  });
});
