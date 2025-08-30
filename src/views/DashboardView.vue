// src/views/DashboardView.vue
<template>
  <div class="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
    <div class="glass rounded-2xl p-8 mb-8">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-white mb-4">Welcome to S8 Exchange</h1>
        <p class="text-blue-100 text-lg mb-8">
          Ready to take your studies abroad? Submit your exchange application below.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link to="/add-submission" class="btn-primary inline-flex items-center">
            <DocumentTextIcon class="w-5 h-5 mr-2" />
            Submit Application
          </router-link>
          <router-link
            to="/read-submission"
            class="btn-secondary inline-flex items-center"
          >
            <ClipboardDocumentListIcon class="w-5 h-5 mr-2" />
            View My Application
          </router-link>
        </div>
      </div>
    </div>

    <div class="glass rounded-xl p-6">
      <h2 class="text-2xl font-semibold text-white mb-4">Application Requirements</h2>
      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <h3 class="text-lg font-medium text-blue-200 mb-3">Required Documents</h3>
          <ul class="space-y-2 text-blue-100">
            <li class="flex items-center">
              <CheckIcon class="w-4 h-4 text-green-400 mr-2" />
              Application Form including learning agreements
            </li>
            <li class="flex items-center">
              <CheckIcon class="w-4 h-4 text-green-400 mr-2" />
              Academic Transcripts (S5, S6)
            </li>
            <li class="flex items-center">
              <CheckIcon class="w-4 h-4 text-green-400 mr-2" />
              Curriculum Vitae
            </li>
            <li class="flex items-center">
              <CheckIcon class="w-4 h-4 text-green-400 mr-2" />
              CIN (For non Moroccan) and Passeport
            </li>
            <li class="flex items-center">
              <CheckIcon class="w-4 h-4 text-green-400 mr-2" />
              Learning Agreements in two separate files
            </li>
          </ul>
        </div>
        <div>
          <h3 class="text-lg font-medium text-blue-200 mb-3">Important Dates</h3>
          <ul class="space-y-2 text-blue-100">
            <li><strong>Application Deadline:</strong> September 25, 2025</li>
            <li><strong>Review Period (ECC):</strong> October 1-10, 2025</li>
            <li><strong>Review Period (Partner):</strong> October 15-25, 2025</li>
            <li><strong>Results Announcement:</strong> November 10, 2025</li>
            <li><strong>Exchange Period:</strong> January 2026 - April 2026</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Critical Information -->
    <div class="glass rounded-xl p-6 mt-8">
      <h2 class="text-2xl font-semibold text-red-400 mb-4">⚠️ Critical Information</h2>
      <ul class="space-y-2 text-blue-100">
        <li class="flex items-start">
          <ExclamationCircleIcon class="w-5 h-5 text-red-400 mr-2 mt-0.5" />
          <span>
            All information and documents submitted must be
            <strong>true and accurate</strong>. Any false declaration will result in
            <strong>automatic rejection</strong> of the application.
          </span>
        </li>
        <li class="flex items-start">
          <ExclamationCircleIcon class="w-5 h-5 text-red-400 mr-2 mt-0.5" />
          <span>
            The platform will <strong>automatically close</strong> after the deadline.
            <u>No late submissions</u> will be possible.
            <u>No submissions via mail will be looked up, before or after the deadline</u
            >.
          </span>
        </li>
        <li class="flex items-start">
          <ExclamationCircleIcon class="w-5 h-5 text-red-400 mr-2 mt-0.5" />
          <span>
            Your chosen courses must respect <strong>ECTS credit equivalence</strong>.
            Check that the total matches your academic requirements.
          </span>
        </li>
        <li class="flex items-start">
          <ExclamationCircleIcon class="w-5 h-5 text-red-400 mr-2 mt-0.5" />
          <span>
            <strong>Electives</strong> are the student’s responsibility: please consult
            the partner school websites for up-to-date course availability.
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  CheckIcon,
} from '@heroicons/vue/24/outline';
</script>
