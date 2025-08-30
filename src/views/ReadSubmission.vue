<!-- src/views/ReadSubmission.vue -->
<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useSubmissionStore } from '@/stores/submission';
import {
  CalendarIcon,
  UserIcon,
  GlobeAltIcon,
  PaperClipIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/vue/24/outline';
import * as Icons from '@heroicons/vue/24/outline';

// Shared configuration and components
import {
  schoolChoices,
  createDocumentConfigs,
  formatDate,
  downloadFile,
} from '@/components/types';
import SchoolChoiceDisplay from '@/components/SchoolChoiceDisplay.vue';
import DocumentItem from '@/components/DocumentItem.vue';

const router = useRouter();
const authStore = useAuthStore();
const submissionStore = useSubmissionStore();

// Computed properties
const submission = computed(() => submissionStore.mySubmission);
const documentConfigs = createDocumentConfigs(Icons);

// Personal information fields configuration
const personalInfoFields = computed(() => {
  if (!submission.value) return [];

  return [
    {
      label: 'Full Name',
      value: `${submission.value.firstName} ${submission.value.lastName}`,
    },
    {
      label: 'Email',
      value: submission.value.email,
    },
    {
      label: 'Nationality',
      value: submission.value.nationality === 'moroccan' ? 'Moroccan' : 'Other',
    },
  ];
});

// Get available documents for this submission
const availableDocuments = computed(() => {
  if (!submission.value) return [];

  return documentConfigs.filter((doc) => {
    if (doc.key === 'residencePermit') {
      return submission.value?.residencePermitUrl;
    }
    return submission.value?.[doc.urlKey as keyof typeof submission.value];
  });
});

// Action handlers
const handleDownloadFile = (url: string, filename: string) => {
  downloadFile(url, filename);
};

// Initialize data
onMounted(async () => {
  if (authStore.user?.email) {
    await submissionStore.fetchMySubmission(authStore.user.email);
    if (!submissionStore.hasSubmission) {
      router.push('/add-submission');
    }
  }
});
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
    <!-- Loading State -->
    <div v-if="submissionStore.isLoading" class="glass rounded-2xl p-8 text-center">
      <div class="animate-pulse">
        <div class="w-16 h-16 bg-blue-300/20 rounded-full mx-auto mb-4"></div>
        <div class="h-4 bg-blue-300/20 rounded w-1/2 mx-auto mb-2"></div>
        <div class="h-4 bg-blue-300/20 rounded w-1/3 mx-auto"></div>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="submissionStore.error"
      class="mb-6 bg-red-500/20 border border-red-400/30 rounded-lg p-4"
    >
      <div class="flex">
        <ExclamationCircleIcon class="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
        <p class="text-red-300 text-sm">{{ submissionStore.error }}</p>
      </div>
    </div>

    <!-- No Submission State -->
    <div v-else-if="!submission" class="glass rounded-2xl p-8 text-center">
      <XCircleIcon class="w-16 h-16 text-red-400 mx-auto mb-4" />
      <h2 class="text-2xl font-bold text-white mb-2">No Submission Found</h2>
      <p class="text-blue-100 mb-6">
        You haven't submitted your exchange application yet.
      </p>
      <router-link to="/add-submission" class="btn-primary">
        Submit Application
      </router-link>
    </div>

    <!-- Submission Details -->
    <div v-else class="space-y-8">
      <!-- Header -->
      <div class="glass rounded-2xl p-8">
        <div class="text-center mb-6">
          <CheckCircleIcon class="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h1 class="text-3xl font-bold text-white mb-2">
            Application Submitted Successfully
          </h1>
          <p class="text-blue-100">
            Your S8 exchange application has been received and is under review.
          </p>
        </div>

        <div
          class="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-blue-200"
        >
          <div class="flex items-center">
            <CalendarIcon class="w-4 h-4 mr-2" />
            Submitted: {{ formatDate(submission.createdAt) }}
          </div>
        </div>
      </div>

      <!-- Personal Information -->
      <div class="glass rounded-xl p-6">
        <h2 class="text-xl font-semibold text-white mb-6 flex items-center">
          <UserIcon class="w-5 h-5 mr-2" />
          Personal Information
        </h2>

        <div class="grid md:grid-cols-2 gap-6">
          <div v-for="field in personalInfoFields" :key="field.label">
            <label class="block text-blue-300 text-sm font-medium mb-1">
              {{ field.label }}
            </label>
            <p class="text-white">{{ field.value }}</p>
          </div>
        </div>
      </div>

      <!-- Exchange Preferences -->
      <div class="glass rounded-xl p-6">
        <h2 class="text-xl font-semibold text-white mb-6 flex items-center">
          <GlobeAltIcon class="w-5 h-5 mr-2" />
          Exchange Preferences
        </h2>

        <div class="space-y-8">
          <SchoolChoiceDisplay
            v-for="choice in schoolChoices"
            :key="choice.title"
            :choice="choice"
            :submission="submission"
          />
        </div>
      </div>

      <!-- Submitted Documents -->
      <div class="glass rounded-xl p-6">
        <h2 class="text-xl font-semibold text-white mb-6 flex items-center">
          <PaperClipIcon class="w-5 h-5 mr-2" />
          Submitted Documents
        </h2>

        <div class="space-y-4">
          <DocumentItem
            v-for="document in availableDocuments"
            :key="document.key"
            :document="document"
            :url="
              submission[document.urlKey] ||
              'internal error: undefined url after filtering'
            "
            @download="handleDownloadFile"
          />
        </div>
      </div>

      <!-- Application Status -->
      <div class="glass rounded-xl p-6">
        <h2 class="text-xl font-semibold text-white mb-6">Application Status</h2>

        <div class="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4">
          <div class="flex items-center">
            <ExclamationCircleIcon class="h-6 w-6 text-yellow-400 mr-3 flex-shrink-0" />
            <div>
              <p class="text-yellow-200 font-medium">Under Review</p>
              <p class="text-yellow-100 text-sm mt-1">
                Your application is currently being reviewed by the admissions committee.
                You will be notified of the status via email.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-center">
        <router-link to="/dashboard" class="btn-primary"> Back to Dashboard </router-link>
      </div>
    </div>
  </div>
</template>
