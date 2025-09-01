<!-- src/views/AllSubmissions.vue -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useSubmissionStore } from '@/stores/submission';
import type { SubmissionMetaDb, School } from '@/types/submissionapi';
import {
  UsersIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
} from '@heroicons/vue/24/outline';

// Shared configuration and components
import { schoolOptions, schoolLabels, downloadFile } from '@/components/types';
import SubmissionCard from '@/components/SubmissionCard.vue';

const submissionStore = useSubmissionStore();

// Filter and search state
const searchQuery = ref('');
const selectedSchool = ref<School | 'all'>('all');
const selectedNationality = ref<'all' | 'moroccan' | 'other'>('all');
const sortBy = ref<'date' | 'name' | 'school'>('date');
const sortOrder = ref<'asc' | 'desc'>('desc');

// Filter options configuration
const filterOptions = {
  schools: [{ value: 'all' as const, label: 'All Schools' }, ...schoolOptions],
  nationalities: [
    { value: 'all' as const, label: 'All Nationalities' },
    { value: 'moroccan' as const, label: 'Moroccan' },
    { value: 'other' as const, label: 'International' },
  ],
  sortBy: [
    { value: 'date' as const, label: 'Sort by Date' },
    { value: 'name' as const, label: 'Sort by Name' },
    { value: 'school' as const, label: 'Sort by School' },
  ],
};

// Computed properties
const filteredAndSortedSubmissions = computed(() => {
  let filtered = [...submissionStore.allSubmissions];

  // Apply filters
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (sub) =>
        sub.firstName.toLowerCase().includes(query) ||
        sub.lastName.toLowerCase().includes(query) ||
        sub.email.toLowerCase().includes(query)
    );
  }

  if (selectedSchool.value !== 'all') {
    filtered = filtered.filter(
      (sub) =>
        sub.school1 === selectedSchool.value || sub.school2 === selectedSchool.value
    );
  }

  if (selectedNationality.value !== 'all') {
    filtered = filtered.filter((sub) => sub.nationality === selectedNationality.value);
  }

  // Apply sorting
  filtered.sort((a, b) => {
    let comparison = 0;

    switch (sortBy.value) {
      case 'date':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'name':
        comparison = `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`
        );
        break;
      case 'school':
        comparison = schoolLabels[a.school1].localeCompare(schoolLabels[b.school1]);
        break;
    }

    return sortOrder.value === 'asc' ? comparison : -comparison;
  });

  return filtered;
});

const statistics = computed(() => submissionStore.getStatistics);

// Action handlers
const downloadSubmissionData = (submission: SubmissionMetaDb) => {
  const dataStr = JSON.stringify(submission, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  downloadFile(url, `submission-${submission.firstName}-${submission.lastName}.json`);
  URL.revokeObjectURL(url);
};

const downloadAllSubmissions = () => {
  const dataStr = JSON.stringify(filteredAndSortedSubmissions.value, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  downloadFile(url, `all-submissions-${new Date().toISOString().split('T')[0]}.json`);
  URL.revokeObjectURL(url);
};

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
};

// Initialize data
onMounted(async () => {
  await submissionStore.fetchAllSubmissions();
});
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="glass rounded-2xl p-6 sm:p-8 mb-8">
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center">
        <div class="mb-4 lg:mb-0">
          <h1 class="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center">
            <UsersIcon class="w-6 sm:w-8 h-6 sm:h-8 mr-3" />
            Submissions Dashboard
          </h1>
          <p class="text-blue-100 text-sm sm:text-base">
            Manage and review all student mobility applications
          </p>
        </div>
        <button
          @click="downloadAllSubmissions"
          class="btn-primary flex items-center text-sm sm:text-base"
          :disabled="filteredAndSortedSubmissions.length === 0"
        >
          <ArrowDownTrayIcon class="w-4 h-4 mr-2" />
          Export All ({{ filteredAndSortedSubmissions.length }})
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="submissionStore.isLoading" class="glass rounded-xl p-8 text-center">
      <div class="animate-pulse space-y-4">
        <div class="w-16 h-16 bg-blue-300/20 rounded-full mx-auto"></div>
        <div class="h-4 bg-blue-300/20 rounded w-1/2 mx-auto"></div>
        <div class="space-y-2">
          <div class="h-3 bg-blue-300/20 rounded"></div>
          <div class="h-3 bg-blue-300/20 rounded w-4/5"></div>
          <div class="h-3 bg-blue-300/20 rounded w-3/5"></div>
        </div>
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

    <template v-else>
      <!-- Quick Stats -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div class="glass rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-blue-300 mb-1">{{ statistics.total }}</div>
          <div class="text-blue-200 text-xs sm:text-sm">Total</div>
        </div>
        <div class="glass rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-green-300 mb-1">
            {{ statistics.byNationality.moroccan }}
          </div>
          <div class="text-blue-200 text-xs sm:text-sm">Moroccan</div>
        </div>
        <div class="glass rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-yellow-300 mb-1">
            {{ statistics.byNationality.other }}
          </div>
          <div class="text-blue-200 text-xs sm:text-sm">International</div>
        </div>
        <div class="glass rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-purple-300 mb-1">
            {{ Object.values(statistics.bySchool).filter((count) => count > 0).length }}
          </div>
          <div class="text-blue-200 text-xs sm:text-sm">Schools</div>
        </div>
      </div>

      <!-- Filters & Controls -->
      <div class="glass rounded-xl p-4 sm:p-6 mb-6">
        <div class="flex flex-col lg:flex-row gap-4">
          <!-- Search -->
          <div class="flex-1 relative">
            <MagnifyingGlassIcon
              class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by name, email, or program..."
              class="input-field pl-10 w-full"
            />
          </div>

          <!-- Filters Row -->
          <div class="flex flex-col sm:flex-row gap-4">
            <select v-model="selectedSchool" class="input-field min-w-0 sm:min-w-[160px]">
              <option
                v-for="school in filterOptions.schools"
                :key="school.value"
                :value="school.value"
              >
                {{ school.label }}
              </option>
            </select>

            <select
              v-model="selectedNationality"
              class="input-field min-w-0 sm:min-w-[140px]"
            >
              <option
                v-for="nationality in filterOptions.nationalities"
                :key="nationality.value"
                :value="nationality.value"
              >
                {{ nationality.label }}
              </option>
            </select>

            <select v-model="sortBy" class="input-field min-w-0 sm:min-w-[120px]">
              <option
                v-for="sort in filterOptions.sortBy"
                :key="sort.value"
                :value="sort.value"
              >
                {{ sort.label }}
              </option>
            </select>

            <button
              @click="toggleSortOrder"
              class="btn-secondary px-3 py-2 text-sm"
              :class="{ 'bg-blue-500/20': sortOrder === 'desc' }"
            >
              {{ sortOrder === 'asc' ? '↑' : '↓' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Results -->
      <div class="space-y-4">
        <!-- No Results -->
        <div
          v-if="filteredAndSortedSubmissions.length === 0"
          class="glass rounded-xl p-8 text-center"
        >
          <ExclamationCircleIcon class="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-white mb-2">No submissions found</h3>
          <p class="text-blue-200">Try adjusting your search or filter criteria.</p>
        </div>

        <!-- Submissions List -->
        <SubmissionCard
          v-for="submission in filteredAndSortedSubmissions"
          :key="submission.databaseId"
          :submission="submission"
          @download-submission="downloadSubmissionData"
          @download-file="downloadFile"
        />
      </div>
    </template>
  </div>
</template>
