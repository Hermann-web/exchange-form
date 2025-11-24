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

import {
  schoolChoices,
  createDocumentConfigs,
  formatDate,
  downloadFile,
} from '@/components/types';
import SchoolChoiceDisplay from '@/components/SchoolChoiceDisplay.vue';
import DocumentItem from '@/components/DocumentItem.vue';
import { SubmissionFormObjectUrlsMap } from '@/types/submissionapi';

const router = useRouter();
const authStore = useAuthStore();
const submissionStore = useSubmissionStore();

const submission = computed(() => submissionStore.mySubmission);
const documentConfigs = createDocumentConfigs(Icons);

const personalInfoFields = computed(() => {
  if (!submission.value) return [];

  return [
    {
      label: 'Nom Complet',
      value: `${submission.value.firstName} ${submission.value.lastName}`,
    },
    {
      label: 'Email',
      value: submission.value.email,
    },
    {
      label: 'Nationalité',
      value: submission.value.nationality === 'moroccan' ? 'Marocaine' : 'Autre',
    },
  ];
});

const availableDocuments = computed(() => {
  if (!submission.value) return [];

  return documentConfigs.filter((doc) => {
    return submission.value?.[SubmissionFormObjectUrlsMap[doc.key]];
  });
});

const handleDownloadFile = (url: string, filename: string) => {
  downloadFile(url, filename);
};

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
      <h2 class="text-2xl font-bold text-white mb-2">Aucune candidature trouvée</h2>
      <p class="text-blue-100 mb-6">
        Vous n'avez pas encore soumis votre candidature d'échange.
      </p>
      <router-link to="/add-submission" class="btn-primary">
        Soumettre une candidature
      </router-link>
    </div>

    <!-- Submission Details -->
    <div v-else class="space-y-8">
      <!-- Header -->
      <div class="glass rounded-2xl p-8">
        <div class="text-center mb-6">
          <CheckCircleIcon class="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h1 class="text-3xl font-bold text-white mb-2">
            Candidature soumise avec succès
          </h1>
          <p class="text-blue-100">
            Votre candidature d'échange a été reçue et est en cours de traitement.
          </p>
        </div>

        <div
          class="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-blue-200"
        >
          <div class="flex items-center">
            <CalendarIcon class="w-4 h-4 mr-2" />
            Soumis le : {{ formatDate(submission.createdAt) }}
          </div>
        </div>
      </div>

      <!-- Personal Information -->
      <div class="glass rounded-xl p-6">
        <h2 class="text-xl font-semibold text-white mb-6 flex items-center">
          <UserIcon class="w-5 h-5 mr-2" />
          Informations personnelles
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
          Préférences d'échange
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
          Documents soumis
        </h2>

        <div class="space-y-4">
          <DocumentItem
            v-for="document in availableDocuments"
            :key="document.key"
            :document="document"
            :url="
              submission?.[SubmissionFormObjectUrlsMap[document.key]] ||
              'erreur interne : URL non définie après filtrage'
            "
            @download="handleDownloadFile"
          />
        </div>
      </div>

      <!-- Application Status -->
      <div class="glass rounded-xl p-6">
        <h2 class="text-xl font-semibold text-white mb-6">Statut de la candidature</h2>

        <div class="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4">
          <div class="flex items-center">
            <ExclamationCircleIcon class="h-6 w-6 text-yellow-400 mr-3 flex-shrink-0" />
            <div>
              <p class="text-yellow-200 font-medium">En cours de traitement</p>
              <p class="text-yellow-100 text-sm mt-1">
                Votre candidature est actuellement examinée par le comité d'admission.
                Vous serez informé du statut par email.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-center">
        <router-link to="/dashboard" class="btn-primary">
          Retour au tableau de bord
        </router-link>
      </div>
    </div>
  </div>
</template>
