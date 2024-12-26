import { BaseAPIConfig } from './api/BaseAPI';
import { FingerprintAPI } from './api/FingerprintAPI';
import {
  VisitAPI,
  CreateVisitRequest,
  UpdatePresenceRequest,
} from './api/VisitAPI';
import { RoleAPI } from './api/RoleAPI';
import { TagAPI, UpdateTagsRequest } from './api/TagAPI';
import { PriceAPI } from './api/PriceAPI';
import { SystemAPI } from './api/SystemAPI';
import {
  ApiResponse,
  Fingerprint,
  PresenceData,
  VisitData,
  RoleData,
  TagData,
  PriceData,
  PriceHistoryData,
  SystemHealthData,
  GetCurrentPricesOptions,
  GetPriceHistoryOptions,
  GetVisitHistoryOptions,
  CreateAPIKeyRequest,
  RevokeAPIKeyRequest,
  APIKeyData,
  UpdateAPIKeyRequest,
} from './types/api';
import { APIKeyAPI } from './api/APIKeyAPI';
import { CreateFingerprintRequest } from './api/FingerprintAPI';
import { ImpressionAPI } from './api/ImpressionAPI';
import type {
  CreateImpressionRequest,
  GetImpressionsOptions,
  ImpressionData,
  DeleteImpressionsResponse,
} from './types/api';
import { EnvironmentFactory } from './core/factory/EnvironmentFactory';
import {
  EnvironmentInterface,
  StorageInterface,
  RuntimeEnvironment,
} from './core/interfaces/environment';

export interface ArgosSDKConfig extends BaseAPIConfig {
  debug?: boolean;
  presenceInterval?: number;
  environment?: EnvironmentInterface;
  storage?: StorageInterface;
}

export type TrackEventType = 'visit' | 'presence' | 'custom';

export class ArgosSDK {
  protected fingerprintAPI: FingerprintAPI;
  private visitAPI: VisitAPI;
  public apiKeyAPI: APIKeyAPI;
  private roleAPI: RoleAPI;
  private tagAPI: TagAPI;
  private priceAPI: PriceAPI;
  private systemAPI: SystemAPI;
  private impressionAPI: ImpressionAPI;
  private debug: boolean;
  private apiKey?: string;
  private presenceInterval: number;
  private environment: EnvironmentInterface;
  private storage: StorageInterface;
  private runtime: RuntimeEnvironment;
  private baseUrl: string;

  constructor(config: ArgosSDKConfig) {
    this.debug = config.debug || false;
    this.apiKey = config.apiKey;
    this.presenceInterval = config.presenceInterval || 30000; // Default to 30 seconds
    this.baseUrl = config.baseUrl;

    // Initialize environment and storage
    const { environment, storage, runtime } =
      EnvironmentFactory.createEnvironment({
        environment: config.environment,
        storage: config.storage,
        debug: this.debug,
      });

    this.environment = environment;
    this.storage = storage;
    this.runtime = runtime;

    // Restore API key from storage if not provided in config
    if (!this.apiKey) {
      const storedApiKey = this.storage.getItem('api_key');
      if (storedApiKey) {
        this.apiKey = storedApiKey;
        if (this.debug) {
          console.log('[Argos] Restored API key from storage');
        }
      }
    }

    // Initialize APIs
    const apiConfig = this.getConfig();
    this.fingerprintAPI = new FingerprintAPI(apiConfig);
    this.visitAPI = new VisitAPI(apiConfig);
    this.apiKeyAPI = new APIKeyAPI(apiConfig);
    this.roleAPI = new RoleAPI(apiConfig);
    this.tagAPI = new TagAPI(apiConfig);
    this.priceAPI = new PriceAPI(apiConfig);
    this.systemAPI = new SystemAPI(apiConfig);
    this.impressionAPI = new ImpressionAPI(apiConfig);

    if (this.debug) {
      console.log('[Argos] Initialized with config:', {
        ...config,
        apiKey: config.apiKey ? '[REDACTED]' : undefined,
        runtime: this.runtime,
      });
    }
  }

