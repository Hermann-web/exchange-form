// for each school, naming of academicPath and careerPath and electives is different
// for each school, if academicPath is required and if careerPath is required and if electives is required
// combine in a single map

import type {
  School,
  SchoolSubmissionFormMeta,
  SubmissionFormObject,
  SubmissionFormObjectUrls,
} from './submissionapi';

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
