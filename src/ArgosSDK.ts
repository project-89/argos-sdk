import { BaseAPIConfig } from './api/BaseAPI';
import { FingerprintAPI, CreateFingerprintRequest } from './api/FingerprintAPI';
import { VisitAPI } from './api/VisitAPI';
import {
  ApiResponse,
  FingerprintData,
  PresenceData,
  VisitData,
} from './types/api';
import { APIKeyAPI } from './api/APIKeyAPI';

export interface ArgosSDKConfig extends BaseAPIConfig {
  debug?: boolean;
}

export class ArgosSDK {
  private fingerprintAPI: FingerprintAPI;
  private visitAPI: VisitAPI;
  private apiKeyAPI: APIKeyAPI;
  private debug: boolean;
  private apiKey?: string;

  constructor(config: ArgosSDKConfig) {
    this.debug = config.debug || false;
    this.apiKey = config.apiKey;
    this.fingerprintAPI = new FingerprintAPI(config);
    this.visitAPI = new VisitAPI(config);
    this.apiKeyAPI = new APIKeyAPI(config);

    if (this.debug) {
      console.log('[Argos] Initialized with config:', {
        ...config,
        apiKey: config.apiKey ? '[REDACTED]' : undefined,
      });
    }
  }

  /**
   * Set the API key for subsequent requests
   */
  public setApiKey(apiKey: string | undefined) {
    this.apiKey = apiKey;
    const config = this.getConfig();
    this.fingerprintAPI = new FingerprintAPI(config);
    this.visitAPI = new VisitAPI(config);
    this.apiKeyAPI = new APIKeyAPI(config);

    if (this.debug) {
      console.log(
        '[Argos] API key updated:',
        apiKey ? '[REDACTED]' : 'undefined'
      );
    }
  }

  /**
   * Get the current API key
   */
  public getApiKey(): string | undefined {
    return this.apiKey;
  }

  /**
   * Get the current SDK configuration
   */
  private getConfig(): ArgosSDKConfig {
    return {
      baseUrl: this.fingerprintAPI['baseUrl'],
      apiKey: this.apiKey,
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
   * Validate an API key
   */
  public async validateAPIKey(apiKey: string): Promise<ApiResponse<boolean>> {
    return this.apiKeyAPI.validateAPIKey(apiKey);
  }

  /**
   * Check if the client is online
   */
  public isOnline(): boolean {
    return typeof navigator !== 'undefined' && navigator.onLine;
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

  private handleError(error: unknown): void {
    if (this.debug) {
      console.error('[Argos] Error:', error);
    }
  }

  /**
   * Track an event (visit or presence)
   */
  public async track(
    event: 'visit',
    data: VisitData
  ): Promise<ApiResponse<void>>;
  public async track(
    event: 'presence',
    data: PresenceData
  ): Promise<ApiResponse<void>>;
  public async track(
    event: string,
    data: VisitData | PresenceData
  ): Promise<ApiResponse<void>> {
    try {
      if (this.debug) {
        console.log('[Argos] Tracking event:', event, data);
      }

      let response: ApiResponse<void>;

      if (event === 'visit') {
        response = await this.visitAPI.createVisit(data as VisitData);
      } else if (event === 'presence') {
        response = await this.visitAPI.updatePresence(data as PresenceData);
      } else {
        throw new Error(`Unknown event type: ${event}`);
      }

      if (this.debug) {
        console.log('[Argos] Track response:', response);
      }
      return response;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
}
