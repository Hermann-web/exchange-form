// src/env.d.ts
/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

interface ImportMetaEnv {
  readonly VITE_AUTH_STRATEGY: string;
  readonly VITE_DATABASE_STRATEGY: string;
  readonly VITE_FILE_STORAGE_STRATEGY: string;
  readonly VITE_MOCKUP_SUBMISSION_STATUS: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_ALLOWED_EMAIL_DOMAIN: string; // e.g., "centrale-casablanca.ma" or "gmail.com"
  readonly VITE_ADMIN_EMAILS: string; // comma-separated list of admin emails
  readonly VITE_CUSTOM_CDN_BASE_URL: string;
  readonly VITE_CUSTOM_DB_BASE_URL: string;
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
