// src/types/submission.ts

export interface SubmissionForm {
  firstName: string;
  lastName: string;

  // Nationality: only 2 values allowed
  nationality: 'moroccan' | 'other';

  // Email must end with @centrale-casablanca.ma (checked in validation)
  email: string;

  // File uploads
  applicationFormDocx: File; // .docx file
  resumePdf: File; // .pdf file
  s5Transcripts: File; // 2-page PDF
  s6Transcripts: File; // 2-page PDF
  residencePermit?: File; // required only for non-Moroccans, .pdf

  // Mobility choices
  mobilityChoices: Choice[];
}

export interface Choice {
  school: School;
  program: string;
  thematicSequence?: string; // only if school = centrale_supelec
  electives?: Elective[];
}

export type School =
  | 'centrale_casablanca'
  | 'centrale_supelec'
  | 'centrale_nantes'
  | 'centrale_lille'
  | 'centrale_marseille'
  | 'centrale_lyon';


export interface Elective {
  name: string;
  ects?: number;
}

// API Responses
export interface SubmissionResponse {
  id: string; // unique ID for submission (e.g., folder ID in Firebase)
  applicationFormUrl: string; // public download URL for application form
  resumeUrl: string; // public download URL for CV
  s5TranscriptsUrl: string; // public download URL for S5 transcripts
  s6TranscriptsUrl: string; // public download URL for S6 transcripts
  residencePermitUrl?: string; // if applicable
  metadataUrl?: string; // URL to JSON metadata file (if stored in Firebase)        metadataUrl?: string;        // URL to JSON metadata file (if stored in Firebase)
  createdAt: string; // timestamp
}

export interface SubmissionSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  schoolChoices: Choice[];
  submittedAt: string;
  applicationFormUrl: string;
  resumeUrl: string;
  s5TranscriptsUrl: string;
  s6TranscriptsUrl: string;
  residencePermitUrl?: string;
}

// API Interface Definitions

export interface SubmissionApiInterface {
  // Upload a new submission (files + metadata)
  submit(formData: SubmissionForm): Promise<SubmissionResponse>;

  // (Optional) fetch submissions for the logged-in user
  getMySubmissions(): Promise<SubmissionSummary[]>;

  // (Optional) admin: list all submissions
  listAllSubmissions?(): Promise<SubmissionSummary[]>;
}
