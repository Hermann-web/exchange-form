<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useSubmissionStore } from '@/stores/submission';
import type {
  SubmissionForm,
  SubmissionFormObject,
  School,
  SubmissionFormMeta,
} from '@/types/submissionapi';
import {
  DocumentTextIcon,
  PaperClipIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from '@heroicons/vue/24/outline';

// Components
import FormField from '@/components/FormField.vue';
import FileUpload from '@/components/FileUpload.vue';
import SchoolChoice from '@/components/SchoolChoice.vue';
import type { PersonalField } from '@/components/types';

const router = useRouter();
const authStore = useAuthStore();
const submissionStore = useSubmissionStore();

// Form data
const form = reactive<SubmissionForm>({
  firstName: '',
  lastName: '',
  nationality: 'moroccan',
  email: authStore.user?.email || '',
  school1: 'centrale_supelec',
  program1: '',
  thematicSequence1: '',
  electives1: '',
  school2: 'centrale_nantes',
  program2: '',
  thematicSequence2: '',
  electives2: '',
  applicationFormDocx: null as any,
  resumePdf: null as any,
  s5Transcripts: null as any,
  s6Transcripts: null as any,
  residencePermit: undefined,
  school1LearningAgreement: null as any,
  school2LearningAgreement: null as any,
  passeportPdf: null as any,
});

// Form validation
const errors = reactive({
  firstName: '',
  lastName: '',
  email: '',
  program1: '',
  program2: '',
  applicationFormDocx: '',
  resumePdf: '',
  s5Transcripts: '',
  s6Transcripts: '',
  residencePermit: '',
  school1LearningAgreement: '',
  school2LearningAgreement: '',
  passeportPdf: '',
  // more
  nationality: '',
  school1: '',
  school2: '',
  thematicSequence1: '',
  thematicSequence2: '',
  electives1: '',
  electives2: '',
});

// Configuration objects
const personalFields: PersonalField<SubmissionFormMeta>[] = [
  {
    key: 'firstName',
    label: 'First Name',
    type: 'text',
    required: true,
    validator: (value: string) => validateRequired('firstName', value),
  },
  {
    key: 'lastName',
    label: 'Last Name',
    type: 'text',
    required: true,
    validator: (value: string) => validateRequired('lastName', value),
  },
  {
    key: 'nationality',
    label: 'Nationality',
    type: 'select',
    required: true,
    options: [
      { value: 'moroccan', label: 'Moroccan' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    key: 'email',
    label: 'Email Address',
    type: 'email',
    required: true,
    readonly: true,
    validator: () => validateEmail(),
  },
];

const schoolOptions: { value: School; label: string }[] = [
  { value: 'centrale_supelec', label: 'CentraleSupélec' },
  { value: 'centrale_nantes', label: 'Centrale Nantes' },
  { value: 'centrale_lille', label: 'Centrale Lille' },
  { value: 'centrale_marseille', label: 'Centrale Marseille' },
  { value: 'centrale_lyon', label: 'Centrale Lyon' },
];

const schoolChoices = [
  {
    title: 'First Choice',
    schoolKey: 'school1',
    programKey: 'program1',
    thematicKey: 'thematicSequence1',
    electivesKey: 'electives1',
  },
  {
    title: 'Second Choice',
    schoolKey: 'school2',
    programKey: 'program2',
    thematicKey: 'thematicSequence2',
    electivesKey: 'electives2',
  },
];

type Extension = '.docx' | '.pdf';
type Extension2 = 'docx' | 'pdf';

interface FileUploads<Tform = any> {
  key: keyof Tform;
  label: string;
  accept: Extension;
  extensions: Extension2[];
  errorKey: keyof Tform;
  required: boolean;
  conditional?: () => boolean;
}

const fileUploads: FileUploads<SubmissionFormObject>[] = [
  {
    key: 'applicationFormDocx',
    label: 'Application Form (.docx)',
    accept: '.docx',
    extensions: ['docx'],
    errorKey: 'applicationFormDocx',
    required: true,
  },
  {
    key: 'resumePdf',
    label: 'Resume/CV (.pdf)',
    accept: '.pdf',
    extensions: ['pdf'],
    errorKey: 'resumePdf',
    required: true,
  },
  {
    key: 's5Transcripts',
    label: 'S5 Transcripts (.pdf)',
    accept: '.pdf',
    extensions: ['pdf'],
    errorKey: 's5Transcripts',
    required: true,
  },
  {
    key: 's6Transcripts',
    label: 'S6 Transcripts (.pdf)',
    accept: '.pdf',
    extensions: ['pdf'],
    errorKey: 's6Transcripts',
    required: true,
  },
  {
    key: 'school1LearningAgreement',
    label: 'Learning Agreement (School 1) (.pdf)',
    accept: '.pdf',
    extensions: ['pdf'],
    errorKey: 'school1LearningAgreement',
    required: true,
  },
  {
    key: 'school2LearningAgreement',
    label: 'Learning Agreement (School 2) (.pdf)',
    accept: '.pdf',
    extensions: ['pdf'],
    errorKey: 'school2LearningAgreement',
    required: true,
  },
  {
    key: 'passeportPdf',
    label: 'Passeport (.pdf)',
    accept: '.pdf',
    extensions: ['pdf'],
    errorKey: 'passeportPdf',
    required: true,
  },
  {
    key: 'residencePermit',
    label: 'Residence Permit (.pdf)',
    accept: '.pdf',
    extensions: ['pdf'],
    errorKey: 'residencePermit',
    required: true,
    conditional: () => form.nationality === 'other',
  },
];

// Validation functions
const validateEmail = () => {
  const emailRegex = /^[a-zA-Z]+\.[a-zA-Z]+@centrale-casablanca\.ma$/;
  errors.email = !emailRegex.test(form.email)
    ? 'Email must be in format: firstname.lastname@centrale-casablanca.ma'
    : '';
};

const validateRequired = (field: string, value: string) => {
  errors[field as keyof typeof errors] = !value.trim() ? 'This field is required' : '';
};

const validateFile = (field: string, file: File | null, extensions: string[]) => {
  if (!file) {
    errors[field as keyof typeof errors] = 'This file is required';
    return;
  }

  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !extensions.includes(extension)) {
    errors[field as keyof typeof errors] =
      `File must be ${extensions.join(' or ')} format`;
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    errors[field as keyof typeof errors] = 'File size must be less than 10MB';
    return;
  }

  errors[field as keyof typeof errors] = '';
};

// File handlers
const handleFileChange = (
  fileConfig: FileUploads<SubmissionFormObject>,
  file: File | null
) => {
  if (file) {
    form[fileConfig.key] = file;
    validateFile(fileConfig.errorKey, file, fileConfig.extensions);
  }
};

// Form validation
const isFormValid = computed(() => {
  const requiredFields: any[] = [
    form.firstName,
    form.lastName,
    form.email,
    form.program1,
    form.program2,
    form.applicationFormDocx,
    form.resumePdf,
    form.s5Transcripts,
    form.s6Transcripts,
    form.school1LearningAgreement,
    form.school2LearningAgreement,
    form.passeportPdf,
  ];

  if (form.nationality === 'other') {
    requiredFields.push(form.residencePermit);
  }

  const hasAllRequiredFields = requiredFields.every((field) => field);
  const hasNoErrors = Object.values(errors).every((error) => !error);

  return hasAllRequiredFields && hasNoErrors;
});

// Submit handler
const handleSubmit = async () => {
  // Validate all personal fields
  personalFields.forEach((field) => {
    if (field.validator) {
      field.validator(form[field.key] as string);
    }
  });

  // Validate all files
  fileUploads.forEach((fileConfig) => {
    if (!fileConfig.conditional || fileConfig.conditional()) {
      const file = form[fileConfig.key] as File | null;
      validateFile(fileConfig.errorKey, file, fileConfig.extensions);
    }
  });

  if (!isFormValid.value) return;

  const success = await submissionStore.submitApplication(form);
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

const setMetaField = <K extends keyof SubmissionFormMeta>(
  key: K,
  value: SubmissionFormMeta[K]
) => {
  (form as SubmissionFormMeta)[key] = value;
};
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="glass rounded-2xl p-8 mb-8">
      <div class="text-center">
        <DocumentTextIcon class="w-16 h-16 text-blue-300 mx-auto mb-4" />
        <h1 class="text-3xl font-bold text-white mb-2">Submit Exchange Application</h1>
        <p class="text-blue-100">
          Fill out the form below to submit your S8 exchange application
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
          Personal Information
        </h2>

        <div class="grid md:grid-cols-2 gap-6">
          <FormField
            v-for="field in personalFields"
            :key="field.key"
            :field="field"
            :value="form[field.key]"
            :error="errors[field.key]"
            @update:value="setMetaField(field.key, $event)"
            @validate="field.validator && field.validator($event)"
          />
        </div>
      </div>

      <!-- Exchange Choices -->
      <div class="glass rounded-xl p-6">
        <h2 class="text-xl font-semibold text-white mb-6">Exchange Preferences</h2>

        <SchoolChoice
          v-for="(choice, index) in schoolChoices"
          :key="choice.title"
          :choice="choice"
          :form="form"
          :errors="errors"
          :school-options="schoolOptions"
          :class="{ 'mb-8': index === 0 }"
          @validate-program="validateRequired(choice.programKey, $event)"
        />
      </div>

      <!-- Document Uploads -->
      <div class="glass rounded-xl p-6">
        <h2 class="text-xl font-semibold text-white mb-6 flex items-center">
          <PaperClipIcon class="w-5 h-5 mr-2" />
          Required Documents
        </h2>

        <div class="space-y-6">
          <FileUpload
            v-for="fileConfig in fileUploads"
            :key="fileConfig.key"
            v-show="!fileConfig.conditional || fileConfig.conditional()"
            :config="fileConfig"
            :file="form[fileConfig.key] || null"
            :error="errors[fileConfig.errorKey]"
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
            Submitting Application...
          </span>
          <span v-else>Submit Application</span>
        </button>
      </div>
    </form>
  </div>
</template>