  /**
   * Configuration methods
   */
  public setApiKey(apiKey: string | undefined) {
    this.apiKey = apiKey;
    const config = this.getConfig();
    this.fingerprintAPI = new FingerprintAPI(config);
    this.visitAPI = new VisitAPI(config);
    this.apiKeyAPI = new APIKeyAPI(config);
    this.roleAPI = new RoleAPI(config);
    this.tagAPI = new TagAPI(config);
    this.priceAPI = new PriceAPI(config);
    this.systemAPI = new SystemAPI(config);
    this.impressionAPI = new ImpressionAPI(config);

    // Store API key in storage
    if (apiKey) {
      this.storage.setItem('api_key', apiKey);
    } else {
      this.storage.removeItem('api_key');
    }

    if (this.debug) {
      console.log(
        '[Argos] API key updated:',
        apiKey ? '[REDACTED]' : 'undefined'
      );
    }
  }

  public getPresenceInterval(): number {
    return this.presenceInterval;
  }

  public setPresenceInterval(interval: number): void {
    this.presenceInterval = interval;
    if (this.debug) {
      console.log('[Argos] Presence interval updated:', interval);
    }
  }

  private getConfig(): ArgosSDKConfig {
    return {
      baseUrl: this.baseUrl,
      apiKey: this.apiKey,
      debug: this.debug,
      presenceInterval: this.presenceInterval,
      environment: this.environment,
      storage: this.storage,
    };
  }

