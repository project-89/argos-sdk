import { BaseAPIConfig } from '../../shared/api/BaseAPI';
import {
  ApiResponse,
  Fingerprint,
  ImpressionData,
  CreateImpressionRequest,
  CreateAPIKeyRequest,
  DeleteImpressionsResponse,
  GetImpressionsOptions,
} from '../../shared/interfaces/api';
import { FingerprintAPI } from '../../shared/api/FingerprintAPI';
import { APIKeyAPI } from '../../shared/api/APIKeyAPI';
import { ImpressionAPI } from '../../shared/api/ImpressionAPI';
import { EnvironmentFactory } from '../../core/factory/EnvironmentFactory';
import { EnvironmentInterface } from '../../shared/interfaces/environment';
import { getBrowserFingerprint } from '../utils/fingerprint';

export interface ClientSDKConfig
  extends Omit<BaseAPIConfig<Response, RequestInit>, 'environment'> {
  debug?: boolean;
  presenceInterval?: number;
  environment?: EnvironmentInterface<Response, RequestInit>;
  onApiKeyUpdate?: (apiKey: string) => void;
}

export interface TrackOptions {
  fingerprintId: string;
  status?: 'online' | 'offline';
  url?: string;
  title?: string;
  metadata?: Record<string, unknown>;
}

export class ArgosClientSDK {
  private config: ClientSDKConfig;
  private presenceInterval: number;
  private environment;
  private fingerprintAPI: FingerprintAPI<Response, RequestInit>;
  private apiKeyAPI: APIKeyAPI<Response, RequestInit>;
  private impressionAPI: ImpressionAPI<Response, RequestInit>;

  constructor(config: ClientSDKConfig) {
    // Only initialize if we're in a browser environment
    if (typeof window === 'undefined') {
      throw new Error(
        'ArgosClientSDK can only be initialized in a browser environment'
      );
    }

    this.config = config;
    this.presenceInterval = config.presenceInterval || 30000; // 30 seconds default

    // Initialize environment
    this.environment =
      config.environment ||
      EnvironmentFactory.createBrowserEnvironment(config.onApiKeyUpdate);
    if (config.apiKey) {
      this.environment.setApiKey(config.apiKey);
    }

    const apiConfig: BaseAPIConfig<Response, RequestInit> = {
      ...config,
      environment: this.environment,
    };

    // Initialize APIs
    this.fingerprintAPI = new FingerprintAPI(apiConfig);
    this.apiKeyAPI = new APIKeyAPI(apiConfig);
    this.impressionAPI = new ImpressionAPI(apiConfig);
  }

  isOnline(): boolean {
    return typeof window !== 'undefined' && typeof navigator !== 'undefined'
      ? navigator.onLine
      : true;
  }

  getPresenceInterval(): number {
    return this.presenceInterval;
  }

  async track(
    type: string,
    options: TrackOptions
  ): Promise<ApiResponse<ImpressionData>> {
    if (typeof window === 'undefined') {
      throw new Error('Tracking is only available in browser environment');
    }

    return this.impressionAPI.createImpression({
      type,
      fingerprintId: options.fingerprintId,
      data: {
        status: options.status,
        url: options.url,
        title: options.title,
        ...options.metadata,
      },
    });
  }

  // Method required by useImpressions hook
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

  async registerApiKey(
    fingerprintId: string
  ): Promise<ApiResponse<{ key: string }>> {
    const request: CreateAPIKeyRequest = {
      name: `client-sdk-${fingerprintId}`,
      fingerprintId,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      metadata: { source: 'client-sdk' },
    };

    const response = await this.apiKeyAPI.createAPIKey(request);

    if (response.success && response.data) {
      this.setApiKey(response.data.key);
    }

    return response;
  }

  async identify(data: {
    fingerprint?: string;
    metadata?: Record<string, unknown>;
  }): Promise<ApiResponse<Fingerprint>> {
    let fingerprint = data.fingerprint;
    if (!fingerprint) {
      fingerprint = await getBrowserFingerprint();
    }
    return this.fingerprintAPI.createFingerprint(fingerprint, {
      metadata: data.metadata,
    });
  }

  // Method required by useMetadata hook
  async updateFingerprint(
    fingerprintId: string,
    metadata: Record<string, unknown>
  ): Promise<ApiResponse<Fingerprint>> {
    return this.fingerprintAPI.updateFingerprint(fingerprintId, metadata);
  }

  async getIdentity(id: string): Promise<ApiResponse<Fingerprint>> {
    return this.fingerprintAPI.getFingerprint(id);
  }

  setApiKey(apiKey: string): void {
    this.environment.setApiKey(apiKey);
  }

  getApiKey(): string | undefined {
    return this.environment.getApiKey();
  }

  async deleteImpressions(
    fingerprintId: string,
    type?: string
  ): Promise<ApiResponse<DeleteImpressionsResponse>> {
    return this.impressionAPI.deleteImpressions(fingerprintId, type);
  }
}
