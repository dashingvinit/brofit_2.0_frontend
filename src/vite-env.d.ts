/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_CLERK_PUBLISHABLE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Extend Window interface to include Clerk
interface Window {
  Clerk?: {
    session?: {
      getToken: () => Promise<string>;
    };
  };
}
