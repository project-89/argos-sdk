import { BaseAPIConfig } from '../../shared/api/BaseAPI';
import {
  ApiResponse,
  Fingerprint,
  ImpressionData,
  CreateImpressionRequest,
  CreateAPIKeyRequest,
  DeleteImpressionsResponse,
  GetImpressionsOptions,
  PresenceData,
} from '../../shared/interfaces/api';
import { FingerprintAPI } from '../../shared/api/FingerprintAPI';
import { APIKeyAPI } from '../../shared/api/APIKeyAPI';
import { ImpressionAPI } from '../../shared/api/ImpressionAPI';
import { VisitAPI } from '../../shared/api/VisitAPI';
import { EnvironmentFactory } from '../../core/factory/EnvironmentFactory';
import {
  EnvironmentInterface,
  RuntimeEnvironment,
} from '../../shared/interfaces/environment';
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
  private visitAPI: VisitAPI<Response, RequestInit>;

  constructor(config: ClientSDKConfig) {
    this.config = config;
    this.presenceInterval = config.presenceInterval || 30000; // 30 seconds default

    // Initialize environment
    this.environment =
      config.environment ||
      EnvironmentFactory.createBrowserEnvironment(config.onApiKeyUpdate);

    // Validate environment type
    if (!this.environment.type) {
      throw new Error('Environment type is not set');
    }

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
    this.visitAPI = new VisitAPI(apiConfig);
  }

  private validateBrowserEnvironment(methodName: string): void {
    if (
      !this.environment ||
      this.environment.type !== RuntimeEnvironment.Browser
    ) {
      throw new Error(
        `${methodName} is only available in browser environments`
      );
    }
  }

  isOnline(): boolean {
    return this.environment.isOnline();
  }

  getPresenceInterval(): number {
    return this.presenceInterval;
  }

  async updatePresence(
    fingerprintId: string,
    status: 'online' | 'offline' = 'online'
  ): Promise<ApiResponse<PresenceData>> {
    this.validateBrowserEnvironment('updatePresence');

    return this.visitAPI.updatePresence({
      fingerprintId,
      status,
      timestamp: new Date().toISOString(),
      metadata: {
        url: window.location.href,
        title: document.title,
      },
    });
  }

  async track(
    type: string,
    options: TrackOptions
  ): Promise<ApiResponse<ImpressionData>> {
    this.validateBrowserEnvironment('track');

    return this.impressionAPI.createImpression({
      type,
      fingerprintId: options.fingerprintId,
      data: {
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

  async getPlatformInfo(): Promise<Record<string, unknown>> {
    if (typeof window === 'undefined') {
      throw new Error('Platform info is only available in browser environment');
    }
    return this.environment.getPlatformInfo();
  }
}
