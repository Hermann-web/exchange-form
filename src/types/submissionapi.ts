// src/types/submissionapi.ts

export type School =
  | 'centrale_supelec'
  | 'em_lyon'
  | 'centrale_lille'
  | 'centrale_mediterranee'
  | 'centrale_lyon'
  | 'centrale_pekin'
  | 'unset';

export interface SubmissionFormMeta {
  firstName: string;
  lastName: string;

  // Nationality: only 2 values allowed
  nationality: 'moroccan' | 'other';

  // Email must end with @domain (checked in validation)
  email: string;

  // Exchange choices
  school1: School;
  thematicSequence1: string; // only if school = centrale_supelec
  electives1: string; // electives ";" separated

  school2: School;
  thematicSequence2: string; // only if school = centrale_supelec
  electives2: string; // electives ";" separated
}

export interface SubmissionFormObject {
  // File uploads
  applicationFormDocx: File; // .docx file
  resumePdf: File; // .pdf file
  s5Transcripts: File; // 2-page PDF
  s6Transcripts: File; // 2-page PDF
  residencePermit?: File; // required only for non-Moroccans, .pdf
  school1LearningAgreement: File; // pdf
  school2LearningAgreement?: File; // pdf
  passeportPdf: File; // pdf
  otherFilesPdf?: File; // pdf
}

export type SubmissionForm = SubmissionFormMeta & SubmissionFormObject;

// API Responses
export interface SubmissionFormObjectUrls {
  applicationFormUrl: string; // public download URL for application form
  resumeUrl: string; // public download URL for CV
  s5TranscriptsUrl: string; // public download URL for S5 transcripts
  s6TranscriptsUrl: string; // public download URL for S6 transcripts
  residencePermitUrl?: string; // if applicable
  school1LearningAgreementUrl: string; // pdf
  school2LearningAgreementUrl?: string; // pdf
  passeportUrl: string; // pdf
  otherFilesPdfUrl?: string; // pdf
}

export interface SubmissionData extends SubmissionFormMeta, SubmissionFormObjectUrls {
  // storageId: string; // unique ID for submission (e.g., folder ID in Firebase)
  createdAt: string; // timestamp
}

export interface SubmissionMetaDb extends SubmissionData {
  databaseId: string;
  metadataUrl: string; // URL to JSON metadata file (containing the submission response) (if stored in Firebase)
}

// API Interface Definitions

export interface FileStorageApiInterface {
  // Upload a new submission (files + json object)
  uploadFiles(formData: SubmissionForm): Promise<SubmissionData>;
}

export interface DataBaseApiInterface {
  // Save metadata to database
  saveSubmission(submissionData: SubmissionData): Promise<SubmissionMetaDb>;

  // (Optional) fetch submissions for the logged-in user
  getMySubmission(email: string): Promise<SubmissionMetaDb | null>;

  // (Optional) admin: list all submissions
  listAllSubmissions(): Promise<SubmissionMetaDb[]>;
}
