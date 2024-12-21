export * from './ArgosSDK';
export * from './types/api';
export * from './context/ArgosContext';
export * from './hooks';

export const apiConfig = {
  baseUrl:
    process.env.NODE_ENV === 'development'
      ? 'http://127.0.0.1:5001'
      : 'https://argos.project89.org',
  debug: process.env.NODE_ENV === 'development',
};
