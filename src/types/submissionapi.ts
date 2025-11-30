// src/types/submissionapi.ts

// =============================================================================
// 1. Enums and Constants
// =============================================================================

export const schoolLabels = {
  // GEC
  s9_centrale_supelec_gif: '3A CentraleSupélec (Gif)',
  s9_centrale_supelec_metz: '3A CentraleSupélec (Metz)',
  s9_centrale_supelec_rennes: '3A CentraleSupélec (Rennes)',
  s9_centrale_nantes: '3A Centrale Nantes',
  s9_centrale_lille: '3A Centrale Lille',
  s9_centrale_mediterranee: '3A Centrale Méditerranée',
  s9_centrale_lyon: '3A Centrale Lyon',
  s9_centrale_pekin: '3A Centrale Pékin', // Has Electives

  // Non-GEC / Other
  s9_enit: '3A ENIT (Ecole des Ingénieurs de Tunis)',
  s9_enise:
    '3A ENISE (Ecole Nationale des Ingénieurs de Saint Etienne - Au sein de l’École Centrale de Lyon)',
  s9_ensimag:
    'S9 ENSIMAG (Ecole Nationale Supérieure d’Informatique et de Mathématique Appliquée à Grenoble)',
  s9_ensae:
    '3A ENSAE (Ecole Nationale des Statistiques et de l’Administration Economique )',

  // Double Degrees
  dd_centrale_supelec: 'DD CentraleSupélec',
  dd_centrale_lille: 'DD Centrale Lille',
  dd_centrale_mediterranee: 'DD Centrale Méditerranée',
  dd_georgia_tech: 'DD Georgia Tech University',
  dd_audencia: 'DD Audencia Business School',
  dd_politecnico_milano: 'DD Politecnico di Milano',
  dd_politecnico_torino: 'DD Politecnico di Torino',
  dd_uppa: "DD Université de Pau et des Pays de l'Adour",

  // // Special
  // digital_lab_lyon: "Digital Lab Lyon",
  // digital_lab_marseille: "Digital Lab Marseille",
  // digital_lab_paris: "Digital Lab Paris",

  unset: 'Aucun',
} as const;

export const nationalityLabels = {
  moroccan: 'Marocaine',
  other: 'Internationale',
} as const;

export const civilityLabels = {
  mr: 'Mr',
  mme: 'Mme',
} as const;

export type School = keyof typeof schoolLabels;
export type Nationality = keyof typeof nationalityLabels;
export type Civility = keyof typeof civilityLabels;

// =============================================================================
// 2. Choice Structure (Vertical & Nested)
// =============================================================================

export interface SchoolChoice {
  schoolName: School;
  academicPath: string; // Maps to: Dominante + Option, Voie de spécialisation + Parcours, etc.
  careerPath: string; // Maps to: Filière Métier, etc.
  electives: string; // Specific for Centrale Pekin (Multi-choice) ";" separated string
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
  choice1: SchoolChoice;
  choice2: SchoolChoice;
}

export type SubmissionFormMeta = PersonalSubmissionFormMeta & SchoolSubmissionFormMeta;

export interface SubmissionFormObject {
  // File uploads
  applicationFormEcc: File; // .docx file
  applicationFormGec?: File; // .docx file
  resumePdf: File; // .pdf file
  s5Transcripts: File; // 2-page PDF
  s6Transcripts: File; // 2-page PDF
  s7Transcripts?: File; // 2-page PDF
  s8Transcripts?: File; // 2-page PDF
  residencePermit?: File; // required only for non-Moroccans, .pdf
  motivationLetterChoice1: File; // pdf
  motivationLetterChoice2?: File; // pdf
  frenchLevelCertificate: File;
  englishLevelCertificate: File;
  passeportPdf: File; // pdf
  otherFilesPdf?: File; // pdf
}

export type SubmissionForm = SubmissionFormMeta & SubmissionFormObject;

// API Responses
export interface SubmissionFormObjectUrls {
  applicationFormEccUrl: string; // public download URL for application form
  applicationFormGecUrl?: string; // public download URL for application form
  resumeUrl: string; // public download URL for CV
  s5TranscriptsUrl: string; // public download URL for S5 transcripts
  s6TranscriptsUrl: string; // public download URL for S6 transcripts
  s7TranscriptsUrl?: string; // public download URL for S7 transcripts
  s8TranscriptsUrl?: string; // public download URL for S8 transcripts
  residencePermitUrl?: string; // if applicable
  motivationLetterChoice1Url: string; // pdf
  motivationLetterChoice2Url?: string; // pdf
  frenchLevelCertificateUrl: string;
  englishLevelCertificateUrl: string;
  passeportUrl: string; // pdf
  otherFilesPdfUrl?: string; // pdf
}

export interface SubmissionData extends SubmissionFormMeta, SubmissionFormObjectUrls {
  // storageId: string; // unique ID for submission (e.g., folder ID in Firebase)
  createdAt: string; // timestamp
}

export interface SubmissionMetaDb extends SubmissionData {
  databaseId: string;
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
