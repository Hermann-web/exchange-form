// src/types/submissionapi.ts

export const schoolLabels = {
  centrale_supelec: 'CentraleSupélec',
  em_lyon: 'EM Lyon',
  centrale_lille: 'Centrale Lille',
  centrale_mediterranee: 'Centrale Méditerranée',
  centrale_lyon: 'Centrale Lyon',
  centrale_pekin: 'Centrale Pékin',
  unset: 'Aucun',
} as const;

export const nationalityLabels = {
  moroccan: 'Moroccan',
  other: 'Other',
} as const;

export type School = keyof typeof schoolLabels;
export type Nationality = keyof typeof nationalityLabels;

export interface SchoolChoice {
  schoolName: School;
  thematicSequence: string; // only if school = centrale_supelec or centrale_mediterranee
}

export interface PersonalSubmissionFormMeta {
  firstName: string;
  lastName: string;

  // Nationality: only 2 values allowed
  nationality: Nationality;

  // Email must end with @domain (checked in validation)
  email: string;
}

export interface SchoolSubmissionFormMeta {
  // Exchange choices (vertical structure)
  school1: SchoolChoice;
  school2: SchoolChoice;
}

export type SubmissionFormMeta = PersonalSubmissionFormMeta & SchoolSubmissionFormMeta;

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

// map from SubmissionFormObject to SubmissionFormObjectUrls
export const SubmissionFormObjectUrlsMap: Record<
  keyof SubmissionFormObject,
  keyof SubmissionFormObjectUrls
> = {
  applicationFormDocx: 'applicationFormUrl',
  resumePdf: 'resumeUrl',
  s5Transcripts: 's5TranscriptsUrl',
  s6Transcripts: 's6TranscriptsUrl',
  residencePermit: 'residencePermitUrl',
  school1LearningAgreement: 'school1LearningAgreementUrl',
  school2LearningAgreement: 'school2LearningAgreementUrl',
  passeportPdf: 'passeportUrl',
  otherFilesPdf: 'otherFilesPdfUrl',
};

// Helper function to map school key to learning agreement field name
export const getSchoolLearningAgreementKey = (
  schoolKey: 'school1' | 'school2'
): keyof SubmissionFormObject => {
  return `${schoolKey}LearningAgreement` as keyof SubmissionFormObject;
};

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
  // async func to upload a single SubmissionFormObject
  uploadSingleFile(
    email: string,
    key: keyof SubmissionFormObject,
    submissionId: string,
    file: File
  ): Promise<string>;
}

export interface DataBaseApiInterface {
  // Save metadata to database
  saveSubmission(submissionData: SubmissionData): Promise<SubmissionMetaDb>;

  // (Optional) fetch submissions for the logged-in user
  getMySubmission(email: string): Promise<SubmissionMetaDb | null>;

  // (Optional) admin: list all submissions
  listAllSubmissions(): Promise<SubmissionMetaDb[]>;
}
