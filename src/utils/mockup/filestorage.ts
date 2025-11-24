import type {
  FileStorageApiInterface,
  SubmissionForm,
  SubmissionData,
} from '@/types/submissionapi';

export const fileStorageApi: FileStorageApiInterface = {
  async uploadFiles(formData: SubmissionForm): Promise<SubmissionData> {
    console.log('[MockFileStorage] Uploading files', formData);

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const timestamp = new Date().toISOString();
    const mockUrl = (name: string) => `https://mock-storage.com/${name}.pdf`;

    return {
      firstName: formData.firstName,
      lastName: formData.lastName,
      nationality: formData.nationality,
      email: formData.email,
      school1: formData.school1,
      thematicSequence1: formData.thematicSequence1,
      electives1: formData.electives1,
      school2: formData.school2,
      thematicSequence2: formData.thematicSequence2,
      electives2: formData.electives2,

      applicationFormUrl: mockUrl('application-form'),
      resumeUrl: mockUrl('resume'),
      s5TranscriptsUrl: mockUrl('s5-transcripts'),
      s6TranscriptsUrl: mockUrl('s6-transcripts'),
      school1LearningAgreementUrl: mockUrl('school1-learning-agreement'),
      passeportUrl: mockUrl('passport'),

      residencePermitUrl: formData.residencePermit
        ? mockUrl('residence-permit')
        : undefined,
      school2LearningAgreementUrl: formData.school2LearningAgreement
        ? mockUrl('school2-learning-agreement')
        : undefined,
      otherFilesPdfUrl: formData.otherFilesPdf ? mockUrl('other-files') : undefined,

      createdAt: timestamp,
    };
  },
};
