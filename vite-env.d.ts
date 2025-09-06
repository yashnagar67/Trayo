/// <reference types="vite/client" />

// Vite environment variable types for import.meta.env
interface ImportMetaEnv {
  readonly VITE_API_KEY?: string;
  // add more env variables here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
