<!-- src/views/AddSubmissionView.vue -->
<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useSubmissionStore } from '@/stores/submission';
import type {
  SubmissionForm,
  SubmissionFormObject,
  PersonalSubmissionFormMeta,
} from '@/types/submissionapi';
import {
  DocumentTextIcon,
  PaperClipIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from '@heroicons/vue/24/outline';
import FormField from '@/components/FormField.vue';
import FileUpload from '@/components/FileUpload.vue';
import SchoolChoice from '@/components/SchoolChoice.vue';
import type {
  FileExtension,
  FileUploadField,
  PersonalField,
  SubmissionErrorType,
} from '@/components/types';
import {
  schoolOptions,
  schoolChoices,
  createPersonalFieldConfigs,
  createFileUploadFieldConfigs,
  initialize_submission_reactives,
  validateAllFields,
} from '@/components/types';

const router = useRouter();
const authStore = useAuthStore();
const submissionStore = useSubmissionStore();

const { initial_form, initial_errors } = initialize_submission_reactives(
  authStore.user?.email || ''
);

// Form data
const form = reactive<SubmissionForm>(initial_form);

// Form validation
const errors: SubmissionErrorType = reactive(initial_errors);

// Configuration objects
const personalFields: PersonalField<PersonalSubmissionFormMeta>[] =
  createPersonalFieldConfigs();

const fileUploadConfigs: FileUploadField<SubmissionFormObject>[] =
  createFileUploadFieldConfigs(form);

const validatePersonalField = (field: PersonalField<PersonalSubmissionFormMeta>) => {
  if (field.validator) {
    errors[field.key] = field.validator(form[field.key]);
  }
};

const setMetaField = <K extends keyof SubmissionForm>(
  key: K,
  value: SubmissionForm[K]
) => {
  form[key] = value;
};

const validateFile = (
  field: keyof SubmissionFormObject,
  required: boolean,
  file: File | null,
  extensions: FileExtension[]
): void => {
  if (!file) {
    if (required) {
      errors[field] = 'This file is required';
      return;
    } else {
      errors[field] = '';
      return;
    }
  }

  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension) {
    errors[field] = 'File has no extension';
    return;
  }

  if (!extension || !extensions.includes(extension as FileExtension)) {
    errors[field] = `Invalid file extension. Allowed: ${extensions.join(' or ')}`;
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    errors[field] = 'File size must be less than 10MB';
    return;
  }

  errors[field] = '';
};

// File handlers
const handleFileChange = (
  fileConfig: FileUploadField<SubmissionFormObject>,
  file: File | null
) => {
  if (file) {
    form[fileConfig.key] = file;
    validateFile(fileConfig.key, fileConfig.required, file, fileConfig.extensions);
  }
};

// Form validation
const isFormValid = computed(() => validateAllFields(form, errors));

// Submit handler
const handleSubmit = async () => {
  // Vérifier que l'utilisateur est connecté
  if (!authStore.user?.email) {
    alert('Impossible de soumettre le formulaire : aucun utilisateur identifié.');
    return;
  }

  // Validate all personal fields
  personalFields.forEach((field) => {
    validatePersonalField(field);
  });

  // Validate all files
  fileUploadConfigs.forEach((fileConfig) => {
    if (!fileConfig.conditional || fileConfig.conditional()) {
      const file = form[fileConfig.key] as File | null;
      validateFile(fileConfig.key, fileConfig.required, file, fileConfig.extensions);
    }
  });

  if (!isFormValid.value) return;

  const success = await submissionStore.submitApplication(authStore.user.email, form);
  if (success) {
    router.push('/read-submission');
  }
};

