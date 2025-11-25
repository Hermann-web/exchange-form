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
} from '@/types/submissionapi';

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
      formData.choice2LearningAgreement = undefined;
      formData.choice2.thematicSequence = '';
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
      // Step 1: Upload files to storage and get URLs
      console.log('Upload files to storage and get URLs');

      const submissionData: SubmissionData = {
        ...formData,
        applicationFormUrl: await uploadSingleFile(
          'applicationFormDocx',
          formData.applicationFormDocx
        ),
        resumeUrl: await uploadSingleFile('resumePdf', formData.resumePdf),
        s5TranscriptsUrl: await uploadSingleFile('s5Transcripts', formData.s5Transcripts),
        s6TranscriptsUrl: await uploadSingleFile('s6Transcripts', formData.s6Transcripts),
        residencePermitUrl: formData.residencePermit
          ? await uploadSingleFile('residencePermit', formData.residencePermit)
          : undefined,
        choice1LearningAgreementUrl: await uploadSingleFile(
          'choice1LearningAgreement',
          formData.choice1LearningAgreement
        ),
        choice2LearningAgreementUrl: formData.choice2LearningAgreement
          ? await uploadSingleFile(
              'choice2LearningAgreement',
              formData.choice2LearningAgreement
            )
          : undefined,
        passeportUrl: await uploadSingleFile('passeportPdf', formData.passeportPdf),
        otherFilesPdfUrl: formData.otherFilesPdf
          ? await uploadSingleFile('otherFilesPdf', formData.otherFilesPdf)
          : undefined,
        createdAt: new Date().toISOString(),
      };

      // Step 2: Save submission metadata to database
      console.log('Save submission metadata to database');
      const savedSubmission = await databaseApi.saveSubmission(submissionData);

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
    return allSubmissions.value.find((sub) => sub.email === email);
  };

  // Filter submissions by school
  const getSubmissionsBySchool = (school: School): SubmissionMetaDb[] => {
    return allSubmissions.value.filter(
      (sub) => sub.choice1.schoolName === school || sub.choice2.schoolName === school
    );
  };

  // Get submissions statistics
  const getStatistics = computed(() => {
    const total = allSubmissions.value.length;
    const bySchool: Record<School, number> = {
      centrale_supelec: 0,
      em_lyon: 0,
      centrale_lille: 0,
      centrale_mediterranee: 0,
      centrale_lyon: 0,
      centrale_pekin: 0,
      unset: 0,
    };
    const byNationality: Record<Nationality, number> = {
      moroccan: 0,
      other: 0,
    };

    allSubmissions.value.forEach((submission) => {
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
