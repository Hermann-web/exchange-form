// src/utils/firebase/firebase-storage.ts
import type {
  SubmissionForm,
  SubmissionFormObjectUrls,
  SubmissionData,
  FileStorageApiInterface,
} from '@/types/submissionapi';
import { uploadFile } from '@/lib/firebase';

export const fileStorageApi: FileStorageApiInterface = {
  // Upload files to Firebase Storage and return download URLs
  uploadFiles: async (formData: SubmissionForm): Promise<SubmissionData> => {
    try {
      const email = formData.email;
      // const storageId = generateStorageId(email);
      const basePath = `submissions/${email}`;

      // Upload all required files
      const [
        applicationFormUrl,
        resumeUrl,
        s5TranscriptsUrl,
        s6TranscriptsUrl,
        residencePermitUrl,
        school1LearningAgreementUrl,
        school2LearningAgreementUrl,
        passeportUrl,
        otherFilesPdfUrl,
      ] = await Promise.all([
        uploadFile(formData.applicationFormDocx, `${basePath}/application_form.docx`),
        uploadFile(formData.resumePdf, `${basePath}/resume.pdf`),
        uploadFile(formData.s5Transcripts, `${basePath}/s5_transcripts.pdf`),
        uploadFile(formData.s6Transcripts, `${basePath}/s6_transcripts.pdf`),
        // Only upload residence permit if provided (for non-Moroccans)
        formData.residencePermit
          ? uploadFile(formData.residencePermit, `${basePath}/residence_permit.pdf`)
          : Promise.resolve(undefined),
        uploadFile(formData.school1LearningAgreement, `${basePath}/la_school1.pdf`),
        // Only upload school2LearningAgreement if provided (for non-Moroccans)
        formData.school2LearningAgreement
          ? uploadFile(formData.school2LearningAgreement, `${basePath}/la_school2.pdf`)
          : Promise.resolve(undefined),
        uploadFile(formData.passeportPdf, `${basePath}/passeport.pdf`),
        formData.otherFilesPdf
          ? uploadFile(formData.otherFilesPdf, `${basePath}/other_files.pdf`)
          : Promise.resolve(undefined),
      ]);

      const urls: SubmissionFormObjectUrls = {
        applicationFormUrl,
        resumeUrl,
        s5TranscriptsUrl,
        s6TranscriptsUrl,
        ...(residencePermitUrl && { residencePermitUrl }),
        school1LearningAgreementUrl,
        ...(school2LearningAgreementUrl && { school2LearningAgreementUrl }),
        passeportUrl,
        ...(otherFilesPdfUrl && { otherFilesPdfUrl }),
      };

      //   return urls;

      const submissionData: SubmissionData = {
        ...urls,
        ...formData,
        //   storageId:storageId,
        createdAt: new Date().toISOString(),
      };

      return submissionData;
    } catch (error) {
      console.error('Error uploading files:', error);
      throw new Error('Failed to upload files to storage');
    }
  },
};

// // Helper function to generate unique storage ID
// const generateStorageId = (email: string): string => {
//   const timestamp = Date.now();
//   const sanitizedEmail = email.replace(/[@.]/g, '_');
//   return `${sanitizedEmail}_${timestamp}`;
// };
