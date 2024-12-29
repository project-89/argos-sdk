import { FingerprintAPI } from '../../shared/api/FingerprintAPI';
import type {
  SDKInterface,
  SDKOptions,
  IdentifyOptions,
} from '../../shared/interfaces/sdk';
import type { ApiResponse, Fingerprint } from '../../shared/interfaces/api';
import { BrowserEnvironment } from '../environment/BrowserEnvironment';

export class ArgosClientSDK implements SDKInterface {
  private fingerprintAPI: FingerprintAPI<Response>;
  private environment: BrowserEnvironment;
  private debug: boolean;

  constructor(options: SDKOptions) {
    this.environment = options.environment as BrowserEnvironment;
    this.debug = options.debug || false;

    this.fingerprintAPI = new FingerprintAPI<Response>({
      baseUrl: options.baseUrl,
      apiKey: options.apiKey,
      environment: this.environment,
      debug: this.debug,
    });

    if (options.apiKey) {
      this.setApiKey(options.apiKey);
    }
  }

  async identify(options: IdentifyOptions): Promise<ApiResponse<Fingerprint>> {
    // In browser environment, we can generate fingerprint if not provided
    const fingerprint =
      options.fingerprint || (await this.environment.getFingerprint());
    return this.fingerprintAPI.createFingerprint(fingerprint, {
      metadata: options.metadata || {},
    });
  }

  async getIdentity(fingerprintId: string): Promise<ApiResponse<Fingerprint>> {
    return this.fingerprintAPI.getFingerprint(fingerprintId);
  }

  async updateFingerprint(
    fingerprintId: string,
    metadata: Record<string, unknown>
  ): Promise<ApiResponse<Fingerprint>> {
    return this.fingerprintAPI.updateFingerprint(fingerprintId, metadata);
  }

  setApiKey(apiKey: string): void {
    this.environment.setApiKey(apiKey);
  }

  getApiKey(): string | undefined {
    return this.environment.getApiKey();
  }

  async getPlatformInfo(): Promise<Record<string, unknown>> {
    return this.environment.getPlatformInfo();
  }
}
