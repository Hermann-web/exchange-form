/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

interface ImportMetaEnv {
  // readonly VITE_STORAGE_STRATEGY: string;
  // readonly VITE_AUTH_STRATEGY: string;
  // readonly VITE_DATABASE_STRATEGY: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_ALLOWED_EMAIL_DOMAIN: string; // e.g., "centrale-casablanca.ma" or "gmail.com"
  readonly VITE_ADMIN_EMAILS: string; // comma-separated list of admin emails
  readonly VITE_FASTAPI_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
