import { BaseAPI, BaseAPIConfig } from '../../api/BaseAPI';
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
  CreateImpressionRequest,
  GetImpressionsOptions,
  ImpressionData,
  DeleteImpressionsResponse,
} from '../../types/api';
import {
  FingerprintAPI,
  CreateFingerprintRequest,
} from '../../api/FingerprintAPI';
import {
  VisitAPI,
  CreateVisitRequest,
  UpdatePresenceRequest,
} from '../../api/VisitAPI';
import { RoleAPI } from '../../api/RoleAPI';
import { TagAPI, UpdateTagsRequest } from '../../api/TagAPI';
import { PriceAPI } from '../../api/PriceAPI';
import { SystemAPI } from '../../api/SystemAPI';
import { APIKeyAPI } from '../../api/APIKeyAPI';
import { ImpressionAPI } from '../../api/ImpressionAPI';

export type TrackEventType = 'visit' | 'presence' | 'custom';

export interface ServerSDKConfig extends BaseAPIConfig {
  apiKey: string;
  defaultFingerprint?: string;
  debug?: boolean;
}

export class ArgosServerSDK {
  private config: ServerSDKConfig;
  private fingerprintAPI: FingerprintAPI;
  private visitAPI: VisitAPI;
  private apiKeyAPI: APIKeyAPI;
  private roleAPI: RoleAPI;
  private tagAPI: TagAPI;
  private priceAPI: PriceAPI;
  private systemAPI: SystemAPI;
  private impressionAPI: ImpressionAPI;

  constructor(config: ServerSDKConfig) {
    this.config = config;
    const apiConfig = {
      ...config,
      onApiKeyRefresh: (newApiKey: string) => this.setApiKey(newApiKey),
    };
    this.fingerprintAPI = new FingerprintAPI(apiConfig);
    this.visitAPI = new VisitAPI(apiConfig);
    this.apiKeyAPI = new APIKeyAPI(apiConfig);
    this.roleAPI = new RoleAPI(apiConfig);
    this.tagAPI = new TagAPI(apiConfig);
    this.priceAPI = new PriceAPI(apiConfig);
    this.systemAPI = new SystemAPI(apiConfig);
    this.impressionAPI = new ImpressionAPI(apiConfig);
  }

  // Identity Management
  async identify(
    request: CreateFingerprintRequest
  ): Promise<ApiResponse<Fingerprint>> {
    return this.fingerprintAPI.createFingerprint(request);
  }

  async getIdentity(id: string): Promise<ApiResponse<Fingerprint>> {
    return this.fingerprintAPI.getFingerprint(id);
  }

  async updateFingerprint(
    metadata: Record<string, unknown>
  ): Promise<ApiResponse<Fingerprint>> {
    return this.fingerprintAPI.updateFingerprint(metadata);
  }

  // Role Management
  async listAvailableRoles(): Promise<ApiResponse<string[]>> {
    return this.roleAPI.listAvailableRoles();
  }

  async getRoles(fingerprintId: string): Promise<ApiResponse<RoleData>> {
    return this.roleAPI.getRoles(fingerprintId);
  }

  async addRoles(
    fingerprintId: string,
    roles: string[]
  ): Promise<ApiResponse<RoleData>> {
    return this.roleAPI.addRoles(fingerprintId, roles);
  }

  async removeRoles(
    fingerprintId: string,
    roles: string[]
  ): Promise<ApiResponse<RoleData>> {
    return this.roleAPI.removeRoles(fingerprintId, roles);
  }

  // Tag Management
  async updateTags(
    fingerprintId: string,
    request: UpdateTagsRequest
  ): Promise<ApiResponse<TagData>> {
    return this.tagAPI.updateTags(fingerprintId, request);
  }

  async getTags(fingerprintId: string): Promise<ApiResponse<TagData>> {
    return this.tagAPI.getTags(fingerprintId);
  }

  async deleteTags(fingerprintId: string): Promise<void> {
    return this.tagAPI.deleteTags(fingerprintId);
  }

