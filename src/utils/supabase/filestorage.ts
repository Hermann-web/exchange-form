// src/utils/spabase/filestorage.ts
import { createClient } from '@supabase/supabase-js';
import type {
  FileStorageApiInterface,
  SubmissionForm,
  SubmissionData,
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
  // make sure you create this bucket in Supabase

  uploadFiles: async (formData: SubmissionForm): Promise<SubmissionData> => {
    const timestamp = new Date().toISOString();
    const folder = `${formData.email}-${Date.now()}`;

    const applicationFormUrl = await uploadAndGetUrl(
      `${folder}/application.docx`,
      formData.applicationFormDocx
    );
    const resumeUrl = await uploadAndGetUrl(`${folder}/resume.pdf`, formData.resumePdf);
    const s5TranscriptsUrl = await uploadAndGetUrl(
      `${folder}/s5.pdf`,
      formData.s5Transcripts
    );
    const s6TranscriptsUrl = await uploadAndGetUrl(
      `${folder}/s6.pdf`,
      formData.s6Transcripts
    );

    let residencePermitUrl: string | undefined;
    if (formData.residencePermit) {
      residencePermitUrl = await uploadAndGetUrl(
        `${folder}/residence.pdf`,
        formData.residencePermit
      );
    }

    // const {...urls:SubmissionFormObject,...metaData:SubmissionFormMeta} = submissionWithTimestamp;

    const {
      applicationFormDocx,
      resumePdf,
      s5Transcripts,
      s6Transcripts,
      residencePermit,
      ...metadata
    } = formData;

    return {
      ...metadata,
      applicationFormUrl,
      resumeUrl,
      s5TranscriptsUrl,
      s6TranscriptsUrl,
      ...(residencePermitUrl ? { residencePermitUrl } : {}), // only add if defined
      createdAt: timestamp,
    };
  },
};
