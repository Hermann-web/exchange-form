// utils/api.ts
import { authApi as FirebaseAuthApi } from './firebase/auth';
// import { fileStorageApi as FirebaseStorageFileStorageApi } from './firebase/firebase-storage';
// import { fileStorageApi as SupabaseStorageFileStorageApi } from './supabase/filestorage';
// import { cloudinaryStorageApi as CloudinaryFileStorageApi } from './cloudinary/filestorage';
// import { uploadcareStorageApi as UploadcareFileStorageApi } from './uploadcare/filestorage';
import { authApi as SupabaseAuthApi } from './supabase/auth';
import { fileStorageApi as FastApiStorageFileStorageApi } from './fastapi/filestorage';
import { databaseApi as SupabaseDatabaseApi } from './supabase/database';
// import { databaseApi as FirebaseFileBasedDataBaseApi } from './firebase/firebase-storage-db';
import { databaseApi as FirestoreDataBaseApi } from './firebase/firestore-db';
import { authApi as FastApiAuthApi } from './fastapi/auth';
import { databaseApi as FastApiDatabaseApi } from './fastapi/database';

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
  firebase: FirebaseAuthApi, // ok
  mockup: MockAuthApi, // ok
  supabase: SupabaseAuthApi, // ok
  fastapi: FastApiAuthApi, // ok
};

const fileStorageStrategies: Record<string, FileStorageApiInterface> = {
  // firebase: FirebaseStorageFileStorageApi, // not tested
  fastapi: FastApiStorageFileStorageApi, // ok
  // supabase: SupabaseStorageFileStorageApi, // not tested
  // cloudinary: CloudinaryFileStorageApi, // not ok
  // uploadcare: UploadcareFileStorageApi, // not ok
  mockup: MockFileStorageApi, // ok
};

const databaseStrategies: Record<string, DataBaseApiInterface> = {
  firestore: FirestoreDataBaseApi, // ok
  // firebase: FirebaseFileBasedDataBaseApi, // not tested
  supabase: SupabaseDatabaseApi, // ok
  mockup: MockDatabaseApi, // ok
  fastapi: FastApiDatabaseApi, // ok
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
