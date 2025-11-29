// for each school, naming of academicPath and careerPath and electives is different
// for each school, if academicPath is required and if careerPath is required and if electives is required
// combine in a single map

import type {
  School,
  SchoolSubmissionFormMeta,
  SubmissionFormObject,
  SubmissionFormObjectUrls,
} from './submissionapi';

export interface FieldConfig1 {
  text: string;
  required: boolean;
  options?: string[];
  uiSplit?: string[];
}

export interface FieldConfig2 {
  text: string;
  required: boolean;
  options?: string[];
}

export interface SchoolConfig {
  academicPath: FieldConfig1;
  careerPath: FieldConfig2;
  electives: FieldConfig2;
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
    academicPath: { text: 'Option', required: false },
    careerPath: { text: 'Filière Métier', required: false },
    electives: {
      text: 'Electifs Centrale Pékin + Electifs BUAA',
      required: true,
      options: ['Robotics', 'AI', 'Energy'],
    }, // Example
  },

  // --- Non-GEC (Filiere OR Voie+Parcours) ---
  // only one specialisation // unknown tracks
  s9_ensimag: {
    academicPath: {
      text: 'Filière',
      required: true,
      options: ['MMIS (Filière Modélisation mathématique, image, simulation)'],
    },
    careerPath: { text: '', required: false }, // Single field required
    electives: { text: '', required: false },
  },
  // unknown specialisations // unknown tracks
  s9_ensae: {
    academicPath: { text: 'Voie de spécialisation', required: true },
    careerPath: { text: '', required: false }, // Single field required
    electives: { text: '', required: false },
  },
  // unknown specialisations // unknown tracks
  s9_enise: {
    academicPath: {
      text: 'Voie de spécialisation + parcours',
      required: true,
      uiSplit: ['Voie de spécialisation', 'Parcours'],
    },
    careerPath: { text: '', required: false },
    electives: { text: '', required: false },
  },
  // unknown specialisations // unknown tracks
  s9_enit: {
    academicPath: { text: 'Filière', required: true },
    careerPath: { text: '', required: false },
    electives: { text: '', required: false },
  },

  // --- Double Degrees (Voie+Parcours OR Voie) ---
  // only one specialisation // known tracks
  dd_georgia_tech: {
    academicPath: {
      text: 'voie de spécialisation + Parcours',
      required: true,
      options: [
        'Master of Science degree / Aerospace Engineering',
        'Master of Science degree / Electrical and Computer Engineering',
        'Master of Science degree / Mechanical Engineering',
      ],
    },
    careerPath: { text: '', required: false },
    electives: { text: '', required: false },
  },
  // only one specialisation // unknown tracks
  dd_centrale_lille: {
    academicPath: {
      text: 'Voie de Spécialisation',
      required: true,
      options: ['Master Sciences des données'],
    },
    careerPath: { text: '', required: false },
    electives: { text: '', required: false },
  },
  // only one specialisation // known tracks
  dd_centrale_mediterranee: {
    academicPath: {
      text: 'Voie de Spécialisation + Parcours',
      required: true,
      options: [
        'Master of science and technology in complex systems / Parcours Environmental Engineering',
        'Master of science and technology in complex systems / Parcours Biomedical Engineering',
      ],
    },
    careerPath: { text: '', required: false },
    electives: { text: '', required: false },
  },
  // only one specialisation // unknown tracks
  dd_centrale_supelec: {
    academicPath: {
      text: 'Voie de Spécialisation',
      required: true,
      options: ['Master of Science engineering in Artificial Intelligence'],
    },
    careerPath: { text: '', required: false },
    electives: { text: '', required: false },
  },
  // unknown specialisations // unknown tracks
  dd_politecnico_milano: {
    academicPath: { text: 'Voie de Spécialisation', required: true, options: [''] },
    careerPath: { text: '', required: false },
    electives: { text: '', required: false },
  },
  // unknown specialisations // unknown tracks
  dd_politecnico_torino: {
    academicPath: { text: 'Voie de Spécialisation', required: true, options: [''] },
    careerPath: { text: '', required: false },
    electives: { text: '', required: false },
  },
  // unknown specialisations // unknown tracks
  dd_audencia: {
    academicPath: { text: 'Voie de Spécialisation', required: true, options: [''] },
    careerPath: { text: '', required: false },
    electives: { text: '', required: false },
  },
  // only one specialisation // only one track
  dd_uppa: {
    academicPath: {
      text: 'Voie de Spécialisation + Parcours',
      required: true,
      options: [
        'Master mention informatique / Parcours Systèmes Informatiques pour le Génie de la Logistique Industrielle et des Services (SIGLIS) (M1+M2)',
      ],
    },
    careerPath: { text: '', required: false },
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
