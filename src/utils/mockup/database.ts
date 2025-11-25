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
  school1: { schoolName: 'centrale_supelec', thematicSequence: 'thematicSequence1' },
  school2: { schoolName: 'centrale_lyon', thematicSequence: 'thematicSequence2' },
  applicationFormUrl: 'https://mock-db.com/application-form.pdf',
  resumeUrl: 'https://mock-db.com/resumePdf.pdf',
  s5TranscriptsUrl: 'https://mock-db.com/s5-transcripts.pdf',
  s6TranscriptsUrl: 'https://mock-db.com/s6-transcripts.pdf',
  school1LearningAgreementUrl: 'https://mock-db.com/school1-learning-agreement.pdf',
  residencePermitUrl: 'https://mock-db.com/residence-permit.pdf',
  school2LearningAgreementUrl: 'https://mock-db.com/school2-learning-agreement.pdf',
  otherFilesPdfUrl: 'https://mock-db.com/other-files.pdf',
  passeportUrl: 'https://mock-db.com/passeportPdf.pdf',
  createdAt: new Date().toISOString(),
};

export const databaseApi: DataBaseApiInterface = {
  async saveSubmission(submissionData: SubmissionData): Promise<SubmissionMetaDb> {
    console.log('[MockDatabase] Saving submission', submissionData);
    return {
      ...submissionData,
      databaseId: MOCK_DB_ID,
      metadataUrl: 'https://mock-db.com/metadata.json',
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
        metadataUrl: 'https://mock-db.com/metadata.json',
      };
    }
    return null;
  },

  async listAllSubmissions(): Promise<SubmissionMetaDb[]> {
    console.log('[MockDatabase] List all submissions');
    return [];
  },
};