// Check if user already has a submission
onMounted(async () => {
  if (authStore.user?.email) {
    await submissionStore.fetchMySubmission(authStore.user.email);
    if (submissionStore.hasSubmission) {
      router.push('/read-submission');
    }
  }
});
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="glass rounded-2xl p-8 mb-8">
      <div class="text-center">
        <DocumentTextIcon class="w-16 h-16 text-blue-300 mx-auto mb-4" />
        <h1 class="text-3xl font-bold text-white mb-2">
          Soumettre une demande de mobilité
        </h1>
        <p class="text-blue-100">
          Remplissez le formulaire ci-dessous pour soumettre votre demande de mobilité
        </p>
      </div>
    </div>

    <!-- Error Alert -->
    <div
      v-if="submissionStore.error"
      class="mb-6 bg-red-500/20 border border-red-400/30 rounded-lg p-4"
    >
      <div class="flex">
        <ExclamationCircleIcon class="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
        <p class="text-red-300 text-sm">{{ submissionStore.error }}</p>
      </div>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="space-y-8">
      <!-- Personal Information -->
      <div class="glass rounded-xl p-6">
        <h2 class="text-xl font-semibold text-white mb-6 flex items-center">
          <InformationCircleIcon class="w-5 h-5 mr-2" />
          Informations Personnelles
        </h2>

        <div
          class="mb-6 bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-4 text-sm text-yellow-200"
        >
          <p class="mb-2">⚠️ Attention :</p>
          <ul class="list-disc pl-6 space-y-1">
            <li>
              L’adresse mail utilisée pour identifier votre dossier est
              <strong>celle avec laquelle vous êtes connecté(e)</strong>.
            </li>
            <li>
              Modifier le champ e-mail dans ce formulaire
              <strong>n’aura aucun effet</strong>.
            </li>
            <li>
              Le nom et le prénom saisis ici ne remplaceront pas vos données
              administratives officielles. Ils sont enregistrés à titre indicatif
              uniquement.
            </li>
            <li>
              Seules les demandes <strong>éligibles</strong> seront traitées. <br />Pour
              ceux qui ont un doute, si vous avez reçu un e‑mail d’invitation émanant du
              Service Mobilité de la Direction des Études pour remplir ce formulaire sur
              le site, votre demande sera considérée comme recevable
            </li>
          </ul>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          <FormField
            v-for="field in personalFields"
            :key="field.key"
            :field="field"
            :value="form[field.key] as string"
            :error="errors[field.key]"
            @update:value="setMetaField(field.key, $event)"
            @validate="validatePersonalField(field)"
          />
        </div>
      </div>

      <!-- Exchange Choices -->
      <div class="glass rounded-xl p-6">
        <h2 class="text-xl font-semibold text-white mb-6">Préférences de mobilité</h2>

        <SchoolChoice
          v-for="(choice, index) in schoolChoices"
          :key="choice.title"
          :choice="choice"
          :form="form"
          :errors="errors"
          :school-options="schoolOptions"
          :class="{ 'mb-8': index === 0 }"
        />
      </div>

      <!-- Document Uploads -->
      <div class="glass rounded-xl p-6">
        <h2 class="text-xl font-semibold text-white mb-6 flex items-center">
          <PaperClipIcon class="w-5 h-5 mr-2" />
          Documents Requis
        </h2>

        <div class="space-y-6">
          <FileUpload
            v-for="fileConfig in fileUploadConfigs"
            :key="fileConfig.key"
            v-show="!fileConfig.conditional || fileConfig.conditional()"
            :config="fileConfig"
            :file="form[fileConfig.key] || null"
            :error="errors[fileConfig.key]"
            @file-change="handleFileChange(fileConfig, $event)"
          />
        </div>
      </div>

      <!-- Submit Button -->
      <div class="flex justify-center">
        <button
          type="submit"
          :disabled="!isFormValid || submissionStore.isSubmitting"
          class="btn-primary px-12 py-3 text-lg"
        >
          <span v-if="submissionStore.isSubmitting" class="flex items-center">
            <svg
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Soumission de la demande...
          </span>
          <span v-else>Soumettre la demande</span>
        </button>
      </div>
    </form>
  </div>

  <!-- Disclaimer -->
  <div
    class="bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-4 text-sm text-yellow-200"
  >
    <p class="mb-2">✅ En soumettant, vous confirmez que :</p>
    <ul class="list-disc pl-6 space-y-1">
      <li>
        Toutes les informations et documents fournis sont
        <strong>exactes et authentiques</strong>.
      </li>
      <li>
        Les crédits ECTS dans votre Learning Agreement sont correctement renseignés.
      </li>
      <li>Les électifs ont été vérifiés sur les sites officiels des écoles.</li>
      <li>
        Les soumissions tardives ne seront ni acceptées ni lues après la fermeture de la
        plateforme.
      </li>
    </ul>
  </div>
</template>
