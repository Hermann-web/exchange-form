<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useSubmissionStore } from '@/stores/submission';
import {
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  PaperClipIcon,
  ArrowDownTrayIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/vue/24/outline';

const router = useRouter();
const authStore = useAuthStore();
const submissionStore = useSubmissionStore();

// Computed properties
const submission = computed(() => submissionStore.mySubmission);
const schoolLabels: Record<string, string> = {
  centrale_casablanca: 'Centrale Casablanca',
  centrale_supelec: 'CentraleSupélec',
  centrale_nantes: 'Centrale Nantes',
  centrale_lille: 'Centrale Lille',
  centrale_marseille: 'Centrale Marseille',
  centrale_lyon: 'Centrale Lyon',
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getElectives = (electivesString: string) => {
  if (!electivesString) return [];
  return electivesString
    .split(';')
    .map((e) => e.trim())
    .filter((e) => e.length > 0);
};

// Download file handler
const downloadFile = (url: string, filename: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
          <!-- <div class="hidden sm:block">•</div>
          <div class="flex items-center">
            <DocumentTextIcon class="w-4 h-4 mr-2" />
            Application ID: {{ submission.storageId }}
          </div> -->
        </div>
      </div>

      <!-- Personal Information -->
      <div class="glass rounded-xl p-6">
        <h2 class="text-xl font-semibold text-white mb-6 flex items-center">
          <UserIcon class="w-5 h-5 mr-2" />
          Personal Information
        </h2>

        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <label class="block text-blue-300 text-sm font-medium mb-1">Full Name</label>
            <p class="text-white">{{ submission.firstName }} {{ submission.lastName }}</p>
          </div>

          <div>
            <label class="block text-blue-300 text-sm font-medium mb-1">Email</label>
            <p class="text-white">{{ submission.email }}</p>
          </div>

          <div>
            <label class="block text-blue-300 text-sm font-medium mb-1"
              >Nationality</label
            >
            <p class="text-white capitalize">
              {{ submission.nationality === 'moroccan' ? 'Moroccan' : 'Other' }}
            </p>
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
          <!-- First Choice -->
          <div>
            <h3 class="text-lg font-medium text-green-300 mb-4">🥇 First Choice</h3>
            <div class="bg-white/5 rounded-lg p-4 space-y-3">
              <div class="grid md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-blue-300 text-sm font-medium mb-1"
                    >School</label
                  >
                  <p class="text-white font-medium">
                    {{ schoolLabels[submission.school1] }}
                  </p>
                </div>

                <div>
                  <label class="block text-blue-300 text-sm font-medium mb-1"
                    >Program</label
                  >
                  <p class="text-white">{{ submission.program1 }}</p>
                </div>
              </div>

              <div v-if="submission.thematicSequence1" class="pt-2">
                <label class="block text-blue-300 text-sm font-medium mb-1"
                  >Thematic Sequence</label
                >
                <p class="text-white">{{ submission.thematicSequence1 }}</p>
              </div>

              <div v-if="submission.electives1" class="pt-2">
                <label class="block text-blue-300 text-sm font-medium mb-2"
                  >Electives</label
                >
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="elective in getElectives(submission.electives1)"
                    :key="elective"
                    class="bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full text-sm"
                  >
                    {{ elective }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Second Choice -->
          <div>
            <h3 class="text-lg font-medium text-yellow-300 mb-4">🥈 Second Choice</h3>
            <div class="bg-white/5 rounded-lg p-4 space-y-3">
              <div class="grid md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-blue-300 text-sm font-medium mb-1"
                    >School</label
                  >
                  <p class="text-white font-medium">
                    {{ schoolLabels[submission.school2] }}
                  </p>
                </div>

                <div>
                  <label class="block text-blue-300 text-sm font-medium mb-1"
                    >Program</label
                  >
                  <p class="text-white">{{ submission.program2 }}</p>
                </div>
              </div>

              <div v-if="submission.thematicSequence2" class="pt-2">
                <label class="block text-blue-300 text-sm font-medium mb-1"
                  >Thematic Sequence</label
                >
                <p class="text-white">{{ submission.thematicSequence2 }}</p>
              </div>

              <div v-if="submission.electives2" class="pt-2">
                <label class="block text-blue-300 text-sm font-medium mb-2"
                  >Electives</label
                >
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="elective in getElectives(submission.electives2)"
                    :key="elective"
                    class="bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full text-sm"
                  >
                    {{ elective }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Submitted Documents -->
      <div class="glass rounded-xl p-6">
        <h2 class="text-xl font-semibold text-white mb-6 flex items-center">
          <PaperClipIcon class="w-5 h-5 mr-2" />
          Submitted Documents
        </h2>

        <div class="space-y-4">
          <!-- Application Form -->
          <div class="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div class="flex items-center">
              <DocumentTextIcon class="w-6 h-6 text-blue-300 mr-3" />
              <div>
                <p class="text-white font-medium">Application Form</p>
                <p class="text-blue-300 text-sm">Microsoft Word Document (.docx)</p>
              </div>
            </div>
            <button
              @click="
                downloadFile(submission.applicationFormUrl, 'application-form.docx')
              "
              class="btn-secondary flex items-center py-2 px-4"
            >
              <ArrowDownTrayIcon class="w-4 h-4 mr-2" />
              Download
            </button>
          </div>

          <!-- Resume -->
          <div class="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div class="flex items-center">
              <AcademicCapIcon class="w-6 h-6 text-blue-300 mr-3" />
              <div>
                <p class="text-white font-medium">Resume/CV</p>
                <p class="text-blue-300 text-sm">PDF Document (.pdf)</p>
              </div>
            </div>
            <button
              @click="downloadFile(submission.resumeUrl, 'resume.pdf')"
              class="btn-secondary flex items-center py-2 px-4"
            >
              <ArrowDownTrayIcon class="w-4 h-4 mr-2" />
              Download
            </button>
          </div>

          <!-- S5 Transcripts -->
          <div class="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div class="flex items-center">
              <DocumentTextIcon class="w-6 h-6 text-blue-300 mr-3" />
              <div>
                <p class="text-white font-medium">S5 Transcripts</p>
                <p class="text-blue-300 text-sm">PDF Document (.pdf)</p>
              </div>
            </div>
            <button
              @click="downloadFile(submission.s5TranscriptsUrl, 's5-transcripts.pdf')"
              class="btn-secondary flex items-center py-2 px-4"
            >
              <ArrowDownTrayIcon class="w-4 h-4 mr-2" />
              Download
            </button>
          </div>

          <!-- S6 Transcripts -->
          <div class="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div class="flex items-center">
              <DocumentTextIcon class="w-6 h-6 text-blue-300 mr-3" />
              <div>
                <p class="text-white font-medium">S6 Transcripts</p>
                <p class="text-blue-300 text-sm">PDF Document (.pdf)</p>
              </div>
            </div>
            <button
              @click="downloadFile(submission.s6TranscriptsUrl, 's6-transcripts.pdf')"
              class="btn-secondary flex items-center py-2 px-4"
            >
              <ArrowDownTrayIcon class="w-4 h-4 mr-2" />
              Download
            </button>
          </div>

          <!-- Learning Agreement School 1 -->
          <div class="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div class="flex items-center">
              <DocumentTextIcon class="w-6 h-6 text-blue-300 mr-3" />
              <div>
                <p class="text-white font-medium">Learning Agreement School 1</p>
                <p class="text-blue-300 text-sm">PDF Document (.pdf)</p>
              </div>
            </div>
            <button
              @click="
                downloadFile(submission.school1LearningAgreementUrl, 'la_school1.pdf')
              "
              class="btn-secondary flex items-center py-2 px-4"
            >
              <ArrowDownTrayIcon class="w-4 h-4 mr-2" />
              Download
            </button>
          </div>

          <!-- Learning Agreement School 2 -->
          <div class="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div class="flex items-center">
              <DocumentTextIcon class="w-6 h-6 text-blue-300 mr-3" />
              <div>
                <p class="text-white font-medium">Learning Agreement School 2</p>
                <p class="text-blue-300 text-sm">PDF Document (.pdf)</p>
              </div>
            </div>
            <button
              @click="
                downloadFile(submission.school2LearningAgreementUrl, 'la_school2.pdf')
              "
              class="btn-secondary flex items-center py-2 px-4"
            >
              <ArrowDownTrayIcon class="w-4 h-4 mr-2" />
              Download
            </button>
          </div>

          <!-- Passeport -->
          <div class="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div class="flex items-center">
              <DocumentTextIcon class="w-6 h-6 text-blue-300 mr-3" />
              <div>
                <p class="text-white font-medium">Passeport</p>
                <p class="text-blue-300 text-sm">PDF Document (.pdf)</p>
              </div>
            </div>
            <button
              @click="downloadFile(submission.passeportUrl, 'passeport.pdf')"
              class="btn-secondary flex items-center py-2 px-4"
            >
              <ArrowDownTrayIcon class="w-4 h-4 mr-2" />
              Download
            </button>
          </div>

          <!-- Residence Permit (if applicable) -->
          <div
            v-if="submission.residencePermitUrl"
            class="flex items-center justify-between p-4 bg-white/5 rounded-lg"
          >
            <div class="flex items-center">
              <DocumentTextIcon class="w-6 h-6 text-blue-300 mr-3" />
              <div>
                <p class="text-white font-medium">Residence Permit</p>
                <p class="text-blue-300 text-sm">PDF Document (.pdf)</p>
              </div>
            </div>
            <button
              @click="downloadFile(submission.residencePermitUrl, 'residence-permit.pdf')"
              class="btn-secondary flex items-center py-2 px-4"
            >
              <ArrowDownTrayIcon class="w-4 h-4 mr-2" />
              Download
            </button>
          </div>
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

        <div class="mt-6 text-center">
          <p class="text-blue-200 text-sm">
            For any questions about your application, please contact the exchange office
            at
            <a
              href="mailto:exchange@centrale-casablanca.ma"
              class="text-blue-300 hover:text-white underline"
            >
              exchange@centrale-casablanca.ma
            </a>
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-center">
        <router-link to="/dashboard" class="btn-primary"> Back to Dashboard </router-link>
      </div>
    </div>
  </div>
</template>
