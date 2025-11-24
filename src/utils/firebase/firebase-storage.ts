// src/utils/firebase/firebase-storage.ts
import type {
  FileStorageApiInterface,
  SubmissionFormObject,
} from '@/types/submissionapi';
import { uploadFile } from '@/lib/firebase';

export const fileStorageApi: FileStorageApiInterface = {
  uploadSingleFile: async (
    email: string,
    key: keyof SubmissionFormObject,
    submissionId: string,
    file: File
  ): Promise<string> => {
    try {
      const basePath = `submissions/${email}-${submissionId}`;
      const url = await uploadFile(file, `${basePath}/${key}`);
      return url;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file to storage');
    }
  },
};
