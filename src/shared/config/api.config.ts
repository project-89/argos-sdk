import { BaseAPIConfig } from '../api/BaseAPI';
import { EnvironmentFactory } from '../../core/factory/EnvironmentFactory';
import { CommonRequestInit } from '../interfaces/http';

export const defaultConfig: BaseAPIConfig<Response, CommonRequestInit> = {
  baseUrl: 'https://api.argos.withlens.app',
  environment: EnvironmentFactory.createBrowserEnvironment(),
  debug: false,
};

export const localConfig: BaseAPIConfig<Response, CommonRequestInit> = {
  baseUrl: 'http://localhost:3000',
  environment: EnvironmentFactory.createBrowserEnvironment(),
  debug: true,
};
