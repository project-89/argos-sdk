export interface Storage {
  setItem<T>(key: string, data: T): void;
  getItem<T>(key: string): T | null;
  removeItem(key: string): void;
  clear(): void;
}
