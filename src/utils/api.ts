// utils/api.ts
// import { authApi as FirebaseAuthApi } from './firebase/auth';
// import { fileStorageApi as FirebaseStorageFileStorageApi } from './firebase/firebase-storage';
import { fileStorageApi as SupabaseStorageFileStorageApi } from './supabase/filestorage';
import { fileStorageApi as FastApiStorageFileStorageApi } from './fastapi/filestorage';
// import { databaseApi as FirebaseFileBasedDataBaseApi } from './firebase/firebase-storage-db';
// import { databaseApi as FirestoreDataBaseApi } from './firebase/firestore-db';

// Mockup imports
import { authApi as MockAuthApi } from './mockup/auth';
import { fileStorageApi as MockFileStorageApi } from './mockup/filestorage';
import { databaseApi as MockDatabaseApi } from './mockup/database';

import type { AuthApiInterface } from '@/types/authapi';
import type {
  DataBaseApiInterface,
  FileStorageApiInterface,
} from '@/types/submissionapi';

const DATABASE_STRATEGY = import.meta.env.VITE_DATABASE_STRATEGY || 'mockup';
const FILE_STORAGE_STRATEGY = import.meta.env.VITE_FILE_STORAGE_STRATEGY || 'mockup';
const AUTH_STRATEGY = import.meta.env.VITE_AUTH_STRATEGY || 'mockup';

// Strategy maps
const authStrategies: Record<string, AuthApiInterface> = {
  // firebase: FirebaseAuthApi,
  mockup: MockAuthApi,
};

const fileStorageStrategies: Record<string, FileStorageApiInterface> = {
  // firebase: FirebaseStorageFileStorageApi,
  fastapi: FastApiStorageFileStorageApi,
  supabase: SupabaseStorageFileStorageApi,
  mockup: MockFileStorageApi,
};

const databaseStrategies: Record<string, DataBaseApiInterface> = {
  // firestore: FirestoreDataBaseApi,
  // firebase: FirebaseFileBasedDataBaseApi,
  mockup: MockDatabaseApi,
};

// Strategy selection logic
function getApiImplementation(): {
  authApi: AuthApiInterface;
  fileStorageApi: FileStorageApiInterface;
  databaseApi: DataBaseApiInterface;
} {
  const authApi = authStrategies[AUTH_STRATEGY];
  const fileStorageApi = fileStorageStrategies[FILE_STORAGE_STRATEGY];
  const databaseApi = databaseStrategies[DATABASE_STRATEGY];

  if (!authApi) {
    throw new Error(`Unknown Auth Strategy: ${AUTH_STRATEGY}`);
  }
  if (!fileStorageApi) {
    throw new Error(`Unknown File Storage Strategy: ${FILE_STORAGE_STRATEGY}`);
  }
  if (!databaseApi) {
    throw new Error(`Unknown Database Strategy: ${DATABASE_STRATEGY}`);
  }

  return {
    authApi,
    fileStorageApi,
    databaseApi,
  };
}

const { authApi, fileStorageApi, databaseApi } = getApiImplementation();

export { authApi, fileStorageApi, databaseApi };
export default { authApi, fileStorageApi, databaseApi };
