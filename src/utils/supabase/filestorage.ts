// src/utils/spabase/filestorage.ts
import { createClient } from '@supabase/supabase-js';
import type {
  FileStorageApiInterface,
  SubmissionFormObject,
} from '@/types/submissionapi';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const bucket = 'submissions';

// Helper to upload and get public URL
const uploadAndGetUrl = async (path: string, file: File): Promise<string> => {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
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
