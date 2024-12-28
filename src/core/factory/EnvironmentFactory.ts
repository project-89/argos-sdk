import { BrowserEnvironment } from '../../client/environment/BrowserEnvironment';
import { NodeEnvironment } from '../../server/environment/NodeEnvironment';
import {
  EnvironmentInterface,
  RuntimeEnvironment,
} from '../../shared/interfaces/environment';
import { CookieStorage } from '../../client/storage/CookieStorage';
import { SecureStorage } from '../../server/storage/SecureStorage';

export interface EnvironmentFactoryConfig {
  runtime?: RuntimeEnvironment;
  onApiKeyUpdate?: (apiKey: string) => void;
  encryptionKey?: string;
}

export class EnvironmentFactory {
  static create(config: EnvironmentFactoryConfig = {}): EnvironmentInterface {
    const runtime = config.runtime || RuntimeEnvironment.Browser;

    switch (runtime) {
      case RuntimeEnvironment.Browser:
        return new BrowserEnvironment(
          new CookieStorage({
            secure: true,
            sameSite: 'strict',
          }),
          config.onApiKeyUpdate
        );
      case RuntimeEnvironment.Node:
        if (!config.encryptionKey) {
          throw new Error('Encryption key is required for Node environment');
        }
        return new NodeEnvironment(
          new SecureStorage({
            encryptionKey: config.encryptionKey,
          }),
          config.onApiKeyUpdate
        );
      default:
        throw new Error(`Unsupported runtime environment: ${runtime}`);
    }
  }
}
