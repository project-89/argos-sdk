/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ARGOS_API_URL: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
