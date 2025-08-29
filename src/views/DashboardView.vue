<template>
  <div class="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
    <div class="glass rounded-2xl p-8 mb-8">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-white mb-4">Welcome to S8 Mobility</h1>
        <p class="text-blue-100 text-lg mb-8">
          Ready to take your studies abroad? Submit your mobility dossier below.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link to="/dossier" class="btn-primary inline-flex items-center">
            <DocumentTextIcon class="w-5 h-5 mr-2" />
            Submit Dossier
          </router-link>
          <button class="btn-secondary inline-flex items-center">
            <ClipboardDocumentListIcon class="w-5 h-5 mr-2" />
            View My Application
          </button>
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
              Academic Transcripts
            </li>
            <li class="flex items-center">
              <CheckIcon class="w-4 h-4 text-green-400 mr-2" />
              Curriculum Vitae
            </li>
            <li class="flex items-center">
              <CheckIcon class="w-4 h-4 text-green-400 mr-2" />
              Motivation Letter
            </li>
            <li class="flex items-center">
              <CheckIcon class="w-4 h-4 text-green-400 mr-2" />
              Language Certificates
            </li>
          </ul>
        </div>
        <div>
          <h3 class="text-lg font-medium text-blue-200 mb-3">Important Dates</h3>
          <ul class="space-y-2 text-blue-100">
            <li><strong>Application Deadline:</strong> March 15, 2025</li>
            <li><strong>Interview Period:</strong> April 1-15, 2025</li>
            <li><strong>Results Announcement:</strong> May 1, 2025</li>
            <li><strong>Mobility Period:</strong> September 2025 - January 2026</li>
          </ul>
        </div>
      </div>
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
