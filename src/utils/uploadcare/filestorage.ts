// src/utils/uploadcare/filestorage.ts
import type {
  FileStorageApiInterface,
  SubmissionFormObject,
} from '@/types/submissionapi';

// Configuration
const UPLOADCARE_PUBLIC_KEY = import.meta.env.VITE_UPLOADCARE_PUBLIC_KEY;
const UPLOADCARE_SECRET_KEY = import.meta.env.VITE_UPLOADCARE_SECRET_KEY; // Optional, for server-side ops

// Uploadcare API Response
interface UploadcareUploadResponse {
  file: string; // UUID of the uploaded file
  original_filename: string;
  size: number;
  mime_type: string;
  is_stored: boolean;
  is_image: boolean;
  uuid: string;
  original_file_url: string;
}

interface UploadcareFileInfo {
  uuid: string;
  original_filename: string;
  size: number;
  mime_type: string;
  is_stored: boolean;
  datetime_uploaded: string;
  url: string; // CDN URL
  metadata?: Record<string, string>;
}

// Error handling utility
class UploadcareError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'UploadcareError';
  }
}

/**
 * Generate CDN URL from file UUID
 * Format: https://ucarecdn.com/{uuid}/{filename}
 */
const generateCdnUrl = (uuid: string, filename?: string): string => {
  const baseUrl = `https://ucarecdn.com/${uuid}/`;
  return filename ? `${baseUrl}${encodeURIComponent(filename)}` : baseUrl;
};

/**
 * Generate metadata for file organization
 */
const generateMetadata = (
  email: string,
  label: string,
  submissionId: string
): Record<string, string> => {
  return {
    email: email,
    label: label,
    submissionId: submissionId,
    uploadedAt: new Date().toISOString(),
    category: 'submission',
  };
};

/**
 * Upload a single file to Uploadcare using Direct Upload
 * @param email - User's email
 * @param label - File type label (e.g., 'resumePdf', 'applicationFormEcc')
 * @param submissionId - Unique submission ID
 * @param file - File to upload
 * @returns Public CDN URL of the uploaded file
 */
const uploadSingleFile = async (
  email: string,
  label: string,
  submissionId: string,
  file: File
): Promise<string> => {
  // Validate configuration
  if (!UPLOADCARE_PUBLIC_KEY) {
    throw new UploadcareError(
      'Uploadcare configuration missing. Please set VITE_UPLOADCARE_PUBLIC_KEY'
    );
  }

  const formData = new FormData();
  formData.append('UPLOADCARE_PUB_KEY', UPLOADCARE_PUBLIC_KEY);
  formData.append('file', file);

  // Store files automatically (don't delete after 24h)
  formData.append('UPLOADCARE_STORE', '1');

  // Add metadata for organization and searching
  const metadata = generateMetadata(email, label, submissionId);
  Object.entries(metadata).forEach(([key, value]) => {
    formData.append(`metadata[${key}]`, value);
  });

  try {
    // Upload to Uploadcare
    const uploadUrl = 'https://upload.uploadcare.com/base/';

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = `Uploadcare upload failed: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.content || errorMessage;
      } catch {
        // Use default message if can't parse JSON
      }
      throw new UploadcareError(errorMessage, response.status);
    }

    const result: UploadcareUploadResponse = await response.json();

    // Return CDN URL with original filename
    return generateCdnUrl(result.uuid, file.name);
  } catch (error) {
    if (error instanceof UploadcareError) {
      throw error;
    }
    throw new UploadcareError(
      `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

/**
 * Upload with progress tracking (alternative method)
 * Useful for large files where you want to show upload progress
 */
const uploadSingleFileWithProgress = async (
  email: string,
  label: string,
  submissionId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  if (!UPLOADCARE_PUBLIC_KEY) {
    throw new UploadcareError('Uploadcare public key not configured');
  }

  const formData = new FormData();
  formData.append('UPLOADCARE_PUB_KEY', UPLOADCARE_PUBLIC_KEY);
  formData.append('file', file);
  formData.append('UPLOADCARE_STORE', '1');

  const metadata = generateMetadata(email, label, submissionId);
  Object.entries(metadata).forEach(([key, value]) => {
    formData.append(`metadata[${key}]`, value);
  });

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = (e.loaded / e.total) * 100;
        onProgress(Math.round(progress));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result: UploadcareUploadResponse = JSON.parse(xhr.responseText);
          resolve(generateCdnUrl(result.uuid, file.name));
        } catch (error) {
          reject(new UploadcareError('Failed to parse upload response'));
        }
      } else {
        reject(new UploadcareError(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new UploadcareError('Network error during upload'));
    });

    xhr.addEventListener('abort', () => {
      reject(new UploadcareError('Upload cancelled'));
    });

    xhr.open('POST', 'https://upload.uploadcare.com/base/');
    xhr.send(formData);
  });
};

