// src/utils/fastapi/filestorage.ts
import { ApiError } from '@/types/exceptions';
import type {
  FileStorageApiInterface,
  SubmissionFormObject,
} from '@/types/submissionapi';

// Configuration
const API_BASE_URL = import.meta.env.VITE_CUSTOM_CDN_BASE_URL || 'http://localhost:8000';

// Simple API Response for file upload
interface FileUploadResponse {
  success: boolean;
  public_url: string;
  message: string;
}

// Helper function to upload a single file
const uploadSingleFile = async (
  email: string,
  label: string,
  submissionId: string,
  file: File
): Promise<string> => {
  const formData = new FormData();
  formData.append('email', email);
  formData.append('label', label);
  formData.append('submissionId', submissionId);
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      // Use default message if can't parse JSON
    }
    throw new ApiError(errorMessage, response.status);
  }

  const result: FileUploadResponse = await response.json();

  if (!result.success) {
    throw new ApiError(result.message || 'Upload failed');
  }

  // Convert relative URL to absolute URL for frontend use
  return `${API_BASE_URL}${result.public_url}`;
};

// Implementation of the FileStorageApiInterface
export const fileStorageApi: FileStorageApiInterface = {
  uploadSingleFile: async (
    email: string,
    key: keyof SubmissionFormObject,
    submissionId: string,
    file: File
  ): Promise<string> => {
    return await uploadSingleFile(email, key, submissionId, file);
  },
};
