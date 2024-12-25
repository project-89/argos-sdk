import {
  EnvironmentInterface,
  StorageInterface,
  RuntimeEnvironment,
  RuntimeConfig,
  detectEnvironment,
} from '../interfaces/environment';
import { BrowserEnvironment } from '../../client/environment/BrowserEnvironment';
import { BrowserStorage } from '../../client/storage/BrowserStorage';
import { ServerEnvironment } from '../../server/environment/ServerEnvironment';
import { ServerStorage } from '../../server/storage/ServerStorage';

export class EnvironmentFactory {
  static createEnvironment(config: RuntimeConfig = {}): {
    environment: EnvironmentInterface;
    storage: StorageInterface;
    runtime: RuntimeEnvironment;
  } {
    // Use provided environment and storage if available
    if (config.environment && config.storage) {
      return {
        environment: config.environment,
        storage: config.storage,
        runtime: RuntimeEnvironment.Unknown,
      };
    }

    const runtime = detectEnvironment();
    const debug = config.debug || false;

    switch (runtime) {
      case RuntimeEnvironment.Browser:
        return {
          environment: new BrowserEnvironment(debug),
          storage: new BrowserStorage('argos_', debug),
          runtime,
        };

      case RuntimeEnvironment.Server:
        return {
          environment: new ServerEnvironment({ debug }),
          storage: new ServerStorage({
            prefix: 'argos_',
            debug,
            persistence: {
              enabled: true,
              directory: '.argos',
              filename: 'storage.json',
            },
          }),
          runtime,
        };

      default:
        throw new Error(
          'Unable to detect runtime environment. Please provide environment and storage implementations.'
        );
    }
  }
}
