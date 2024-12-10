export class CacheService {
    constructor(config) {
        this.prefix = "argos_cache_";
        this.ttl = config.ttl;
        this.storage =
            config.storage ||
                (typeof localStorage !== "undefined"
                    ? localStorage
                    : new MemoryStorage());
    }
    async get(key) {
        try {
            const cached = this.storage.getItem(this.prefix + key);
            if (!cached)
                return null;
            const entry = JSON.parse(cached);
            if (Date.now() - entry.timestamp > this.ttl) {
                this.storage.removeItem(this.prefix + key);
                return null;
            }
            return entry.data;
        }
        catch (error) {
            console.error("Cache get error:", error);
            return null;
        }
    }
    async set(key, data) {
        try {
            const entry = {
                data,
                timestamp: Date.now(),
            };
            this.storage.setItem(this.prefix + key, JSON.stringify(entry));
        }
        catch (error) {
            console.error("Cache set error:", error);
        }
    }
    clear(prefix) {
        try {
            if (prefix) {
                const fullPrefix = this.prefix + prefix;
                for (let i = 0; i < this.storage.length; i++) {
                    const key = this.storage.key(i);
                    if (key?.startsWith(fullPrefix)) {
                        this.storage.removeItem(key);
                    }
                }
            }
            else {
                for (let i = 0; i < this.storage.length; i++) {
                    const key = this.storage.key(i);
                    if (key?.startsWith(this.prefix)) {
                        this.storage.removeItem(key);
                    }
                }
            }
        }
        catch (error) {
            console.error("Cache clear error:", error);
        }
    }
}
// Fallback memory storage for environments without localStorage
class MemoryStorage {
    constructor() {
        this.data = new Map();
    }
    get length() {
        return this.data.size;
    }
    clear() {
        this.data.clear();
    }
    getItem(key) {
        return this.data.get(key) || null;
    }
    key(index) {
        return Array.from(this.data.keys())[index] || null;
    }
    removeItem(key) {
        this.data.delete(key);
    }
    setItem(key, value) {
        this.data.set(key, value);
    }
}
