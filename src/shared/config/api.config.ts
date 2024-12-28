import { BaseAPIConfig } from '../api/BaseAPI';
import { RuntimeEnvironment } from '../interfaces/environment';
import { EnvironmentFactory } from '../../core/factory/EnvironmentFactory';

const environment = EnvironmentFactory.create({
  runtime: RuntimeEnvironment.Browser,
});

export const defaultConfig: BaseAPIConfig = {
  baseUrl:
    process.env.API_URL || 'http://localhost:5001/argos-434718/us-central1/api',
  environment,
  debug: process.env.NODE_ENV === 'development',
};
