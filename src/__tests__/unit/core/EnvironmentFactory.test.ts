import { EnvironmentFactory } from '../../../core/factory/EnvironmentFactory';
import { BrowserEnvironment } from '../../../client/environment/BrowserEnvironment';
import { NodeEnvironment } from '../../../server/environment/NodeEnvironment';
import { RuntimeEnvironment } from '../../../shared/interfaces/environment';
import type { Response as NodeResponse } from 'node-fetch';

describe('EnvironmentFactory', () => {
  describe('create', () => {
    it('should create BrowserEnvironment by default', () => {
      const environment = EnvironmentFactory.create();
      expect(environment).toBeInstanceOf(BrowserEnvironment);
    });

    it('should create BrowserEnvironment when specified', () => {
      const environment = EnvironmentFactory.create({
        runtime: RuntimeEnvironment.Browser,
      });
      expect(environment).toBeInstanceOf(BrowserEnvironment);
    });

    it('should create NodeEnvironment when specified with encryption key and fingerprint', () => {
      const environment = EnvironmentFactory.create({
        runtime: RuntimeEnvironment.Node,
        encryptionKey: 'test-key-32-chars-secure-storage-ok',
        fingerprint: 'test-fingerprint',
      });
      expect(environment).toBeInstanceOf(NodeEnvironment);
    });

    it('should throw error when creating NodeEnvironment without encryption key', () => {
      expect(() =>
        EnvironmentFactory.create({
          runtime: RuntimeEnvironment.Node,
          fingerprint: 'test-fingerprint',
        })
      ).toThrow('Encryption key is required for Node environment');
    });

    it('should throw error when creating NodeEnvironment without fingerprint', () => {
      expect(() =>
        EnvironmentFactory.create({
          runtime: RuntimeEnvironment.Node,
          encryptionKey: 'test-key-32-chars-secure-storage-ok',
        })
      ).toThrow('Fingerprint is required for Node environment');
    });

    it('should throw error for unsupported runtime', () => {
      expect(() =>
        EnvironmentFactory.create({
          runtime: 'unsupported' as RuntimeEnvironment,
        })
      ).toThrow('Unsupported runtime environment: unsupported');
    });

    it('should handle API key update callback', () => {
      const onApiKeyUpdate = jest.fn();
      const environment = EnvironmentFactory.create({
        onApiKeyUpdate,
      });
      expect(environment).toBeInstanceOf(BrowserEnvironment);
    });
  });
});
