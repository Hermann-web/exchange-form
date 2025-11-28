// src/utils/cloudinary/filestorage.ts
import type {
  FileStorageApiInterface,
  SubmissionFormObject,
} from '@/types/submissionapi';

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// Response type from Cloudinary
export interface CloudinaryUploadResponse {
  secure_url: string;
  url: string;
  public_id: string;
  format: string;
  bytes: number;
  resource_type: string;
  pages?: number;
}

export class CloudinaryError extends Error {
  status?: number;
  details?: unknown;

  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = 'CloudinaryError';
    this.status = status;
    this.details = details;
  }
}

/**
 * Create folder path
 * submissions/{sanitized email}/{submissionId}/{label}
 */
const generateFolder = (email: string, submissionId: string, label: string): string => {
  const safeEmail = email.replace(/[@.]/g, '_');
  return `submissions/${safeEmail}/${submissionId}/${label}`;
};

/**
 * Upload a single file to Cloudinary
 */
const uploadSingleFile = async (
  email: string,
  label: string,
  submissionId: string,
  file: File
): Promise<string> => {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new CloudinaryError('Cloudinary configuration missing');
  }

  const folder = generateFolder(email, submissionId, label);

  // Base filename without extension
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  // Keep a clean public id that Cloudinary will place inside the folder
  const publicId = baseName;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', folder);
  formData.append('public_id', publicId);

  // Metadata
  formData.append('tags', `submission,${label},${submissionId}`);
  formData.append(
    'context',
    `email=${email}|label=${label}|submissionId=${submissionId}`
  );

  // Use the auto resource type for everything including pdf and docx
  const isPdf = file.type === 'application/pdf';
  const resourceType = isPdf ? 'raw' : 'auto';

  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;
  let response;
  try {
    response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });
  } catch (err) {
    throw new CloudinaryError(
      `Network error during upload: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  if (!response.ok) {
    let message = `${response.status}`;
    try {
      const errData = await response.json();
      if (errData.error?.message) {
        message = errData.error.message;
      }
    } catch {
      /* ignore json parse errors */
    }
    throw new CloudinaryError(message, response.status);
  }

  const result = (await response.json()) as CloudinaryUploadResponse;

  // Return the public url from Cloudinary response
  return result.secure_url;
};

export const cloudinaryStorageApi: FileStorageApiInterface = {
  async uploadSingleFile(
    email: string,
    key: keyof SubmissionFormObject,
    submissionId: string,
    file: File
  ): Promise<string> {
    return await uploadSingleFile(email, key, submissionId, file);
  },
};
