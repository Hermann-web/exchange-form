<!-- src/components/SchoolChoiceDisplay.vue -->
<script setup lang="ts">
import type { SchoolChoiceConfig } from '@/components/types';
import { schoolLabels } from '@/types/submissionapi';
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
      {{ choice.emoji }}
      {{ choice.text }}
    </h4>

    <div class="space-y-2 text-sm" v-if="compact">
      <div class="flex justify-between">
        <span class="text-blue-300">École:</span>
        <span class="text-white font-medium">
          {{ schoolLabels[submission[choice.schoolKey].schoolName] }}
        </span>
      </div>
      <div
        v-if="submission[choice.schoolKey].thematicSequence"
        class="flex justify-between"
      >
        <span class="text-blue-300">Séquence Thématique:</span>
        <span class="text-white">{{
          submission[choice.schoolKey].thematicSequence
        }}</span>
      </div>
    </div>

    <div v-else class="space-y-3">
      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <label class="block text-blue-300 text-sm font-medium mb-1">École</label>
          <p class="text-white font-medium">
            {{ schoolLabels[submission[choice.schoolKey].schoolName] }}
          </p>
        </div>
      </div>

      <div v-if="submission[choice.schoolKey].thematicSequence" class="pt-2">
        <label class="block text-blue-300 text-sm font-medium mb-1">
          Séquence Thématique
        </label>
        <p class="text-white">{{ submission[choice.schoolKey].thematicSequence }}</p>
      </div>
    </div>
  </div>
</template>
