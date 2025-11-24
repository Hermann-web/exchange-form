import type {
  FileStorageApiInterface,
  SubmissionFormObject,
} from '@/types/submissionapi';

export const fileStorageApi: FileStorageApiInterface = {
  uploadSingleFile: async (
    email: string,
    key: keyof SubmissionFormObject,
    submissionId: string,
    file: File
  ): Promise<string> => {
    console.log('[MockFileStorage] Uploading single file', email, key, file);
    return `https://mock-storage.com/${email}-${submissionId}-${key}.pdf`;
  },
};
