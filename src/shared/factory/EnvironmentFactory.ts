import {
  RuntimeEnvironment,
  EnvironmentInterface,
} from '../interfaces/environment';
import { BrowserEnvironment } from '../../client/environment/BrowserEnvironment';
import { NodeEnvironment } from '../../server/environment/NodeEnvironment';
import type {
  Response as NodeResponse,
  RequestInit as NodeRequestInit,
} from 'node-fetch';

export interface EnvironmentFactoryConfig {
  runtime?: RuntimeEnvironment;
  encryptionKey?: string;
  fingerprint?: string;
  onApiKeyUpdate?: (apiKey: string) => void;
}

export class EnvironmentFactory {
  static createBrowserEnvironment(
    onApiKeyUpdate?: (apiKey: string) => void
  ): EnvironmentInterface<globalThis.Response> {
    if (typeof window === 'undefined') {
      throw new Error(
        'Cannot create BrowserEnvironment in a non-browser context'
      );
    }
    return new BrowserEnvironment(onApiKeyUpdate);
  }

  static createNodeEnvironment(
    encryptionKey: string,
    onApiKeyUpdate?: (apiKey: string) => void
  ): EnvironmentInterface<NodeResponse, NodeRequestInit> {
    if (!encryptionKey) {
      throw new Error('Encryption key is required for Node environment');
    }
    return new NodeEnvironment(encryptionKey, onApiKeyUpdate);
  }

  static create(
    config: EnvironmentFactoryConfig = {}
  ): EnvironmentInterface<unknown, unknown> {
    const runtime = config.runtime || this.detectRuntime();

    switch (runtime) {
      case RuntimeEnvironment.Browser:
        return this.createBrowserEnvironment(config.onApiKeyUpdate);
      case RuntimeEnvironment.Node:
        if (!config.encryptionKey) {
          throw new Error('Encryption key is required for Node environment');
        }
        return this.createNodeEnvironment(
          config.encryptionKey,
          config.onApiKeyUpdate
        );
      default:
        throw new Error(`Unsupported runtime environment: ${runtime}`);
    }
  }

  private static detectRuntime(): RuntimeEnvironment {
    if (typeof window === 'undefined') {
      return RuntimeEnvironment.Node;
    }
    return RuntimeEnvironment.Browser;
  }
}
