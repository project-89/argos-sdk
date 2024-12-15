import { BaseAPIConfig } from "../api/BaseAPI";

const isDevelopment = process.env.NODE_ENV === "development";
const isTest = process.env.NODE_ENV === "test";

// Firebase project configuration
const config = {
  projectId: "argos-434718",
  region: "us-central1",
};

// Base URL configuration
const getBaseUrl = (): string => {
  if (isDevelopment || isTest) {
    // Local development using Firebase Emulator
    return `http://127.0.0.1:5001/${config.projectId}/${config.region}/api`;
  }

  // Production URL - replace with your actual production URL
  return `https://${config.region}-${config.projectId}.cloudfunctions.net/api`;
};

export const apiConfig: BaseAPIConfig = {
  baseUrl: getBaseUrl(),
};

// Export other useful configurations
export const API_CONFIG = {
  ...config,
  isDevelopment,
  isTest,
  baseUrl: getBaseUrl(),
};
