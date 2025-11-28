// src/utils/spabase/filestorage.ts
import type {
  FileStorageApiInterface,
  SubmissionFormObject,
} from '@/types/submissionapi';
import { lazySupabase } from './lib';

const bucket = 'submissions';

// Helper to upload and get public URL
const uploadAndGetUrl = async (path: string, file: File): Promise<string> => {
  // Ensure the supabase client is initialized with the user's session,
  // or that the RLS policies on the 'submissions' bucket allow anonymous uploads
  // or uploads based on other criteria (e.g., matching a user ID from a JWT).
  // If the error persists, it means the RLS policy is not met.
  // A common solution is to pass an authenticated 'supabase' client instance
  // from the calling context (e.g., derived from a user's session)
  // or review and adjust the RLS policies for the 'submissions' bucket
  // to allow the intended upload operation.
  const { error } = await lazySupabase()
    .storage.from(bucket)
    .upload(path, file, { upsert: true });
  if (error) {
    // Log the error for debugging purposes
    console.error('Supabase Storage Upload Error:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  const { data } = lazySupabase().storage.from(bucket).getPublicUrl(path);
  if (!data.publicUrl) {
    throw new Error('Failed to get public URL after upload.');
  }
  return data.publicUrl;
};

export const fileStorageApi: FileStorageApiInterface = {
  uploadSingleFile: async (
    email: string,
    key: keyof SubmissionFormObject,
    submissionId: string,
    file: File
  ): Promise<string> => {
    const folder = `${email}-${submissionId}`;
    const path = `${folder}/${key}`;
    return await uploadAndGetUrl(path, file);
  },
};
