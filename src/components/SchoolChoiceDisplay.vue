<!-- SchoolChoiceDisplay.vue -->
<script setup lang="ts">
import type { SchoolChoiceConfig } from '@/components/types';
import { schoolLabels, getElectives } from '@/components/types';
import type { SubmissionMetaDb } from '@/types/submissionapi';

interface Props {
  choice: SchoolChoiceConfig;
  submission: SubmissionMetaDb;
  compact?: boolean;
}

const { choice, submission, compact } = defineProps<Props>();
</script>

<template>
  <div
    :class="compact ? 'bg-white/5 rounded-lg p-4' : 'bg-white/5 rounded-lg p-4 space-y-3'"
  >
    <h4
      :class="
        compact
          ? 'font-medium mb-3 flex items-center text-sm'
          : 'text-lg font-medium mb-4'
      "
    >
      {{ choice.emoji }} {{ choice.title }}
    </h4>

    <div class="space-y-2 text-sm" v-if="compact">
      <div class="flex justify-between">
        <span class="text-blue-300">School:</span>
        <span class="text-white font-medium">
          {{ schoolLabels[submission[choice.schoolKey]] }}
        </span>
      </div>
      <div class="flex justify-between">
        <span class="text-blue-300">Program:</span>
        <span class="text-white">{{ submission[choice.programKey] }}</span>
      </div>
      <div v-if="submission[choice.thematicKey]" class="flex justify-between">
        <span class="text-blue-300">Sequence:</span>
        <span class="text-white">{{ submission[choice.thematicKey] }}</span>
      </div>
      <div v-if="submission[choice.electivesKey]" class="mt-3">
        <span class="text-blue-300 text-xs">Electives:</span>
        <div class="flex flex-wrap gap-1 mt-1">
          <span
            v-for="elective in getElectives(submission[choice.electivesKey])"
            :key="elective"
            :class="
              choice.title.includes('First')
                ? 'bg-green-500/20 text-green-200'
                : 'bg-yellow-500/20 text-yellow-200'
            "
            class="px-2 py-1 rounded text-xs"
          >
            {{ elective }}
          </span>
        </div>
      </div>
    </div>

    <div v-else class="space-y-3">
      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <label class="block text-blue-300 text-sm font-medium mb-1">School</label>
          <p class="text-white font-medium">
            {{ schoolLabels[submission[choice.schoolKey]] }}
          </p>
        </div>
        <div>
          <label class="block text-blue-300 text-sm font-medium mb-1">Program</label>
          <p class="text-white">{{ submission[choice.programKey] }}</p>
        </div>
      </div>

      <div v-if="submission[choice.thematicKey]" class="pt-2">
        <label class="block text-blue-300 text-sm font-medium mb-1">
          Thematic Sequence
        </label>
        <p class="text-white">{{ submission[choice.thematicKey] }}</p>
      </div>

      <div v-if="submission[choice.electivesKey]" class="pt-2">
        <label class="block text-blue-300 text-sm font-medium mb-2">Electives</label>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="elective in getElectives(submission[choice.electivesKey])"
            :key="elective"
            class="bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full text-sm"
          >
            {{ elective }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