  /**
   * Identity management methods
   */
  public async identify(
    request: CreateFingerprintRequest
  ): Promise<ApiResponse<Fingerprint>> {
    try {
      const response = await this.fingerprintAPI.createFingerprint({
        fingerprint: request.fingerprint,
        metadata: {
          ...request.metadata,
          source: request.metadata?.source || 'sdk',
          userAgent:
            request.metadata?.userAgent || this.environment.getUserAgent(),
          language:
            request.metadata?.language || this.environment.getLanguage(),
          platform:
            request.metadata?.platform ||
            (await this.environment.getPlatformInfo()),
        },
      });

      // After successful fingerprint creation, register for API key
      if (response.success && response.data?.id) {
        await this.storage.setItem('fingerprint_id', response.data.id);
        const apiKeyResponse = await this.registerApiKey(response.data.id);
        if (apiKeyResponse.success && apiKeyResponse.data?.key) {
          this.setApiKey(apiKeyResponse.data.key);
        }
      }

      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to identify: ${message}`);
    }
  }

  public async getIdentity(id: string): Promise<ApiResponse<Fingerprint>> {
    return this.fingerprintAPI.getFingerprint(id);
  }

  public async updateFingerprint(
    metadata: Record<string, unknown>
  ): Promise<ApiResponse<Fingerprint>> {
    return this.fingerprintAPI.updateFingerprint(metadata);
  }

  /**
   * Role management methods
   */
  public async listAvailableRoles(): Promise<ApiResponse<string[]>> {
    return this.roleAPI.listAvailableRoles();
  }

  public async addRoles(
    fingerprintId: string,
    roles: string[]
  ): Promise<ApiResponse<RoleData>> {
    return this.roleAPI.addRoles(fingerprintId, roles);
  }

  public async getRoles(fingerprintId: string): Promise<ApiResponse<RoleData>> {
    return this.roleAPI.getRoles(fingerprintId);
  }

  public async removeRoles(
    fingerprintId: string,
    roles: string[]
  ): Promise<ApiResponse<RoleData>> {
    return this.roleAPI.removeRoles(fingerprintId, roles);
  }

  /**
   * Tag management methods
   */
  public async updateTags(
    fingerprintId: string,
    request: UpdateTagsRequest
  ): Promise<ApiResponse<TagData>> {
    return this.tagAPI.updateTags(fingerprintId, request);
  }

  public async getTags(fingerprintId: string): Promise<ApiResponse<TagData>> {
    return this.tagAPI.getTags(fingerprintId);
  }

  public async deleteTags(fingerprintId: string): Promise<void> {
    return this.tagAPI.deleteTags(fingerprintId);
  }

  /**
   * API Key management methods
   */
  public async registerApiKey(
    fingerprintId: string,
    metadata?: Record<string, unknown>
  ): Promise<ApiResponse<APIKeyData>> {
    return this.apiKeyAPI.registerInitialApiKey(fingerprintId, metadata || {});
  }

  public async createApiKey(
    request: CreateAPIKeyRequest
  ): Promise<ApiResponse<APIKeyData>> {
    return this.apiKeyAPI.createAPIKey(request);
  }

  public async validateApiKey(apiKey: string): Promise<ApiResponse<boolean>> {
    return this.apiKeyAPI.validateAPIKey(apiKey);
  }

  public async revokeApiKey(
    request: RevokeAPIKeyRequest
  ): Promise<ApiResponse<void>> {
    return this.apiKeyAPI.revokeAPIKey(request);
  }

  public async getApiKey(id: string): Promise<ApiResponse<APIKeyData>> {
    return this.apiKeyAPI.getAPIKey(id);
  }

  public async listApiKeys(): Promise<ApiResponse<APIKeyData[]>> {
    return this.apiKeyAPI.listAPIKeys();
  }

  public async updateApiKey(
    id: string,
    request: UpdateAPIKeyRequest
  ): Promise<ApiResponse<APIKeyData>> {
    return this.apiKeyAPI.updateAPIKey(id, request);
  }

  public async deleteApiKey(id: string): Promise<ApiResponse<boolean>> {
    return this.apiKeyAPI.deleteAPIKey(id);
  }

  /**
   * Visit tracking methods
   */
  public async track(
    event: 'visit',
    data: Omit<CreateVisitRequest, 'timestamp' | 'type'>
  ): Promise<ApiResponse<VisitData>>;
  public async track(
    event: 'presence',
    data: Omit<UpdatePresenceRequest, 'timestamp'>
  ): Promise<ApiResponse<PresenceData>>;
  public async track(
    event: 'custom',
    data: Omit<CreateVisitRequest, 'timestamp' | 'type'>
  ): Promise<ApiResponse<VisitData>>;
  public async track(
    event: TrackEventType,
    data: Omit<CreateVisitRequest | UpdatePresenceRequest, 'timestamp'>
  ): Promise<ApiResponse<VisitData | PresenceData>> {
    try {
      if (this.debug) {
        console.log('[Argos] Tracking event:', event, data);
      }

      const timestamp = new Date().toISOString();

      switch (event) {
        case 'visit': {
          const visitData = {
            ...data,
            timestamp,
          } as CreateVisitRequest;
          return await this.visitAPI.createVisit(visitData);
        }
        case 'presence': {
          const presenceData = {
            ...data,
            timestamp,
          } as UpdatePresenceRequest;
          return await this.visitAPI.updatePresence(presenceData);
        }
        case 'custom': {
          const customData = {
            ...data,
            type: 'custom',
            timestamp,
          } as CreateVisitRequest;
          return await this.visitAPI.createVisit(customData);
        }
        default:
          throw new Error(`Unknown event type: ${event}`);
      }
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  public async getVisitHistory(
    fingerprintId: string,
    options?: GetVisitHistoryOptions
  ): Promise<ApiResponse<{ visits: VisitData[] }>> {
    return this.visitAPI.getVisitHistory(fingerprintId, options);
  }

  /**
   * Price data methods
   */
  public async getCurrentPrices(
    options?: GetCurrentPricesOptions
  ): Promise<ApiResponse<PriceData>> {
    return this.priceAPI.getCurrentPrices(options);
  }

  public async getPriceHistory(
    tokenId: string,
    options?: GetPriceHistoryOptions
  ): Promise<ApiResponse<PriceHistoryData>> {
    return this.priceAPI.getPriceHistory(tokenId, options);
  }

  /**
   * System methods
   */
  public async checkHealth(): Promise<ApiResponse<SystemHealthData>> {
    return this.systemAPI.checkHealth();
  }

  /**
   * Check if the client is online
   */
  public isOnline(): boolean {
    return this.environment.isOnline();
  }

  private handleError(error: unknown): void {
    if (this.debug) {
      console.error('[Argos] Error:', error);
    }
  }

  // Impression Methods
  public async createImpression(
    request: CreateImpressionRequest
  ): Promise<ApiResponse<ImpressionData>> {
    return this.impressionAPI.createImpression(request);
  }

  public async getImpressions(
    fingerprintId: string,
    options?: GetImpressionsOptions
  ): Promise<ApiResponse<ImpressionData[]>> {
    return this.impressionAPI.getImpressions(fingerprintId, options);
  }

  public async deleteImpressions(
    fingerprintId: string,
    options?: GetImpressionsOptions
  ): Promise<ApiResponse<DeleteImpressionsResponse>> {
    return this.impressionAPI.deleteImpressions(fingerprintId, options);
  }
}
