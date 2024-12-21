import { BaseAPIConfig } from '../api/BaseAPI';

const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

// Base URL configuration
const getBaseUrl = (): string => {
  if (isDevelopment || isTest) {
    // Local development using Firebase Emulator
    return 'http://127.0.0.1:5001';
  }

  // Production URL
  return 'https://argos.project89.org';
};

export const apiConfig: BaseAPIConfig = {
  baseUrl: getBaseUrl(),
  debug: isDevelopment || isTest,
};

// Export other useful configurations
export const API_CONFIG = {
  isDevelopment,
  isTest,
  baseUrl: getBaseUrl(),
  debug: isDevelopment || isTest,
};
