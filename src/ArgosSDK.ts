import { CacheService, CacheConfig } from "./services/CacheService";
import { QueueService, QueueConfig } from "./services/QueueService";
import { EventService } from "./services/EventService";
import { LogService, LogLevel, LogConfig } from "./services/LogService";
import { BaseAPI, BaseAPIConfig } from "./api/BaseAPI";
import { FingerprintAPI } from "./api/FingerprintAPI";
import { VisitAPI } from "./api/VisitAPI";
import { RoleAPI } from "./api/RoleAPI";
import { TagAPI } from "./api/TagAPI";
import { PriceAPI } from "./api/PriceAPI";
import { RealityStabilityAPI } from "./api/RealityStabilityAPI";
import { APIKeyAPI } from "./api/APIKeyAPI";
import { DebugAPI } from "./api/DebugAPI";

export interface ArgosSDKConfig extends BaseAPIConfig {
  cache?: CacheConfig;
  queue?: QueueConfig;
  log?: LogConfig;
}

export class ArgosSDK {
  private readonly baseUrl: string;
  private readonly apiKeyString: string;

  // Services
  public readonly cache: CacheService;
  public readonly queue: QueueService;
  public readonly events: EventService;
  public readonly log: LogService;

  // APIs
  public readonly fingerprint: FingerprintAPI;
  public readonly visit: VisitAPI;
  public readonly role: RoleAPI;
  public readonly tag: TagAPI;
  public readonly price: PriceAPI;
  public readonly realityStability: RealityStabilityAPI;
  public readonly apiKeys: APIKeyAPI;
  public readonly debug: DebugAPI;

  constructor(config: ArgosSDKConfig) {
    try {
      this.baseUrl = config.baseUrl;
      this.apiKeyString = config.apiKey;

      // Initialize services
      this.cache = new CacheService(config.cache || { ttl: 5 * 60 * 1000 }); // 5 minutes default TTL
      this.queue = new QueueService(
        config.queue || { maxRetries: 3, retryDelay: 1000 }
      );
      this.events = new EventService();
      this.log = new LogService(config.log || { minLevel: LogLevel.INFO });

      // Initialize base API configuration
      const apiConfig: BaseAPIConfig = {
        baseUrl: this.baseUrl,
        apiKey: this.apiKeyString,
      };

      // Initialize API instances
      this.fingerprint = new FingerprintAPI(apiConfig);
      this.visit = new VisitAPI(apiConfig);
      this.role = new RoleAPI(apiConfig);
      this.tag = new TagAPI(apiConfig);
      this.price = new PriceAPI(apiConfig);
      this.realityStability = new RealityStabilityAPI(apiConfig);
      this.apiKeys = new APIKeyAPI(apiConfig);
      this.debug = new DebugAPI(apiConfig);

      // Initialize base API with configuration
      BaseAPI.initialize(apiConfig);

      this.setupEventListeners();
      this.log.info(
        "ArgosSDK initialized successfully",
        { baseUrl: this.baseUrl },
        "SDK"
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown error during initialization";
      throw new Error(`Failed to initialize ArgosSDK: ${errorMessage}`);
    }
  }

  private setupEventListeners(): void {
    // Log API errors
    this.events.subscribe("api:error", (error: Error) => {
      this.log.error("API Error", error, "API");
    });

    // Log offline mode changes
    this.events.subscribe("network:offline", () => {
      this.log.warn(
        "Network is offline. Requests will be queued.",
        null,
        "Network"
      );
    });

    this.events.subscribe("network:online", () => {
      this.log.info(
        "Network is back online. Processing queued requests...",
        null,
        "Network"
      );
    });

    // Log cache hits/misses
    this.events.subscribe(
      "cache:hit",
      (data: { key: string; value: unknown }) => {
        this.log.debug("Cache hit", data, "Cache");
      }
    );

    this.events.subscribe("cache:miss", (data: { key: string }) => {
      this.log.debug("Cache miss", data, "Cache");
    });

    // Log queued requests
    this.events.subscribe(
      "request:queued",
      (data: { endpoint: string; method: string; body?: unknown }) => {
        this.log.info("Request queued for offline processing", data, "Queue");
      }
    );
  }

  // Public methods for SDK state
  isOnline(): boolean {
    return typeof navigator !== "undefined" ? navigator.onLine : true;
  }

  getQueueSize(): number {
    return this.queue.getQueueSize();
  }

  clearCache(): void {
    this.cache.clear();
    this.events.emit("cache:cleared");
  }

  getDebugInfo(): Record<string, any> {
    return {
      online: this.isOnline(),
      queueSize: this.getQueueSize(),
      eventListeners: {
        error: this.events.listenerCount("api:error"),
        network:
          this.events.listenerCount("network:offline") +
          this.events.listenerCount("network:online"),
        cache:
          this.events.listenerCount("cache:hit") +
          this.events.listenerCount("cache:miss"),
      },
      logs: this.log.getLogs(),
      apis: {
        fingerprint: !!this.fingerprint,
        visit: !!this.visit,
        role: !!this.role,
        tag: !!this.tag,
        price: !!this.price,
        realityStability: !!this.realityStability,
        apiKeys: !!this.apiKeys,
        debug: !!this.debug,
      },
    };
  }

  destroy(): void {
    try {
      this.events.removeAllListeners();
      this.queue.destroy();
      this.log.clearLogs();
      this.cache.clear();
      this.log.info("ArgosSDK destroyed successfully", null, "SDK");
    } catch (error) {
      this.log.error("Error during SDK destruction", error, "SDK");
    }
  }
}
