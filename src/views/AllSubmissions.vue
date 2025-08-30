<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useSubmissionStore } from '@/stores/submission';
import type { SubmissionMetaDb, School } from '@/types/submissionapi';
import {
  UsersIcon,
  DocumentTextIcon,
  CalendarIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ArrowDownTrayIcon,
} from '@heroicons/vue/24/outline';

const submissionStore = useSubmissionStore();

// Filter and search state
const searchQuery = ref('');
const selectedSchool = ref<School | 'all'>('all');
const selectedNationality = ref<'all' | 'moroccan' | 'other'>('all');
const sortBy = ref<'date' | 'name' | 'school'>('date');
const sortOrder = ref<'asc' | 'desc'>('desc');
const expandedSubmissions = ref(new Set<string>());

// School options for filter
const schoolOptions: { value: School | 'all'; label: string }[] = [
  { value: 'all', label: 'All Schools' },
  { value: 'centrale_supelec', label: 'CentraleSupélec' },
  { value: 'centrale_nantes', label: 'Centrale Nantes' },
  { value: 'centrale_lille', label: 'Centrale Lille' },
  { value: 'centrale_marseille', label: 'Centrale Marseille' },
  { value: 'centrale_lyon', label: 'Centrale Lyon' },
  { value: 'centrale_casablanca', label: 'Centrale Casablanca' },
];

const schoolLabels: Record<School, string> = {
  centrale_casablanca: 'Centrale Casablanca',
  centrale_supelec: 'CentraleSupélec',
  centrale_nantes: 'Centrale Nantes',
  centrale_lille: 'Centrale Lille',
  centrale_marseille: 'Centrale Marseille',
  centrale_lyon: 'Centrale Lyon',
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
        sub.email.toLowerCase().includes(query) ||
        sub.program1.toLowerCase().includes(query) ||
        sub.program2.toLowerCase().includes(query)
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

// Helper functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDateShort = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const toggleExpanded = (submissionId: string) => {
  if (expandedSubmissions.value.has(submissionId)) {
    expandedSubmissions.value.delete(submissionId);
  } else {
    expandedSubmissions.value.add(submissionId);
  }
};

const isExpanded = (submissionId: string) => {
  return expandedSubmissions.value.has(submissionId);
};

const getElectives = (electivesString: string) => {
  if (!electivesString) return [];
  return electivesString
    .split(';')
    .map((e) => e.trim())
    .filter((e) => e.length > 0);
};

