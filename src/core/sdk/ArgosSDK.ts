import {
  EnvironmentInterface,
  StorageInterface,
  RuntimeEnvironment,
} from '../../shared/interfaces/environment';
import { FingerprintAPI } from '../../shared/api/FingerprintAPI';
import { VisitAPI } from '../../shared/api/VisitAPI';
import { APIKeyAPI } from '../../shared/api/APIKeyAPI';
import { RoleAPI } from '../../shared/api/RoleAPI';
import { TagAPI } from '../../shared/api/TagAPI';
import { PriceAPI } from '../../shared/api/PriceAPI';
import { SystemAPI } from '../../shared/api/SystemAPI';
import { ImpressionAPI } from '../../shared/api/ImpressionAPI';
import { BaseAPIConfig } from '../../shared/api/BaseAPI';
import {
  EnvironmentFactory,
  EnvironmentFactoryConfig,
} from '../factory/EnvironmentFactory';
import {
  ApiResponse,
  Fingerprint,
  VisitData,
  PresenceData,
  APIKeyData,
  CreateFingerprintRequest,
  CreateVisitRequest,
  UpdatePresenceRequest,
  CreateImpressionRequest,
  GetImpressionsOptions,
  ImpressionData,
  DeleteImpressionsResponse,
} from '../../shared/interfaces/api';

export type TrackEventType = 'visit' | 'presence' | 'custom';

export interface ArgosSDKConfig extends Omit<BaseAPIConfig, 'environment'> {
  environment?: EnvironmentInterface;
  storage?: StorageInterface;
  debug?: boolean;
  runtime?: RuntimeEnvironment;
  encryptionKey?: string;
}

export class ArgosSDK {
  private fingerprintAPI: FingerprintAPI;
  private visitAPI: VisitAPI;
  private apiKeyAPI: APIKeyAPI;
  private roleAPI: RoleAPI;
  private tagAPI: TagAPI;
  private priceAPI: PriceAPI;
  private systemAPI: SystemAPI;
  private impressionAPI: ImpressionAPI;
  private environment: EnvironmentInterface;
  private storage: StorageInterface;
  private debug: boolean;
  private presenceInterval = 30000; // 30 seconds

  constructor(config: ArgosSDKConfig) {
    const factoryConfig: EnvironmentFactoryConfig = {
      runtime: config.runtime,
      encryptionKey: config.encryptionKey,
    };

    this.environment =
      config.environment || EnvironmentFactory.create(factoryConfig);
    this.storage = config.storage || (this.environment as any).storage;
    this.debug = config.debug || false;

    const apiConfig: BaseAPIConfig = {
      ...config,
      environment: this.environment,
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

  // Environment methods
  isOnline(): boolean {
    return this.environment.isOnline();
  }

  setApiKey(apiKey: string): void {
    this.environment.setApiKey(apiKey);
  }

  getPresenceInterval(): number {
    return this.presenceInterval;
  }

  // Identity Management
  async identify(
    request: CreateFingerprintRequest
  ): Promise<ApiResponse<Fingerprint>> {
    return this.fingerprintAPI.createFingerprint(request.fingerprint, {
      metadata: request.metadata || {},
    });
  }

  async getIdentity(id: string): Promise<ApiResponse<Fingerprint>> {
    return this.fingerprintAPI.getFingerprint(id);
  }

  async updateFingerprint(
    metadata: Record<string, unknown>
  ): Promise<ApiResponse<Fingerprint>> {
    const fingerprintId = await this.environment.getFingerprint();
    return this.fingerprintAPI.updateFingerprint(fingerprintId, metadata);
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
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to register API key: ${message}`);
    }
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
      if (this.debug) {
        console.log('[Argos SDK] Tracking event:', event, data);
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
      if (this.debug) {
        console.error('[Argos SDK] Error:', error);
      }
      throw error;
    }
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

  // ... rest of the file unchanged ...
}
