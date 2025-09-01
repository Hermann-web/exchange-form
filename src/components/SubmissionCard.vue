<!-- SubmissionCard.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import {
  CalendarIcon,
  GlobeAltIcon,
  EyeIcon,
  ArrowDownTrayIcon,
} from '@heroicons/vue/24/outline';
import type { SubmissionMetaDb } from '@/types/submissionapi';
import {
  schoolLabels,
  formatDate,
  formatDateShort,
  createDocumentConfigs,
} from '@/components/types';
import DocumentItem from '@/components/DocumentItem.vue';
import SchoolChoiceDisplay from '@/components/SchoolChoiceDisplay.vue';
import { schoolChoices } from '@/components/types';
import * as Icons from '@heroicons/vue/24/outline';

interface Props {
  submission: SubmissionMetaDb;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'download-submission': [submission: SubmissionMetaDb];
  'download-file': [url: string, filename: string];
}>();

const isExpanded = ref(false);
const documentConfigs = createDocumentConfigs(Icons);

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};

const handleDownloadSubmission = () => {
  emit('download-submission', props.submission);
};

const handleDownloadFile = (url: string, filename: string) => {
  emit('download-file', url, filename);
};

const getAvailableDocuments = () => {
  return documentConfigs.filter((doc) => {
    if (doc.key === 'residencePermit') {
      return props.submission.residencePermitUrl;
    }
    if (doc.key === 'school2LearningAgreement') {
      return props.submission.school2LearningAgreementUrl;
    }
    return props.submission[doc.urlKey as keyof SubmissionMetaDb];
  });
};
</script>

<template>
  <div class="glass rounded-xl overflow-hidden">
    <!-- Main Row -->
    <div class="p-4 sm:p-6">
      <div class="flex items-center justify-between">
        <!-- Student Info -->
        <div class="flex items-center min-w-0 flex-1">
          <div
            class="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0"
          >
            <span class="text-white font-semibold text-sm">
              {{ submission.firstName.charAt(0) }}{{ submission.lastName.charAt(0) }}
            </span>
          </div>
          <div class="min-w-0 flex-1">
            <h3 class="text-base sm:text-lg font-semibold text-white truncate">
              {{ submission.firstName }} {{ submission.lastName }}
            </h3>
            <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
              <p class="text-blue-300 text-sm truncate">{{ submission.email }}</p>
              <div class="flex items-center gap-3 text-xs text-blue-200">
                <span class="flex items-center">
                  <CalendarIcon class="w-3 h-3 mr-1" />
                  {{ formatDateShort(submission.createdAt) }}
                </span>
                <span class="flex items-center">
                  <GlobeAltIcon class="w-3 h-3 mr-1" />
                  {{ submission.nationality === 'moroccan' ? 'MAR' : 'INT' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Primary School & Actions -->
        <div class="flex items-center gap-3 ml-4">
          <div class="hidden sm:block text-right">
            <div class="text-sm font-medium text-white">
              {{ schoolLabels[submission.school1] }}
            </div>
          </div>
          <button @click="toggleExpanded" class="btn-secondary p-2 text-sm">
            <EyeIcon class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Mobile School Info -->
      <div class="sm:hidden mt-3 pt-3 border-t border-white/10">
        <div class="text-sm font-medium text-white">
          {{ schoolLabels[submission.school1] }}
        </div>
      </div>
    </div>

    <!-- Expanded Details -->
    <div v-if="isExpanded" class="border-t border-white/10 bg-white/5">
      <div class="p-4 sm:p-6 space-y-6">
        <!-- Mobility Choices -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SchoolChoiceDisplay
            v-for="choice in schoolChoices"
            :key="choice.title"
            :choice="choice"
            :submission="submission"
            compact
          />
        </div>

        <!-- Documents -->
        <div>
          <h4 class="text-blue-200 font-medium mb-3 flex items-center text-sm">
            <Icons.DocumentTextIcon class="w-4 h-4 mr-2" />
            Documents
          </h4>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <DocumentItem
              v-for="document in getAvailableDocuments()"
              :key="document.key"
              :document="document"
              :url="
                submission[document.urlKey] ||
                'internal error: undefined url after filtering'
              "
              :first-name="submission.firstName"
              :last-name="submission.lastName"
              compact
              @download="handleDownloadFile"
            />
          </div>
        </div>

        <!-- Footer Actions -->
        <div
          class="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-white/10 gap-3"
        >
          <div class="text-xs text-blue-400">
            <div>Submitted: {{ formatDate(submission.createdAt) }}</div>
          </div>
          <div class="flex gap-2">
            <button
              @click="handleDownloadSubmission"
              class="btn-secondary text-xs py-2 px-3 flex items-center"
            >
              <ArrowDownTrayIcon class="w-3 h-3 mr-1" />
              Export
            </button>
            <button
              v-if="submission.metadataUrl"
              @click="
                handleDownloadFile(
                  submission.metadataUrl,
                  `${submission.firstName}-${submission.lastName}-metadata.json`
                )
              "
              class="btn-secondary text-xs py-2 px-3"
            >
              Metadata
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
