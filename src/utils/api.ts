// utils/api.ts
import { authApi as FirebaseAuthApi } from './firebase/auth';
import { fileStorageApi as FirebaseStorageFileStorageApi } from './firebase/firebase-storage';
import { fileStorageApi as SupabaseStorageFileStorageApi } from './supabase/filestorage';
import { databaseApi as FirebaseFileBasedDataBaseApi } from './firebase/firebase-storage-db';
import { databaseApi as FirestoreDataBaseApi } from './firebase/firestore-db';

import type { AuthApiInterface } from '@/types/authapi';
import type {
  DataBaseApiInterface,
  FileStorageApiInterface,
} from '@/types/submissionapi';

const DATABASE_STRATEGY: string = 'firestore';
const FILE_STORAGE_STRATEGY: string = 'supabase';

// Strategy selection logic
function getApiImplementation(): {
  authApi: AuthApiInterface;
  fileStorageApi: FileStorageApiInterface;
  databaseApi: DataBaseApiInterface;
} {
  return {
    authApi: FirebaseAuthApi,
    fileStorageApi:
      FILE_STORAGE_STRATEGY == 'firebase'
        ? FirebaseStorageFileStorageApi
        : SupabaseStorageFileStorageApi,
    databaseApi:
      DATABASE_STRATEGY == 'firestore'
        ? FirestoreDataBaseApi
        : FirebaseFileBasedDataBaseApi,
  };
}

const { authApi, fileStorageApi, databaseApi } = getApiImplementation();

export { authApi, fileStorageApi, databaseApi };
export default { authApi, fileStorageApi, databaseApi };