// Download functions
const downloadSubmissionData = (submission: SubmissionMetaDb) => {
  const dataStr = JSON.stringify(submission, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `submission-${submission.firstName}-${submission.lastName}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

const downloadAllSubmissions = () => {
  const dataStr = JSON.stringify(filteredAndSortedSubmissions.value, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `all-submissions-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

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
                v-for="school in schoolOptions"
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
              <option value="all">All Nationalities</option>
              <option value="moroccan">Moroccan</option>
              <option value="other">International</option>
            </select>

            <select v-model="sortBy" class="input-field min-w-0 sm:min-w-[120px]">
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="school">Sort by School</option>
            </select>

            <button
              @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'"
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
        <div
          v-for="submission in filteredAndSortedSubmissions"
          :key="submission.databaseId"
          class="glass rounded-xl overflow-hidden"
        >
          <!-- Main Row -->
          <div class="p-4 sm:p-6">
            <div class="flex items-center justify-between">
              <!-- Student Info -->
              <div class="flex items-center min-w-0 flex-1">
                <div
                  class="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0"
                >
                  <span class="text-white font-semibold text-sm">
                    {{ submission.firstName.charAt(0)
                    }}{{ submission.lastName.charAt(0) }}
                  </span>
                </div>
                <div class="min-w-0 flex-1">
                  <h3 class="text-base sm:text-lg font-semibold text-white truncate">
                    {{ submission.firstName }} {{ submission.lastName }}
                  </h3>
                  <div
                    class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1"
                  >
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
                  <div class="text-xs text-blue-300">{{ submission.program1 }}</div>
                </div>
                <button
                  @click="toggleExpanded(submission.databaseId)"
                  class="btn-secondary p-2 text-sm"
                >
                  <EyeIcon class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Mobile School Info -->
            <div class="sm:hidden mt-3 pt-3 border-t border-white/10">
              <div class="text-sm font-medium text-white">
                {{ schoolLabels[submission.school1] }}
              </div>
              <div class="text-xs text-blue-300">{{ submission.program1 }}</div>
            </div>
          </div>

          <!-- Expanded Details -->
          <div
            v-if="isExpanded(submission.databaseId)"
            class="border-t border-white/10 bg-white/5"
          >
            <div class="p-4 sm:p-6 space-y-6">
              <!-- Mobility Choices -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- First Choice -->
                <div class="bg-white/5 rounded-lg p-4">
                  <h4 class="text-green-300 font-medium mb-3 flex items-center text-sm">
                    🥇 First Choice
                  </h4>
                  <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                      <span class="text-blue-300">School:</span>
                      <span class="text-white font-medium">{{
                        schoolLabels[submission.school1]
                      }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-blue-300">Program:</span>
                      <span class="text-white">{{ submission.program1 }}</span>
                    </div>
                    <div v-if="submission.thematicSequence1" class="flex justify-between">
                      <span class="text-blue-300">Sequence:</span>
                      <span class="text-white">{{ submission.thematicSequence1 }}</span>
                    </div>
                    <div v-if="submission.electives1" class="mt-3">
                      <span class="text-blue-300 text-xs">Electives:</span>
                      <div class="flex flex-wrap gap-1 mt-1">
                        <span
                          v-for="elective in getElectives(submission.electives1)"
                          :key="elective"
                          class="bg-green-500/20 text-green-200 px-2 py-1 rounded text-xs"
                        >
                          {{ elective }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Second Choice -->
                <div class="bg-white/5 rounded-lg p-4">
                  <h4 class="text-yellow-300 font-medium mb-3 flex items-center text-sm">
                    🥈 Second Choice
                  </h4>
                  <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                      <span class="text-blue-300">School:</span>
                      <span class="text-white font-medium">{{
                        schoolLabels[submission.school2]
                      }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-blue-300">Program:</span>
                      <span class="text-white">{{ submission.program2 }}</span>
                    </div>
                    <div v-if="submission.thematicSequence2" class="flex justify-between">
                      <span class="text-blue-300">Sequence:</span>
                      <span class="text-white">{{ submission.thematicSequence2 }}</span>
                    </div>
                    <div v-if="submission.electives2" class="mt-3">
                      <span class="text-blue-300 text-xs">Electives:</span>
                      <div class="flex flex-wrap gap-1 mt-1">
                        <span
                          v-for="elective in getElectives(submission.electives2)"
                          :key="elective"
                          class="bg-yellow-500/20 text-yellow-200 px-2 py-1 rounded text-xs"
                        >
                          {{ elective }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Documents -->
              <div>
                <h4 class="text-blue-200 font-medium mb-3 flex items-center text-sm">
                  <DocumentTextIcon class="w-4 h-4 mr-2" />
                  Documents
                </h4>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  <button
                    @click="
                      downloadFile(
                        submission.applicationFormUrl,
                        `${submission.firstName}-${submission.lastName}-application.docx`
                      )
                    "
                    class="bg-white/5 hover:bg-white/10 rounded-lg p-3 text-center transition-all duration-200 group"
                  >
                    <DocumentTextIcon
                      class="w-5 h-5 text-blue-300 mx-auto mb-2 group-hover:text-white group-hover:scale-110 transition-all"
                    />
                    <span class="text-xs text-blue-200 group-hover:text-white block"
                      >Application</span
                    >
                  </button>

                  <button
                    @click="
                      downloadFile(
                        submission.resumeUrl,
                        `${submission.firstName}-${submission.lastName}-resume.pdf`
                      )
                    "
                    class="bg-white/5 hover:bg-white/10 rounded-lg p-3 text-center transition-all duration-200 group"
                  >
                    <AcademicCapIcon
                      class="w-5 h-5 text-blue-300 mx-auto mb-2 group-hover:text-white group-hover:scale-110 transition-all"
                    />
                    <span class="text-xs text-blue-200 group-hover:text-white block"
                      >Resume</span
                    >
                  </button>

                  <button
                    @click="
                      downloadFile(
                        submission.s5TranscriptsUrl,
                        `${submission.firstName}-${submission.lastName}-s5.pdf`
                      )
                    "
                    class="bg-white/5 hover:bg-white/10 rounded-lg p-3 text-center transition-all duration-200 group"
                  >
                    <DocumentTextIcon
                      class="w-5 h-5 text-blue-300 mx-auto mb-2 group-hover:text-white group-hover:scale-110 transition-all"
                    />
                    <span class="text-xs text-blue-200 group-hover:text-white block"
                      >S5</span
                    >
                  </button>

                  <button
                    @click="
                      downloadFile(
                        submission.s6TranscriptsUrl,
                        `${submission.firstName}-${submission.lastName}-s6.pdf`
                      )
                    "
                    class="bg-white/5 hover:bg-white/10 rounded-lg p-3 text-center transition-all duration-200 group"
                  >
                    <DocumentTextIcon
                      class="w-5 h-5 text-blue-300 mx-auto mb-2 group-hover:text-white group-hover:scale-110 transition-all"
                    />
                    <span class="text-xs text-blue-200 group-hover:text-white block"
                      >S6</span
                    >
                  </button>

                  <button
                    @click="
                      downloadFile(
                        submission.school1LearningAgreementUrl,
                        `${submission.firstName}-${submission.lastName}-la_school1.pdf`
                      )
                    "
                    class="bg-white/5 hover:bg-white/10 rounded-lg p-3 text-center transition-all duration-200 group"
                  >
                    <DocumentTextIcon
                      class="w-5 h-5 text-blue-300 mx-auto mb-2 group-hover:text-white group-hover:scale-110 transition-all"
                    />
                    <span class="text-xs text-blue-200 group-hover:text-white block"
                      >Learning Agreement School 1</span
                    >
                  </button>

                  <button
                    @click="
                      downloadFile(
                        submission.school2LearningAgreementUrl,
                        `${submission.firstName}-${submission.lastName}-la_school2.pdf`
                      )
                    "
                    class="bg-white/5 hover:bg-white/10 rounded-lg p-3 text-center transition-all duration-200 group"
                  >
                    <DocumentTextIcon
                      class="w-5 h-5 text-blue-300 mx-auto mb-2 group-hover:text-white group-hover:scale-110 transition-all"
                    />
                    <span class="text-xs text-blue-200 group-hover:text-white block"
                      >Learning Agreement School 2</span
                    >
                  </button>

                  <button
                    @click="
                      downloadFile(
                        submission.passeportUrl,
                        `${submission.firstName}-${submission.lastName}-passeport.pdf`
                      )
                    "
                    class="bg-white/5 hover:bg-white/10 rounded-lg p-3 text-center transition-all duration-200 group"
                  >
                    <DocumentTextIcon
                      class="w-5 h-5 text-blue-300 mx-auto mb-2 group-hover:text-white group-hover:scale-110 transition-all"
                    />
                    <span class="text-xs text-blue-200 group-hover:text-white block"
                      >Passeport</span
                    >
                  </button>

                  <button
                    v-if="submission.residencePermitUrl"
                    @click="
                      downloadFile(
                        submission.residencePermitUrl,
                        `${submission.firstName}-${submission.lastName}-permit.pdf`
                      )
                    "
                    class="bg-white/5 hover:bg-white/10 rounded-lg p-3 text-center transition-all duration-200 group"
                  >
                    <DocumentTextIcon
                      class="w-5 h-5 text-blue-300 mx-auto mb-2 group-hover:text-white group-hover:scale-110 transition-all"
                    />
                    <span class="text-xs text-blue-200 group-hover:text-white block"
                      >Permit</span
                    >
                  </button>
                </div>
              </div>

              <!-- Footer Actions -->
              <div
                class="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-white/10 gap-3"
              >
                <div class="text-xs text-blue-400 space-y-1">
                  <!-- <div>ID: {{ submission.storageId }}</div> -->
                  <div>Submitted: {{ formatDate(submission.createdAt) }}</div>
                </div>
                <div class="flex gap-2">
                  <button
                    @click="downloadSubmissionData(submission)"
                    class="btn-secondary text-xs py-2 px-3 flex items-center"
                  >
                    <ArrowDownTrayIcon class="w-3 h-3 mr-1" />
                    Export
                  </button>
                  <button
                    v-if="submission.metadataUrl"
                    @click="
                      downloadFile(
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
      </div>
    </template>
  </div>
</template>