  // API Key Management
  async registerApiKey(
    fingerprintId: string,
    metadata?: Record<string, unknown>
  ): Promise<ApiResponse<APIKeyData>> {
    try {
      const response = await this.apiKeyAPI.registerInitialApiKey(
        fingerprintId,
        metadata || {}
      );
      if (response.success && response.data) {
        // Update the SDK's API key
        this.setApiKey(response.data.key);
      }
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to register API key: ${message}`);
    }
  }

  /**
   * Update the SDK's API key and reinitialize all API instances
   */
  private setApiKey(apiKey: string) {
    this.config.apiKey = apiKey;
    // Reinitialize all API instances with the new API key and refresh callback
    const apiConfig = {
      ...this.config,
      onApiKeyRefresh: (newApiKey: string) => this.setApiKey(newApiKey),
    };
    this.fingerprintAPI = new FingerprintAPI(apiConfig);
    this.visitAPI = new VisitAPI(apiConfig);
    this.apiKeyAPI = new APIKeyAPI(apiConfig);
    this.roleAPI = new RoleAPI(apiConfig);
    this.tagAPI = new TagAPI(apiConfig);
    this.priceAPI = new PriceAPI(apiConfig);
    this.systemAPI = new SystemAPI(apiConfig);
    this.impressionAPI = new ImpressionAPI(apiConfig);

    if (this.config.debug) {
      console.log('[Argos Server] API key updated');
    }
  }

  async createApiKey(
    request: CreateAPIKeyRequest
  ): Promise<ApiResponse<APIKeyData>> {
    return this.apiKeyAPI.createAPIKey(request);
  }

  async validateApiKey(apiKey: string): Promise<ApiResponse<boolean>> {
    return this.apiKeyAPI.validateAPIKey(apiKey);
  }

  async revokeApiKey(request: RevokeAPIKeyRequest): Promise<ApiResponse<void>> {
    return this.apiKeyAPI.revokeAPIKey(request);
  }

  async getApiKey(id: string): Promise<ApiResponse<APIKeyData>> {
    return this.apiKeyAPI.getAPIKey(id);
  }

  async listApiKeys(): Promise<ApiResponse<APIKeyData[]>> {
    return this.apiKeyAPI.listAPIKeys();
  }

  async updateApiKey(
    id: string,
    request: UpdateAPIKeyRequest
  ): Promise<ApiResponse<APIKeyData>> {
    return this.apiKeyAPI.updateAPIKey(id, request);
  }

  async deleteApiKey(id: string): Promise<ApiResponse<boolean>> {
    return this.apiKeyAPI.deleteAPIKey(id);
  }

  // Visit Tracking
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
      if (this.config.debug) {
        console.log('[Argos Server] Tracking event:', event, data);
      }

      const timestamp = new Date().toISOString();

      switch (event) {
        case 'visit': {
          const visitData = {
            ...data,
            timestamp,
            type: 'visit',
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
      if (this.config.debug) {
        console.error('[Argos Server] Error:', error);
      }
      throw error;
    }
  }

  /**
   * Visit tracking methods
   */
  async getVisitHistory(
    fingerprintId: string,
    options?: GetVisitHistoryOptions
  ): Promise<ApiResponse<{ visits: VisitData[] }>> {
    return this.visitAPI.getVisitHistory(fingerprintId, options);
  }

  // Price Data
  async getCurrentPrices(
    options?: GetCurrentPricesOptions
  ): Promise<ApiResponse<PriceData>> {
    return this.priceAPI.getCurrentPrices(options);
  }

  async getPriceHistory(
    tokenId: string,
    options?: GetPriceHistoryOptions
  ): Promise<ApiResponse<PriceHistoryData>> {
    return this.priceAPI.getPriceHistory(tokenId, options);
  }

  // System Health
  async checkHealth(): Promise<ApiResponse<SystemHealthData>> {
    return this.systemAPI.checkHealth();
  }

  // Impression Management
  async createImpression(
    request: CreateImpressionRequest
  ): Promise<ApiResponse<ImpressionData>> {
    return this.impressionAPI.createImpression(request);
  }

  async getImpressions(
    fingerprintId: string,
    options?: GetImpressionsOptions
  ): Promise<ApiResponse<ImpressionData[]>> {
    return this.impressionAPI.getImpressions(fingerprintId, options);
  }

  async deleteImpressions(
    fingerprintId: string,
    options?: GetImpressionsOptions
  ): Promise<ApiResponse<DeleteImpressionsResponse>> {
    return this.impressionAPI.deleteImpressions(fingerprintId, options);
  }
}
