// src/stores/submission.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { databaseApi, fileStorageApi } from '@/utils/api';
import {
  type SubmissionForm,
  type SubmissionMetaDb,
  type School,
  type SubmissionData,
  type SubmissionFormObject,
  type Nationality,
  schoolLabels,
  nationalityLabels,
  SubmissionFormSchema,
  SubmissionMetaDbSchema,
} from '@/types/submissionapi';
import { fillRecord } from '@/components/types';
import { z } from 'zod';

// // Helper function to generate unique storage ID
// const generateStorageId = (email: string): string => {
//   const timestamp = Date.now();
//   const sanitizedEmail = email.replace(/[@.]/g, '_');
//   return `${sanitizedEmail}_${timestamp}`;
// };

export const useSubmissionStore = defineStore('submission', () => {
  // State
  const mySubmission = ref<SubmissionMetaDb | null>(null);
  const allSubmissions = ref<SubmissionMetaDb[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const isSubmitting = ref(false);

  // Getters
  const hasSubmission = computed(() => mySubmission.value !== null);
  const submissionCount = computed(() => allSubmissions.value.length);

  // Helper to clear error after timeout
  const clearErrorAfter = (timeout: number = 5000) => {
    setTimeout(() => {
      error.value = null;
    }, timeout);
  };

  // Actions
  const setError = (message: string) => {
    error.value = message;
    clearErrorAfter();
  };

  const clearError = () => {
    error.value = null;
  };

  // Upload files and create submission
  const submitApplication = async (
    email: string,
    formData: SubmissionForm
  ): Promise<boolean> => {
    isSubmitting.value = true;
    error.value = null;

    // some check
    // if choice is unset, empty some fields
    if (formData.choice2.schoolName == 'unset') {
      formData.motivationLetterChoice2 = undefined;
      formData.choice2.academicPath = '';
      formData.choice2.careerPath = '';
      formData.choice2.electives = '';
    }

    formData.email = email;
    const submissionId = `${Date.now()}`;

    const uploadSingleFile = async (
      key: keyof SubmissionFormObject,
      file: File
    ): Promise<string> => {
      return await fileStorageApi.uploadSingleFile(email, key, submissionId, file);
    };

    try {
      // Validate input
      SubmissionFormSchema.parse(formData);

      // Step 1: Upload files to storage and get URLs
      console.log('Upload files to storage and get URLs');

      const submissionData: SubmissionData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        nationality: formData.nationality,
        choice1: formData.choice1,
        choice2: formData.choice2,
        applicationFormEccUrl: await uploadSingleFile(
          'applicationFormEcc',
          formData.applicationFormEcc
        ),
        applicationFormGecUrl: formData.applicationFormGec
          ? await uploadSingleFile('applicationFormGec', formData.applicationFormGec)
          : undefined,
        resumeUrl: await uploadSingleFile('resumePdf', formData.resumePdf),
        s5TranscriptsUrl: await uploadSingleFile('s5Transcripts', formData.s5Transcripts),
        s6TranscriptsUrl: await uploadSingleFile('s6Transcripts', formData.s6Transcripts),
        s7TranscriptsUrl: formData.s7Transcripts
          ? await uploadSingleFile('s7Transcripts', formData.s7Transcripts)
          : undefined,
        s8TranscriptsUrl: formData.s8Transcripts
          ? await uploadSingleFile('s8Transcripts', formData.s8Transcripts)
          : undefined,
        residencePermitUrl: formData.residencePermit
          ? await uploadSingleFile('residencePermit', formData.residencePermit)
          : undefined,
        motivationLetterChoice1Url: await uploadSingleFile(
          'motivationLetterChoice1',
          formData.motivationLetterChoice1
        ),
        motivationLetterChoice2Url: formData.motivationLetterChoice2
          ? await uploadSingleFile(
              'motivationLetterChoice2',
              formData.motivationLetterChoice2
            )
          : undefined,
        frenchLevelCertificateUrl: await uploadSingleFile(
          'frenchLevelCertificate',
          formData.frenchLevelCertificate
        ),
        englishLevelCertificateUrl: await uploadSingleFile(
          'englishLevelCertificate',
          formData.englishLevelCertificate
        ),
        passeportUrl: await uploadSingleFile('passeportPdf', formData.passeportPdf),
        otherFilesPdfUrl: formData.otherFilesPdf
          ? await uploadSingleFile('otherFilesPdf', formData.otherFilesPdf)
          : undefined,
        createdAt: new Date().toISOString(),
      };

      // Step 2: Save submission metadata to database
      console.log('Save submission metadata to database');
      const savedSubmission = await databaseApi.saveSubmission(submissionData);

      // Validate response
      SubmissionMetaDbSchema.parse(savedSubmission);

      // Update local state
      mySubmission.value = savedSubmission;

      return true;
    } catch (err: any) {
      console.error('Error submitting application:', err);
      setError(err.message || 'Failed to submit application');
      return false;
    } finally {
      isSubmitting.value = false;
    }
  };

  // Fetch user's own submission
  const fetchMySubmission = async (email: string): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      const submission = await databaseApi.getMySubmission(email);

      // Validate response if present
      if (submission) {
        SubmissionMetaDbSchema.parse(submission);
      }

      mySubmission.value = submission;
    } catch (err: any) {
      console.error('Error fetching user submission:', err);
      setError(err.message || 'Failed to fetch your submission');
    } finally {
      isLoading.value = false;
    }
  };

  // Fetch all submissions (admin only)
  const fetchAllSubmissions = async (): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      const submissions = await databaseApi.listAllSubmissions();

      // Validate response
      z.array(SubmissionMetaDbSchema).parse(submissions);

      allSubmissions.value = submissions;
    } catch (err: any) {
      console.error('Error fetching all submissions:', err);
      setError(err.message || 'Failed to fetch submissions');
    } finally {
      isLoading.value = false;
    }
  };

  // Reset store state
  const reset = () => {
    mySubmission.value = null;
    allSubmissions.value = [];
    isLoading.value = false;
    error.value = null;
    isSubmitting.value = false;
  };

  // Get submission by email (from cached all submissions)
  const getSubmissionByEmail = (email: string): SubmissionMetaDb | undefined => {
    return (allSubmissions.value as SubmissionMetaDb[]).find(
      (sub) => sub.email === email
    );
  };

  // Filter submissions by school
  const getSubmissionsBySchool = (school: School): SubmissionMetaDb[] => {
    return (allSubmissions.value as SubmissionMetaDb[]).filter(
      (sub) => sub.choice1.schoolName === school || sub.choice2.schoolName === school
    );
  };

  // Get submissions statistics
  const getStatistics = computed(() => {
    const total = allSubmissions.value.length;
    const bySchool: Record<School, number> = fillRecord(schoolLabels, 0);
    const byNationality: Record<Nationality, number> = fillRecord(nationalityLabels, 0);

    allSubmissions.value.forEach((submission: SubmissionMetaDb) => {
      // Count by first choice school
      if (submission.choice1) {
        bySchool[submission.choice1.schoolName]++;
      }

      // Count by nationality
      byNationality[submission.nationality]++;
    });

    return {
      total,
      bySchool,
      byNationality,
    };
  });

  return {
    // State
    mySubmission,
    allSubmissions,
    isLoading,
    error,
    isSubmitting,

    // Getters
    hasSubmission,
    submissionCount,
    getStatistics,

    // Actions
    submitApplication,
    fetchMySubmission,
    fetchAllSubmissions,
    reset,
    clearError,
    getSubmissionByEmail,
    getSubmissionsBySchool,
  };
});
