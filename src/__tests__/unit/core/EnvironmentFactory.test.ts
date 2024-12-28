import { EnvironmentFactory } from '../../../core/factory/EnvironmentFactory';
import { RuntimeEnvironment } from '../../../shared/interfaces/environment';
import { BrowserEnvironment } from '../../../client/environment/BrowserEnvironment';
import { NodeEnvironment } from '../../../server/environment/NodeEnvironment';
import { SecureStorage } from '../../../server/storage/SecureStorage';

jest.mock('../../../client/environment/BrowserEnvironment');
jest.mock('../../../server/environment/NodeEnvironment');
jest.mock('../../../server/storage/SecureStorage');

describe('EnvironmentFactory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Browser Environment', () => {
    it('should create browser environment by default', () => {
      const environment = EnvironmentFactory.create();
      expect(environment).toBeInstanceOf(BrowserEnvironment);
    });

    it('should create browser environment when specified', () => {
      const environment = EnvironmentFactory.create({
        runtime: RuntimeEnvironment.Browser,
      });
      expect(environment).toBeInstanceOf(BrowserEnvironment);
    });

    it('should pass onApiKeyUpdate callback', () => {
      const onApiKeyUpdate = jest.fn();
      const environment = EnvironmentFactory.create({
        runtime: RuntimeEnvironment.Browser,
        onApiKeyUpdate,
      });
      expect(environment).toBeInstanceOf(BrowserEnvironment);
      expect(BrowserEnvironment).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.any(Object),
          prefix: expect.any(String),
        }),
        onApiKeyUpdate
      );
    });
  });

  describe('Node Environment', () => {
    it('should create node environment when specified', () => {
      const environment = EnvironmentFactory.create({
        runtime: RuntimeEnvironment.Node,
        encryptionKey: 'test-encryption-key',
      });
      expect(environment).toBeInstanceOf(NodeEnvironment);
      expect(SecureStorage).toHaveBeenCalledWith({
        encryptionKey: 'test-encryption-key',
      });
    });

    it('should pass onApiKeyUpdate callback', () => {
      const onApiKeyUpdate = jest.fn();
      const environment = EnvironmentFactory.create({
        runtime: RuntimeEnvironment.Node,
        onApiKeyUpdate,
        encryptionKey: 'test-encryption-key',
      });
      expect(environment).toBeInstanceOf(NodeEnvironment);
      expect(NodeEnvironment).toHaveBeenCalledWith(
        expect.any(SecureStorage),
        onApiKeyUpdate
      );
    });
  });

  describe('Error Handling', () => {
    it('should throw error for unsupported environment', () => {
      expect(() =>
        EnvironmentFactory.create({
          runtime: 'invalid' as RuntimeEnvironment,
        })
      ).toThrow('Unsupported runtime environment: invalid');
    });
  });
});
