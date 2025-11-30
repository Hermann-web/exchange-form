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

import { z } from 'zod';

// =============================================================================
// 2. Choice Structure (Vertical & Nested)
// =============================================================================

export const SchoolChoiceSchema = z.object({
  schoolName: z.custom<School>(),
  academicPath: z.string(),
  careerPath: z.string(),
  electives: z.string(),
});

export interface SchoolChoice extends z.infer<typeof SchoolChoiceSchema> {}

export const PersonalSubmissionFormMetaSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  nationality: z.custom<Nationality>(),
  email: z.string().email(),
});

export interface PersonalSubmissionFormMeta
  extends z.infer<typeof PersonalSubmissionFormMetaSchema> {}

export const SchoolSubmissionFormMetaSchema = z.object({
  choice1: SchoolChoiceSchema,
  choice2: SchoolChoiceSchema,
});

export interface SchoolSubmissionFormMeta
  extends z.infer<typeof SchoolSubmissionFormMetaSchema> {}

export const SubmissionFormMetaSchema = PersonalSubmissionFormMetaSchema.extend(
  SchoolSubmissionFormMetaSchema.shape
);

export type SubmissionFormMeta = z.infer<typeof SubmissionFormMetaSchema>;

export const SubmissionFormObjectSchema = z.object({
  applicationFormEcc: z.instanceof(File),
  applicationFormGec: z.instanceof(File).optional().nullable(),
  resumePdf: z.instanceof(File),
  s5Transcripts: z.instanceof(File),
  s6Transcripts: z.instanceof(File),
  s7Transcripts: z.instanceof(File).optional().nullable(),
  s8Transcripts: z.instanceof(File).optional().nullable(),
  residencePermit: z.instanceof(File).optional().nullable(),
  motivationLetterChoice1: z.instanceof(File),
  motivationLetterChoice2: z.instanceof(File).optional().nullable(),
  frenchLevelCertificate: z.instanceof(File),
  englishLevelCertificate: z.instanceof(File),
  passeportPdf: z.instanceof(File),
  otherFilesPdf: z.instanceof(File).optional().nullable(),
});

export interface SubmissionFormObject
  extends z.infer<typeof SubmissionFormObjectSchema> {}

export const SubmissionFormSchema = SubmissionFormMetaSchema.extend(
  SubmissionFormObjectSchema.shape
);

export type SubmissionForm = z.infer<typeof SubmissionFormSchema>;

// API Responses
export const SubmissionFormObjectUrlsSchema = z.object({
  applicationFormEccUrl: z.string(),
  applicationFormGecUrl: z.string().optional().nullable(),
  resumeUrl: z.string(),
  s5TranscriptsUrl: z.string(),
  s6TranscriptsUrl: z.string(),
  s7TranscriptsUrl: z.string().optional().nullable(),
  s8TranscriptsUrl: z.string().optional().nullable(),
  residencePermitUrl: z.string().optional().nullable(),
  motivationLetterChoice1Url: z.string(),
  motivationLetterChoice2Url: z.string().optional().nullable(),
  frenchLevelCertificateUrl: z.string(),
  englishLevelCertificateUrl: z.string(),
  passeportUrl: z.string(),
  otherFilesPdfUrl: z.string().optional().nullable(),
});

export interface SubmissionFormObjectUrls
  extends z.infer<typeof SubmissionFormObjectUrlsSchema> {}

export const SubmissionDataSchema = SubmissionFormMetaSchema.extend(
  SubmissionFormObjectUrlsSchema.shape
).extend({
  createdAt: z.string(),
});

export interface SubmissionData extends z.infer<typeof SubmissionDataSchema> {}

export const SubmissionMetaDbSchema = SubmissionDataSchema.extend({
  databaseId: z.string(),
});

export interface SubmissionMetaDb extends z.infer<typeof SubmissionMetaDbSchema> {}

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
