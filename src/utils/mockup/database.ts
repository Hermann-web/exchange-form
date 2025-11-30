// src/mockup/database.ts

import type {
  DataBaseApiInterface,
  SubmissionData,
  SubmissionMetaDb,
} from '@/types/submissionapi';

const MOCK_DB_ID = 'mock-db-id-123';

const MOCK_SUBMISSION_DATA: SubmissionData = {
  firstName: 'Mock',
  lastName: 'User',
  nationality: 'moroccan',
  email: `mock.mock@${import.meta.env.VITE_ALLOWED_EMAIL_DOMAIN}`,
  choice1: {
    schoolName: 's9_centrale_supelec_gif',
    academicPath: 'Artificial Intelligence',
    careerPath: '',
    electives: '',
  },
  choice2: {
    schoolName: 's9_centrale_lyon',
    academicPath: 'Cybersecurity',
    careerPath: '',
    electives: '',
  },
  applicationFormEccUrl: 'https://mock-db.com/application-form.pdf',
  applicationFormGecUrl: 'https://mock-db.com/application-form.pdf',
  resumeUrl: 'https://mock-db.com/resumePdf.pdf',
  s5TranscriptsUrl: 'https://mock-db.com/s5-transcripts.pdf',
  s6TranscriptsUrl: 'https://mock-db.com/s6-transcripts.pdf',
  motivationLetterChoice1Url: 'https://mock-db.com/choice1-learning-agreement.pdf',
  residencePermitUrl: 'https://mock-db.com/residence-permit.pdf',
  motivationLetterChoice2Url: 'https://mock-db.com/choice2-learning-agreement.pdf',
  otherFilesPdfUrl: 'https://mock-db.com/other-files.pdf',
  frenchLevelCertificateUrl: 'https://mock-db.com/french-level-certificate.pdf',
  englishLevelCertificateUrl: 'https://mock-db.com/english-level-certificate.pdf',
  passeportUrl: 'https://mock-db.com/passeportPdf.pdf',
  createdAt: new Date().toISOString(),
};

export const databaseApi: DataBaseApiInterface = {
  async saveSubmission(submissionData: SubmissionData): Promise<SubmissionMetaDb> {
    console.log('[MockDatabase] Saving submission', submissionData);
    return {
      ...submissionData,
      databaseId: MOCK_DB_ID,
    };
  },

  async getMySubmission(email: string): Promise<SubmissionMetaDb | null> {
    console.log('[MockDatabase] Get submission for', email);
    const MOCKUP_SUBMISSION_STATUS =
      import.meta.env.VITE_MOCKUP_SUBMISSION_STATUS === 'true';

    if (MOCKUP_SUBMISSION_STATUS) {
      return {
        ...MOCK_SUBMISSION_DATA,
        databaseId: MOCK_DB_ID,
      };
    }
    return null;
  },

  async listAllSubmissions(): Promise<SubmissionMetaDb[]> {
    console.log('[MockDatabase] List all submissions');
    return [];
  },
};
