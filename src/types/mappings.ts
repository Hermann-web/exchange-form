// src/types/mappings.ts

import type {
  School,
  SchoolSubmissionFormMeta,
  SubmissionFormObject,
  SubmissionFormObjectUrls,
} from './submissionapi';

export interface FieldConfig {
  required: boolean;
  options?: string[];
  uiSplit: [] | [string] | [string, string];
}

export interface FieldConfig2 {
  required: boolean;
  options?: string[];
  uiSplit: [] | [string];
}

export interface SchoolConfig {
  academicPath: FieldConfig;
  careerPath: FieldConfig2;
  electives: FieldConfig2;
}

// for each school, naming of academicPath and careerPath and electives is different
// for each school, if academicPath is required and if careerPath is required and if electives is required
// combine in a single map
export const schoolAcademicPathKeyAndRequiredMap: Record<School, SchoolConfig> = {
  // --- GEC Schools (Option + Filière) ---
  s9_centrale_supelec_rennes: {
    academicPath: {
      uiSplit: ['Option'],
      required: true,
      options: ['Mathématiques', 'Informatique', 'Physique'],
    }, // Example list
    careerPath: { uiSplit: ['Filière Métier'], required: true },
    electives: { uiSplit: [], required: false },
  },
  s9_centrale_supelec_metz: {
    academicPath: { uiSplit: ['Option'], required: true },
    careerPath: { uiSplit: ['Filière Métier'], required: true },
    electives: { uiSplit: [], required: false },
  },
  s9_centrale_supelec_gif: {
    academicPath: { uiSplit: ['Option'], required: true },
    careerPath: { uiSplit: ['Filière Métier'], required: true },
    electives: { uiSplit: [], required: false },
  },
  s9_centrale_mediterranee: {
    academicPath: { uiSplit: ['Option'], required: true },
    careerPath: { uiSplit: ['Filière Métier'], required: true },
    electives: { uiSplit: [], required: false },
  },
  s9_centrale_nantes: {
    academicPath: { uiSplit: ['Option'], required: true },
    careerPath: { uiSplit: ['Filière Métier'], required: true },
    electives: { uiSplit: [], required: false },
  },
  s9_centrale_lille: {
    academicPath: { uiSplit: ['Option'], required: true },
    careerPath: { uiSplit: ['Filière Métier'], required: true },
    electives: { uiSplit: [], required: false },
  },
  s9_centrale_lyon: {
    academicPath: { uiSplit: ['Option'], required: true },
    careerPath: { uiSplit: ['Filière Métier'], required: true },
    electives: { uiSplit: [], required: false },
  },

  // --- Exception: Centrale Pekin (Has Electives) ---
  s9_centrale_pekin: {
    academicPath: { uiSplit: [''], required: false },
    careerPath: { uiSplit: [''], required: false },
    electives: {
      uiSplit: ['Electifs Centrale Pékin + Electifs BUAA'],
      required: true,
      options: ['Robotics', 'AI', 'Energy'],
    },
  },

  // --- Non-GEC (Filiere OR Voie+Parcours) ---
  // only one specialisation // unknown tracks
  s9_ensimag: {
    academicPath: {
      uiSplit: ['Filière'],
      required: true,
      options: ['MMIS (Filière Modélisation mathématique, image, simulation)'],
    },
    careerPath: { uiSplit: [], required: false }, // Single field required
    electives: { uiSplit: [], required: false },
  },
  // unknown specialisations // unknown tracks
  s9_ensae: {
    academicPath: { uiSplit: ['Voie de spécialisation'], required: true },
    careerPath: { uiSplit: [], required: false }, // Single field required
    electives: { uiSplit: [], required: false },
  },
  // unknown specialisations // unknown tracks
  s9_enise: {
    academicPath: {
      uiSplit: ['Master 2', 'Parcours'],
      required: true,
    },
    careerPath: { uiSplit: [], required: false },
    electives: { uiSplit: [], required: false },
  },
  // unknown specialisations // unknown tracks
  s9_enit: {
    academicPath: { uiSplit: ['Filière'], required: true },
    careerPath: { uiSplit: [], required: false },
    electives: { uiSplit: [], required: false },
  },

  // --- Double Degrees (Voie+Parcours OR Voie) ---
  // only one specialisation // known tracks
  dd_georgia_tech: {
    academicPath: {
      uiSplit: ['voie de spécialisation + Parcours'],
      required: true,
      options: [
        'Master of Science degree / Aerospace Engineering',
        'Master of Science degree / Electrical and Computer Engineering',
        'Master of Science degree / Mechanical Engineering',
      ],
    },
    careerPath: { uiSplit: [], required: false },
    electives: { uiSplit: [], required: false },
  },
  // only one specialisation // unknown tracks
  dd_centrale_lille: {
    academicPath: {
      uiSplit: ['Voie de Spécialisation'],
      required: true,
      options: ['Master Sciences des données'],
    },
    careerPath: { uiSplit: [], required: false },
    electives: { uiSplit: [], required: false },
  },
  // only one specialisation // known tracks
  dd_centrale_mediterranee: {
    academicPath: {
      uiSplit: ['Voie de Spécialisation + Parcours'],
      required: true,
      options: [
        'Master of science and technology in complex systems / Parcours Environmental Engineering',
        'Master of science and technology in complex systems / Parcours Biomedical Engineering',
      ],
    },
    careerPath: { uiSplit: [], required: false },
    electives: { uiSplit: [], required: false },
  },
  // only one specialisation // unknown tracks
  dd_centrale_supelec: {
    academicPath: {
      uiSplit: ['Voie de Spécialisation'],
      required: true,
      options: ['Master of Science engineering in Artificial Intelligence'],
    },
    careerPath: { uiSplit: [], required: false },
    electives: { uiSplit: [], required: false },
  },
  // unknown specialisations // unknown tracks
  dd_politecnico_milano: {
    academicPath: { uiSplit: ['Voie de Spécialisation'], required: true },
    careerPath: { uiSplit: [], required: false },
    electives: { uiSplit: [], required: false },
  },
  // unknown specialisations // unknown tracks
  dd_politecnico_torino: {
    academicPath: { uiSplit: ['Voie de Spécialisation'], required: true },
    careerPath: { uiSplit: [], required: false },
    electives: { uiSplit: [], required: false },
  },
  // unknown specialisations // unknown tracks
  dd_audencia: {
    academicPath: { uiSplit: ['Voie de Spécialisation'], required: true },
    careerPath: { uiSplit: [], required: false },
    electives: { uiSplit: [], required: false },
  },
  // only one specialisation // only one track
  dd_uppa: {
    academicPath: {
      uiSplit: ['Voie de Spécialisation + Parcours'],
      required: true,
      options: [
        'Master mention informatique / Parcours Systèmes Informatiques pour le Génie de la Logistique Industrielle et des Services (SIGLIS) (M1+M2)',
      ],
    },
    careerPath: { uiSplit: [], required: false },
    electives: { uiSplit: [], required: false },
  },

  // // --- Digital Lab (No fields) ---
  // digital_lab_lyon: {
  //   academicPath: { uiSplit: [], required: false },
  //   careerPath: { uiSplit: [], required: false },
  //   electives: { uiSplit: [], required: false },
  // },

  unset: {
    academicPath: { uiSplit: [], required: false },
    careerPath: { uiSplit: [], required: false },
    electives: { uiSplit: [], required: false },
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
