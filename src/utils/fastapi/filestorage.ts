// src/utils/fastapi/filestorage.ts
import type {
  FileStorageApiInterface,
  SubmissionForm,
  SubmissionData,
} from '@/types/submissionapi';

// Configuration
const API_BASE_URL = import.meta.env.VITE_FASTAPI_BASE_URL || 'http://localhost:8000';

// Simple API Response for file upload
interface FileUploadResponse {
  success: boolean;
  public_url: string;
  message: string;
}

// Error handling utility
class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Helper function to upload a single file
const uploadSingleFile = async (
  email: string,
  label: string,
  file: File
): Promise<string> => {
  const formData = new FormData();
  formData.append('email', email);
  formData.append('label', label);
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
  uploadFiles: async (formData: SubmissionForm): Promise<SubmissionData> => {
    try {
      const timestamp = new Date().toISOString();
      const email = formData.email;

      // Upload all files concurrently
      const uploadPromises = [
        // Required files
        uploadSingleFile(email, 'applicationForm', formData.applicationFormDocx),
        uploadSingleFile(email, 'resume', formData.resumePdf),
        uploadSingleFile(email, 's5Transcripts', formData.s5Transcripts),
        uploadSingleFile(email, 's6Transcripts', formData.s6Transcripts),
        uploadSingleFile(
          email,
          'school1LearningAgreement',
          formData.school1LearningAgreement
        ),
        uploadSingleFile(email, 'passport', formData.passeportPdf),
      ];

      // Handle optional files
      if (formData.residencePermit) {
        uploadPromises.push(
          uploadSingleFile(email, 'residencePermit', formData.residencePermit)
        );
      }
      if (formData.school2LearningAgreement) {
        uploadPromises.push(
          uploadSingleFile(
            email,
            'school2LearningAgreement',
            formData.school2LearningAgreement
          )
        );
      }
      if (formData.otherFilesPdf) {
        uploadPromises.push(
          uploadSingleFile(email, 'otherFiles', formData.otherFilesPdf)
        );
      }

      // Wait for all uploads to complete
      const uploadedUrls = await Promise.all(uploadPromises);

      // Map URLs to their corresponding fields
      let urlIndex = 0;
      const applicationFormUrl = uploadedUrls[urlIndex++];
      const resumeUrl = uploadedUrls[urlIndex++];
      const s5TranscriptsUrl = uploadedUrls[urlIndex++];
      const s6TranscriptsUrl = uploadedUrls[urlIndex++];
      const school1LearningAgreementUrl = uploadedUrls[urlIndex++];
      const passeportUrl = uploadedUrls[urlIndex++];

      // Handle optional URLs
      let residencePermitUrl: string | undefined;
      let school2LearningAgreementUrl: string | undefined;
      let otherFilesPdfUrl: string | undefined;

      if (formData.residencePermit) {
        residencePermitUrl = uploadedUrls[urlIndex++];
      }
      if (formData.school2LearningAgreement) {
        school2LearningAgreementUrl = uploadedUrls[urlIndex++];
      }
      if (formData.otherFilesPdf) {
        otherFilesPdfUrl = uploadedUrls[urlIndex++];
      }

      // Extract metadata (non-file fields)
      const {
        applicationFormDocx,
        resumePdf,
        s5Transcripts,
        s6Transcripts,
        residencePermit,
        school1LearningAgreement,
        school2LearningAgreement,
        passeportPdf,
        otherFilesPdf,
        ...metadata
      } = formData;

      // Construct the response matching SubmissionData interface
      const submissionData: SubmissionData = {
        ...metadata,
        applicationFormUrl,
        resumeUrl,
        s5TranscriptsUrl,
        s6TranscriptsUrl,
        school1LearningAgreementUrl,
        passeportUrl,
        ...(residencePermitUrl ? { residencePermitUrl } : {}),
        ...(school2LearningAgreementUrl ? { school2LearningAgreementUrl } : {}),
        ...(otherFilesPdfUrl ? { otherFilesPdfUrl } : {}),
        createdAt: timestamp,
      };

      return submissionData;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        error
      );
    }
  },
};

// Additional utility functions for direct file upload
export const simpleFileApi = {
  /**
   * Upload a single file with email and label
   */
  uploadFile: async (email: string, label: string, file: File): Promise<string> => {
    return await uploadSingleFile(email, label, file);
  },

  /**
   * Get the download URL for a public file ID
   */
  getDownloadUrl: (publicId: string): string => {
    return `${API_BASE_URL}/download/${publicId}`;
  },

  /**
   * Download a file as blob
   */
  downloadFile: async (publicId: string): Promise<Blob> => {
    const response = await fetch(`${API_BASE_URL}/download/${publicId}`);
    if (!response.ok) {
      throw new ApiError(`Download failed: ${response.statusText}`, response.status);
    }
    return await response.blob();
  },
};

// Export error class for external use
export { ApiError };

// Health check utility
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
};

// Example usage:
/*
  // For individual file uploads:
  const fileUrl = await simpleFileApi.uploadFile('user@etu.univh2c.ma', 's5Transcripts', file);
  
  // For complete form submission (using existing interface):
  const submissionData = await fileStorageApi.uploadFiles(formData);
  
  // Health check:
  const isHealthy = await checkApiHealth();
  */
