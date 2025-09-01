// src/stores/submission.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { databaseApi, fileStorageApi } from '@/utils/api';
import type { SubmissionForm, SubmissionMetaDb, School } from '@/types/submissionapi';

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
  const submitApplication = async (formData: SubmissionForm): Promise<boolean> => {
    isSubmitting.value = true;
    error.value = null;

    // some check
    // if choice is unset, empty some fields
    if (formData.school2 == 'unset') {
      formData.electives2 = '';
      formData.school2LearningAgreement = undefined;
      formData.thematicSequence2 = '';
    }

    try {
      // Step 1: Upload files to storage and get URLs
      console.log('Upload files to storage and get URLs');
      const submissionData = await fileStorageApi.uploadFiles(formData);

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
      (sub) => sub.school1 === school || sub.school2 === school
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
    const byNationality = {
      moroccan: 0,
      other: 0,
    };

    allSubmissions.value.forEach((submission) => {
      // Count by first choice school
      if (submission.school1) {
        bySchool[submission.school1]++;
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
