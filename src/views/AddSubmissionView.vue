<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useSubmissionStore } from '@/stores/submission';
import type { SubmissionForm, School } from '@/types/submissionapi';
import {
  DocumentTextIcon,
  PaperClipIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from '@heroicons/vue/24/outline';

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

// File input refs
const applicationFormRef = ref<HTMLInputElement>();
const resumeRef = ref<HTMLInputElement>();
const s5TranscriptsRef = ref<HTMLInputElement>();
const s6TranscriptsRef = ref<HTMLInputElement>();
const residencePermitRef = ref<HTMLInputElement>();

// Form validation
const errors = reactive({
  firstName: '',
  lastName: '',
  email: '',
  program1: '',
  program2: '',
  applicationForm: '',
  resume: '',
  s5Transcripts: '',
  s6Transcripts: '',
  residencePermit: '',
  school1LearningAgreement: '',
  school2LearningAgreement: '',
  passeportPdf: '',
});

// School options
const schoolOptions: { value: School; label: string }[] = [
  { value: 'centrale_supelec', label: 'CentraleSupélec' },
  { value: 'centrale_nantes', label: 'Centrale Nantes' },
  { value: 'centrale_lille', label: 'Centrale Lille' },
  { value: 'centrale_marseille', label: 'Centrale Marseille' },
  { value: 'centrale_lyon', label: 'Centrale Lyon' },
  { value: 'centrale_casablanca', label: 'Centrale Casablanca' },
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

  // Check file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    errors[field as keyof typeof errors] = 'File size must be less than 10MB';
    return;
  }

  errors[field as keyof typeof errors] = '';
};

// File handlers
type FileField =
  | 'applicationFormDocx'
  | 'resumePdf'
  | 's5Transcripts'
  | 's6Transcripts'
  | 'residencePermit'
  | 'school1LearningAgreement'
  | 'school2LearningAgreement'
  | 'passeportPdf';
const handleFileChange = (event: Event, field: FileField) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    form[field] = file as any;

    // Validate based on field
    switch (field) {
      case 'applicationFormDocx':
        validateFile('applicationForm', file, ['docx']);
        break;
      case 'resumePdf':
        validateFile('resume', file, ['pdf']);
        break;
      case 's5Transcripts':
        validateFile('s5Transcripts', file, ['pdf']);
        break;
      case 's6Transcripts':
        validateFile('s6Transcripts', file, ['pdf']);
        break;
      case 'residencePermit':
        if (form.nationality === 'other') {
          validateFile('residencePermit', file, ['pdf']);
        }
        break;
      case 'school1LearningAgreement':
        validateFile('school1LearningAgreement', file, ['pdf']);
        break;
      case 'school2LearningAgreement':
        validateFile('school2LearningAgreement', file, ['pdf']);
        break;
      case 'passeportPdf':
        validateFile('passeportPdf', file, ['pdf']);
        break;
    }
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

  // Add residence permit if not Moroccan
  if (form.nationality === 'other') {
    requiredFields.push(form.residencePermit);
  }

  const hasAllRequiredFields = requiredFields.every((field) => field);
  const hasNoErrors = Object.values(errors).every((error) => !error);

  return hasAllRequiredFields && hasNoErrors;
});