/**
 * Get file information from Uploadcare
 * Requires REST API authentication
 */
const getFileInfo = async (uuid: string): Promise<UploadcareFileInfo> => {
  if (!UPLOADCARE_PUBLIC_KEY) {
    throw new UploadcareError('Uploadcare public key not configured');
  }

  try {
    const url = `https://api.uploadcare.com/files/${uuid}/`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Uploadcare.Simple ${UPLOADCARE_PUBLIC_KEY}:${UPLOADCARE_SECRET_KEY}`,
        Accept: 'application/vnd.uploadcare-v0.7+json',
      },
    });

    if (!response.ok) {
      throw new UploadcareError(`Failed to fetch file info: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw new UploadcareError(
      `Failed to get file info: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

/**
 * Delete a file from Uploadcare
 * Note: This should typically be done server-side for security
 */
const deleteFile = async (uuid: string): Promise<boolean> => {
  if (!UPLOADCARE_PUBLIC_KEY || !UPLOADCARE_SECRET_KEY) {
    throw new UploadcareError('Uploadcare credentials not configured for deletion');
  }

  try {
    const url = `https://api.uploadcare.com/files/${uuid}/storage/`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Uploadcare.Simple ${UPLOADCARE_PUBLIC_KEY}:${UPLOADCARE_SECRET_KEY}`,
        Accept: 'application/vnd.uploadcare-v0.7+json',
      },
    });

    return response.ok;
  } catch (error) {
    throw new UploadcareError(
      `Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

/**
 * Batch upload multiple files
 * Useful for uploading all submission files at once
 */
const uploadMultipleFiles = async (
  email: string,
  submissionId: string,
  files: Array<{ key: keyof SubmissionFormObject; file: File }>
): Promise<Record<string, string>> => {
  const uploadPromises = files.map(async ({ key, file }) => {
    const url = await uploadSingleFile(email, key, submissionId, file);
    return { key, url };
  });

  const results = await Promise.all(uploadPromises);

  return results.reduce(
    (acc, { key, url }) => {
      acc[key] = url;
      return acc;
    },
    {} as Record<string, string>
  );
};

/**
 * Copy file (create a new stored copy from existing UUID)
 * Useful for duplicating submissions or templates
 */
const copyFile = async (sourceUuid: string): Promise<string> => {
  if (!UPLOADCARE_PUBLIC_KEY) {
    throw new UploadcareError('Uploadcare public key not configured');
  }

  const formData = new FormData();
  formData.append('UPLOADCARE_PUB_KEY', UPLOADCARE_PUBLIC_KEY);
  formData.append('source', sourceUuid);
  formData.append('UPLOADCARE_STORE', '1');

  try {
    const response = await fetch('https://upload.uploadcare.com/from_url/', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new UploadcareError(`Copy failed: ${response.statusText}`);
    }

    const result = await response.json();
    return generateCdnUrl(result.uuid);
  } catch (error) {
    throw new UploadcareError(
      `Copy failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

// Implementation of the FileStorageApiInterface
export const uploadcareStorageApi: FileStorageApiInterface = {
  uploadSingleFile: async (
    email: string,
    key: keyof SubmissionFormObject,
    submissionId: string,
    file: File
  ): Promise<string> => {
    return await uploadSingleFile(email, key, submissionId, file);
  },
};

// Export utilities for advanced usage
export const uploadcareUtils = {
  uploadWithProgress: uploadSingleFileWithProgress,
  uploadMultiple: uploadMultipleFiles,
  getFileInfo,
  deleteFile,
  copyFile,
  generateCdnUrl,
};

// Export error class for error handling
export { UploadcareError };
