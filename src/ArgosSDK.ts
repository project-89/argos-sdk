import { BaseAPIConfig } from "./api/BaseAPI";
import { FingerprintAPI, CreateFingerprintRequest } from "./api/FingerprintAPI";
import { VisitAPI } from "./api/VisitAPI";
import { ApiResponse, FingerprintData } from "./types/api";
import { APIKeyAPI } from "./api/APIKeyAPI";

export interface ArgosSDKConfig extends BaseAPIConfig {
  debug?: boolean;
}

export class ArgosSDK {
  private fingerprintAPI: FingerprintAPI;
  private visitAPI: VisitAPI;
  private apiKeyAPI: APIKeyAPI;
  private debug: boolean;

  constructor(config: ArgosSDKConfig) {
    this.debug = config.debug || false;
    this.fingerprintAPI = new FingerprintAPI(config);
    this.visitAPI = new VisitAPI(config);
    this.apiKeyAPI = new APIKeyAPI(config);

    if (this.debug) {
      console.log("[Argos] Initialized with config:", {
        ...config,
        apiKey: config.apiKey ? "[REDACTED]" : undefined,
      });
    }
  }

  /**
   * Set the API key for subsequent requests
   */
  public setApiKey(apiKey: string) {
    this.fingerprintAPI = new FingerprintAPI({ ...this.getConfig(), apiKey });
    this.visitAPI = new VisitAPI({ ...this.getConfig(), apiKey });
    this.apiKeyAPI = new APIKeyAPI({ ...this.getConfig(), apiKey });
  }

  /**
   * Get the current SDK configuration
   */
  private getConfig(): ArgosSDKConfig {
    return {
      baseUrl: this.fingerprintAPI["baseUrl"],
      apiKey: this.fingerprintAPI["apiKey"],
      debug: this.debug,
    };
  }

  /**
   * Register a new API key for a fingerprint
   */
  public async registerApiKey(
    fingerprintId: string,
    metadata?: Record<string, any>
  ): Promise<ApiResponse<{ key: string; fingerprintId: string }>> {
    return this.apiKeyAPI.registerInitialApiKey(fingerprintId, metadata);
  }

  /**
   * Create an additional API key (requires existing API key)
   */
  public async createApiKey(
    name: string
  ): Promise<ApiResponse<{ key: string }>> {
    return this.apiKeyAPI.createAPIKey({ name });
  }

  /**
   * Check if the client is online
   */
  public isOnline(): boolean {
    return typeof navigator !== "undefined" && navigator.onLine;
  }

  /**
   * Create or get a fingerprint
   */
  public async identify(
    request: CreateFingerprintRequest
  ): Promise<ApiResponse<FingerprintData>> {
    return this.fingerprintAPI.createFingerprint(request);
  }

  /**
   * Get fingerprint by ID
   */
  public async getIdentity(id: string): Promise<ApiResponse<FingerprintData>> {
    return this.fingerprintAPI.getFingerprint(id);
  }

  /**
   * Update fingerprint metadata
   */
  public async updateFingerprint(
    id: string,
    data: { metadata: Record<string, any> }
  ): Promise<ApiResponse<FingerprintData>> {
    return this.fingerprintAPI.updateFingerprint(id, data);
  }

  /**
   * Track an event (visit or presence)
   */
  public async track(
    event: "visit" | "presence",
    data: {
      fingerprintId: string;
      url?: string;
      referrer?: string;
      status?: "online" | "offline";
      timestamp: number;
    }
  ): Promise<ApiResponse<void>> {
    if (event === "visit" && data.url) {
      return this.visitAPI.createVisit({
        fingerprintId: data.fingerprintId,
        url: data.url,
        referrer: data.referrer,
        timestamp: data.timestamp,
      });
    } else if (event === "presence" && data.status) {
      return this.visitAPI.updatePresence({
        fingerprintId: data.fingerprintId,
        status: data.status,
        timestamp: data.timestamp,
      });
    }
    throw new Error(
      `Invalid event type or missing required data for event: ${event}`
    );
  }
}