// Submit handler
const handleSubmit = async () => {
  // Validate all fields
  validateEmail();
  validateRequired('firstName', form.firstName);
  validateRequired('lastName', form.lastName);
  validateRequired('program1', form.program1);
  validateRequired('program2', form.program2);

  // Validate files
  validateFile('applicationForm', form.applicationFormDocx, ['docx']);
  validateFile('resume', form.resumePdf, ['pdf']);
  validateFile('s5Transcripts', form.s5Transcripts, ['pdf']);
  validateFile('s6Transcripts', form.s6Transcripts, ['pdf']);
  validateFile('school1LearningAgreement', form.school1LearningAgreement, ['pdf']);
  validateFile('school2LearningAgreement', form.school2LearningAgreement, ['pdf']);
  validateFile('passeportPdf', form.passeportPdf, ['pdf']);

  if (form.nationality === 'other') {
    validateFile('residencePermit', form.residencePermit ?? null, ['pdf']);
  }

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
          <div>
            <label class="block text-blue-100 text-sm font-medium mb-2">
              First Name *
            </label>
            <input
              v-model="form.firstName"
              @blur="validateRequired('firstName', form.firstName)"
              type="text"
              class="input-field"
              :class="{ 'border-red-400': errors.firstName }"
            />
            <p v-if="errors.firstName" class="text-red-300 text-xs mt-1">
              {{ errors.firstName }}
            </p>
          </div>

          <div>
            <label class="block text-blue-100 text-sm font-medium mb-2">
              Last Name *
            </label>
            <input
              v-model="form.lastName"
              @blur="validateRequired('lastName', form.lastName)"
              type="text"
              class="input-field"
              :class="{ 'border-red-400': errors.lastName }"
            />
            <p v-if="errors.lastName" class="text-red-300 text-xs mt-1">
              {{ errors.lastName }}
            </p>
          </div>

          <div>
            <label class="block text-blue-100 text-sm font-medium mb-2">
              Nationality *
            </label>
            <select v-model="form.nationality" class="input-field">
              <option value="moroccan">Moroccan</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label class="block text-blue-100 text-sm font-medium mb-2">
              Email Address *
            </label>
            <input
              v-model="form.email"
              @blur="validateEmail"
              type="email"
              class="input-field"
              :class="{ 'border-red-400': errors.email }"
              readonly
            />
            <p v-if="errors.email" class="text-red-300 text-xs mt-1">
              {{ errors.email }}
            </p>
          </div>
        </div>
      </div>

      <!-- Exchange Choices -->
      <div class="glass rounded-xl p-6">
        <h2 class="text-xl font-semibold text-white mb-6">Exchange Preferences</h2>

        <!-- First Choice -->
        <div class="mb-8">
          <h3 class="text-lg font-medium text-blue-200 mb-4">First Choice</h3>
          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <label class="block text-blue-100 text-sm font-medium mb-2">School *</label>
              <select v-model="form.school1" class="input-field">
                <option
                  v-for="school in schoolOptions"
                  :key="school.value"
                  :value="school.value"
                >
                  {{ school.label }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-blue-100 text-sm font-medium mb-2"
                >Program *</label
              >
              <input
                v-model="form.program1"
                @blur="validateRequired('program1', form.program1)"
                type="text"
                class="input-field"
                :class="{ 'border-red-400': errors.program1 }"
                placeholder="e.g., Computer Science, Engineering..."
              />
              <p v-if="errors.program1" class="text-red-300 text-xs mt-1">
                {{ errors.program1 }}
              </p>
            </div>

            <div v-if="form.school1 === 'centrale_supelec'">
              <label class="block text-blue-100 text-sm font-medium mb-2"
                >Thematic Sequence</label
              >
              <input
                v-model="form.thematicSequence1"
                type="text"
                class="input-field"
                placeholder="Enter thematic sequence"
              />
            </div>

            <div>
              <label class="block text-blue-100 text-sm font-medium mb-2">
                Electives (separated by semicolon)
              </label>
              <textarea
                v-model="form.electives1"
                class="input-field"
                rows="2"
                placeholder="Machine Learning; Data Science; AI Ethics"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Second Choice -->
        <div>
          <h3 class="text-lg font-medium text-blue-200 mb-4">Second Choice</h3>
          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <label class="block text-blue-100 text-sm font-medium mb-2">School *</label>
              <select v-model="form.school2" class="input-field">
                <option
                  v-for="school in schoolOptions"
                  :key="school.value"
                  :value="school.value"
                >
                  {{ school.label }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-blue-100 text-sm font-medium mb-2"
                >Program *</label
              >
              <input
                v-model="form.program2"
                @blur="validateRequired('program2', form.program2)"
                type="text"
                class="input-field"
                :class="{ 'border-red-400': errors.program2 }"
                placeholder="e.g., Computer Science, Engineering..."
              />
              <p v-if="errors.program2" class="text-red-300 text-xs mt-1">
                {{ errors.program2 }}
              </p>
            </div>

            <div v-if="form.school2 === 'centrale_supelec'">
              <label class="block text-blue-100 text-sm font-medium mb-2"
                >Thematic Sequence</label
              >
              <input
                v-model="form.thematicSequence2"
                type="text"
                class="input-field"
                placeholder="Enter thematic sequence"
              />
            </div>

            <div>
              <label class="block text-blue-100 text-sm font-medium mb-2">
                Electives (separated by semicolon)
              </label>
              <textarea
                v-model="form.electives2"
                class="input-field"
                rows="2"
                placeholder="Software Engineering; Web Development; Mobile Apps"
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Document Uploads -->
      <div class="glass rounded-xl p-6">
        <h2 class="text-xl font-semibold text-white mb-6 flex items-center">
          <PaperClipIcon class="w-5 h-5 mr-2" />
          Required Documents
        </h2>

        <div class="space-y-6">
          <!-- Application Form -->
          <div>
            <label class="block text-blue-100 text-sm font-medium mb-2">
              Application Form (.docx) *
            </label>
            <input
              ref="applicationFormRef"
              @change="handleFileChange($event, 'applicationFormDocx')"
              type="file"
              accept=".docx"
              class="file-input"
              :class="{ 'border-red-400': errors.applicationForm }"
            />
            <p v-if="errors.applicationForm" class="text-red-300 text-xs mt-1">
              {{ errors.applicationForm }}
            </p>
            <div
              v-if="form.applicationFormDocx"
              class="flex items-center mt-2 text-green-400 text-sm"
            >
              <CheckCircleIcon class="w-4 h-4 mr-1" />
              {{ form.applicationFormDocx.name }}
            </div>
          </div>

          <!-- Resume -->
          <div>
            <label class="block text-blue-100 text-sm font-medium mb-2">
              Resume/CV (.pdf) *
            </label>
            <input
              ref="resumeRef"
              @change="handleFileChange($event, 'resumePdf')"
              type="file"
              accept=".pdf"
              class="file-input"
              :class="{ 'border-red-400': errors.resume }"
            />
            <p v-if="errors.resume" class="text-red-300 text-xs mt-1">
              {{ errors.resume }}
            </p>
            <div
              v-if="form.resumePdf"
              class="flex items-center mt-2 text-green-400 text-sm"
            >
              <CheckCircleIcon class="w-4 h-4 mr-1" />
              {{ form.resumePdf.name }}
            </div>
          </div>

          <!-- S5 Transcripts -->
          <div>
            <label class="block text-blue-100 text-sm font-medium mb-2">
              S5 Transcripts (.pdf) *
            </label>
            <input
              ref="s5TranscriptsRef"
              @change="handleFileChange($event, 's5Transcripts')"
              type="file"
              accept=".pdf"
              class="file-input"
              :class="{ 'border-red-400': errors.s5Transcripts }"
            />
            <p v-if="errors.s5Transcripts" class="text-red-300 text-xs mt-1">
              {{ errors.s5Transcripts }}
            </p>
            <div
              v-if="form.s5Transcripts"
              class="flex items-center mt-2 text-green-400 text-sm"
            >
              <CheckCircleIcon class="w-4 h-4 mr-1" />
              {{ form.s5Transcripts.name }}
            </div>
          </div>

          <!-- S6 Transcripts -->
          <div>
            <label class="block text-blue-100 text-sm font-medium mb-2">
              S6 Transcripts (.pdf) *
            </label>
            <input
              ref="s6TranscriptsRef"
              @change="handleFileChange($event, 's6Transcripts')"
              type="file"
              accept=".pdf"
              class="file-input"
              :class="{ 'border-red-400': errors.s6Transcripts }"
            />
            <p v-if="errors.s6Transcripts" class="text-red-300 text-xs mt-1">
              {{ errors.s6Transcripts }}
            </p>
            <div
              v-if="form.s6Transcripts"
              class="flex items-center mt-2 text-green-400 text-sm"
            >
              <CheckCircleIcon class="w-4 h-4 mr-1" />
              {{ form.s6Transcripts.name }}
            </div>
          </div>

          <!-- Learning Agreement (School1) -->
          <div>
            <label class="block text-blue-100 text-sm font-medium mb-2">
              Learning Agreement (School 1) (.pdf) *
            </label>
            <input
              ref="school1LearningAgreementRef"
              @change="handleFileChange($event, 'school1LearningAgreement')"
              type="file"
              accept=".pdf"
              class="file-input"
              :class="{ 'border-red-400': errors.school1LearningAgreement }"
            />
            <p v-if="errors.school1LearningAgreement" class="text-red-300 text-xs mt-1">
              {{ errors.school1LearningAgreement }}
            </p>
            <div
              v-if="form.school1LearningAgreement"
              class="flex items-center mt-2 text-green-400 text-sm"
            >
              <CheckCircleIcon class="w-4 h-4 mr-1" />
              {{ form.school1LearningAgreement.name }}
            </div>
          </div>

          <!-- Learning Agreement (School2) -->
          <div>
            <label class="block text-blue-100 text-sm font-medium mb-2">
              Learning Agreement (School 2) (.pdf) *
            </label>
            <input
              ref="school2LearningAgreementRef"
              @change="handleFileChange($event, 'school2LearningAgreement')"
              type="file"
              accept=".pdf"
              class="file-input"
              :class="{ 'border-red-400': errors.school2LearningAgreement }"
            />
            <p v-if="errors.school2LearningAgreement" class="text-red-300 text-xs mt-1">
              {{ errors.school2LearningAgreement }}
            </p>
            <div
              v-if="form.school2LearningAgreement"
              class="flex items-center mt-2 text-green-400 text-sm"
            >
              <CheckCircleIcon class="w-4 h-4 mr-1" />
              {{ form.school2LearningAgreement.name }}
            </div>
          </div>

          <!-- Passeport -->
          <div>
            <label class="block text-blue-100 text-sm font-medium mb-2">
              Passeport (.pdf) *
            </label>
            <input
              ref="passeportPdfRef"
              @change="handleFileChange($event, 'passeportPdf')"
              type="file"
              accept=".pdf"
              class="file-input"
              :class="{ 'border-red-400': errors.passeportPdf }"
            />
            <p v-if="errors.passeportPdf" class="text-red-300 text-xs mt-1">
              {{ errors.passeportPdf }}
            </p>
            <div
              v-if="form.passeportPdf"
              class="flex items-center mt-2 text-green-400 text-sm"
            >
              <CheckCircleIcon class="w-4 h-4 mr-1" />
              {{ form.passeportPdf.name }}
            </div>
          </div>

          <!-- Residence Permit (conditional) -->
          <div v-if="form.nationality === 'other'">
            <label class="block text-blue-100 text-sm font-medium mb-2">
              Residence Permit (.pdf) *
            </label>
            <input
              ref="residencePermitRef"
              @change="handleFileChange($event, 'residencePermit')"
              type="file"
              accept=".pdf"
              class="file-input"
              :class="{ 'border-red-400': errors.residencePermit }"
            />
            <p v-if="errors.residencePermit" class="text-red-300 text-xs mt-1">
              {{ errors.residencePermit }}
            </p>
            <div
              v-if="form.residencePermit"
              class="flex items-center mt-2 text-green-400 text-sm"
            >
              <CheckCircleIcon class="w-4 h-4 mr-1" />
              {{ form.residencePermit.name }}
            </div>
          </div>
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
