// src/types/submissionapi.ts

export const schoolLabels = {
  s9_centrale_supelec_gif: 'CentraleSupélec (Gif)',
  s9_centrale_supelec_metz: 'CentraleSupélec (Metz)',
  s9_centrale_supelec_rennes: 'CentraleSupélec (Rennes)',
  s9_centrale_nantes: 'Centrale Nantes',
  s9_centrale_lille: 'Centrale Lille',
  s9_centrale_mediterranee: 'Centrale Méditerranée',
  s9_centrale_lyon: 'Centrale Lyon',
  s9_centrale_pekin: 'Centrale Pékin',
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
  academicPath: string; // option ou voie de spécialisation
  careerPath: string; // filière Métier ou parcours
}

// for each school, naming of academicPath and careerPath is different
export const schoolAcademicPathKeyMap: Record<
  School,
  { academicPath: string; careerPath: string }
> = {
  s9_centrale_supelec_rennes: { academicPath: 'Option', careerPath: 'Filière Métier' },
  s9_centrale_supelec_metz: { academicPath: 'Option', careerPath: 'Filière Métier' },
  s9_centrale_supelec_gif: { academicPath: 'Option', careerPath: 'Filière Métier' },
  s9_centrale_mediterranee: { academicPath: 'Option', careerPath: 'Filière Métier' },
  s9_centrale_nantes: { academicPath: 'Option', careerPath: 'Filière Métier' },
  s9_centrale_lille: { academicPath: 'Option', careerPath: 'Filière Métier' },
  s9_centrale_lyon: { academicPath: 'Option', careerPath: 'Filière Métier' },
  s9_centrale_pekin: { academicPath: 'Option', careerPath: 'Filière Métier' },
  unset: { academicPath: '', careerPath: '' },
};

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
  choice1: SchoolChoice;
  choice2: SchoolChoice;
}

export type SubmissionFormMeta = PersonalSubmissionFormMeta & SchoolSubmissionFormMeta;

export interface SubmissionFormObject {
  // File uploads
  applicationFormDocx: File; // .docx file
  resumePdf: File; // .pdf file
  s5Transcripts: File; // 2-page PDF
  s6Transcripts: File; // 2-page PDF
  residencePermit?: File; // required only for non-Moroccans, .pdf
  choice1LearningAgreement: File; // pdf
  choice2LearningAgreement?: File; // pdf
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
  choice1LearningAgreementUrl: string; // pdf
  choice2LearningAgreementUrl?: string; // pdf
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
  choice1LearningAgreement: 'choice1LearningAgreementUrl',
  choice2LearningAgreement: 'choice2LearningAgreementUrl',
  passeportPdf: 'passeportUrl',
  otherFilesPdf: 'otherFilesPdfUrl',
};

// map from choice key to learning agreement field name
export const SchoolLearningAgreementKeyMap: Record<
  keyof SchoolSubmissionFormMeta,
  keyof SubmissionFormObject
> = {
  choice1: 'choice1LearningAgreement',
  choice2: 'choice2LearningAgreement',
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
