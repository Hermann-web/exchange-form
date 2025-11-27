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
  s9_enit: '3A ENIT',
  s9_enise: '3A ENISE',
  s9_ensimag: 'S9 ENSIMAG',

  // Double Degrees
  dd_centrale_supelec: 'DD CentraleSupélec',
  dd_centrale_lille: 'DD Centrale Lille',
  dd_centrale_mediterranee: 'DD Centrale Méditerranée',
  dd_georgia_tech: 'DD Georgia Tech',
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

export interface FieldConfig {
  text: string;
  required: boolean;
  options?: string[];
}

export interface SchoolConfig {
  academicPath: FieldConfig;
  careerPath: FieldConfig;
  electives: FieldConfig;
}

// for each school, naming of academicPath and careerPath and electives is different
// for each school, if academicPath is required and if careerPath is required and if electives is required
// combine in a single map
// schoolFieldConfiguration
export const schoolAcademicPathKeyAndRequiredMap: Record<School, SchoolConfig> = {
  // --- GEC Schools (Option + Filière) ---
  s9_centrale_supelec_rennes: {
    academicPath: {
      text: 'Option',
      required: true,
      options: ['Mathématiques', 'Informatique', 'Physique'],
    }, // Example list
    careerPath: { text: 'Filière Métier', required: true },
    electives: { text: '', required: false },
  },
  s9_centrale_supelec_metz: {
    academicPath: { text: 'Option', required: true },
    careerPath: { text: 'Filière Métier', required: true },
    electives: { text: '', required: false },
  },
  s9_centrale_supelec_gif: {
    academicPath: { text: 'Option', required: true },
    careerPath: { text: 'Filière Métier', required: true },
    electives: { text: '', required: false },
  },
  s9_centrale_mediterranee: {
    academicPath: { text: 'Option', required: true },
    careerPath: { text: 'Filière Métier', required: true },
    electives: { text: '', required: false },
  },
  s9_centrale_nantes: {
    academicPath: { text: 'Option', required: true },
    careerPath: { text: 'Filière Métier', required: true },
    electives: { text: '', required: false },
  },
  s9_centrale_lille: {
    academicPath: { text: 'Option', required: true },
    careerPath: { text: 'Filière Métier', required: true },
    electives: { text: '', required: false },
  },
  s9_centrale_lyon: {
    academicPath: { text: 'Option', required: true },
    careerPath: { text: 'Filière Métier', required: true },
    electives: { text: '', required: false },
  },

  // --- Exception: Centrale Pekin (Has Electives) ---
  s9_centrale_pekin: {
    academicPath: { text: 'Option', required: true },
    careerPath: { text: 'Filière Métier', required: true },
    electives: {
      text: 'Electives',
      required: true,
      options: ['Robotics', 'AI', 'Energy'],
    }, // Example
  },

  // --- Non-GEC (Filiere OR Voie+Parcours) ---
  s9_ensimag: {
    academicPath: { text: 'Filière', required: true },
    careerPath: { text: '', required: false }, // Single field required
    electives: { text: '', required: false },
  },
  s9_enise: {
    academicPath: { text: 'Master', required: true },
    careerPath: { text: 'Parcours', required: true },
    electives: { text: '', required: false },
  },
  s9_enit: {
    academicPath: { text: 'Filière', required: true },
    careerPath: { text: 'Option', required: true },
    electives: { text: '', required: false },
  },

  // --- Double Degrees (Voie+Parcours OR Voie) ---
  dd_georgia_tech: {
    academicPath: { text: 'Voie de Spécialisation', required: true },
    careerPath: { text: 'Parcours', required: true },
    electives: { text: '', required: false },
  },
  dd_centrale_lille: {
    academicPath: { text: 'Voie de Spécialisation', required: true },
    careerPath: { text: '', required: false },
    electives: { text: '', required: false },
  },
  dd_centrale_mediterranee: {
    academicPath: { text: 'Voie de Spécialisation', required: true },
    careerPath: { text: 'Parcours', required: true },
    electives: { text: '', required: false },
  },
  dd_centrale_supelec: {
    academicPath: { text: 'Voie de Spécialisation', required: true },
    careerPath: { text: '', required: false },
    electives: { text: '', required: false },
  },
  dd_uppa: {
    academicPath: { text: 'Voie de Spécialisation', required: true },
    careerPath: { text: 'Parcours', required: true },
    electives: { text: '', required: false },
  },

  // // --- Digital Lab (No fields) ---
  // digital_lab_lyon: {
  //   academicPath: { text: '', required: false },
  //   careerPath: { text: '', required: false },
  //   electives: { text: '', required: false },
  // },

  unset: {
    academicPath: { text: '', required: false },
    careerPath: { text: '', required: false },
    electives: { text: '', required: false },
  },
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

// map from SubmissionFormObject to SubmissionFormObjectUrls
export const SubmissionFormObjectUrlsMap: Record<
  keyof SubmissionFormObject,
  keyof SubmissionFormObjectUrls
> = {
  applicationFormEcc: 'applicationFormEccUrl',
  applicationFormGec: 'applicationFormGecUrl',
  resumePdf: 'resumeUrl',
  s5Transcripts: 's5TranscriptsUrl',
  s6Transcripts: 's6TranscriptsUrl',
  s7Transcripts: 's7TranscriptsUrl',
  s8Transcripts: 's8TranscriptsUrl',
  residencePermit: 'residencePermitUrl',
  motivationLetterChoice1: 'motivationLetterChoice1Url',
  motivationLetterChoice2: 'motivationLetterChoice2Url',
  frenchLevelCertificate: 'frenchLevelCertificateUrl',
  englishLevelCertificate: 'englishLevelCertificateUrl',
  passeportPdf: 'passeportUrl',
  otherFilesPdf: 'otherFilesPdfUrl',
};

// map from choice key to learning agreement field name
export const SchoolLearningAgreementKeyMap: Record<
  keyof SchoolSubmissionFormMeta,
  keyof SubmissionFormObject
> = {
  choice1: 'motivationLetterChoice1',
  choice2: 'motivationLetterChoice2',
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
