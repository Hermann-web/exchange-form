<!-- src/components/SchoolChoice.vue -->
<script setup lang="ts">
import { watch, computed } from 'vue';
import type { SubmissionForm } from '@/types/submissionapi';
import type {
  SchoolChoiceConfig,
  SchoolOption,
  SubmissionErrorType,
} from '@/components/types';

interface Props {
  choice: SchoolChoiceConfig;
  form: SubmissionForm;
  errors: SubmissionErrorType;
  schoolOptions: SchoolOption[];
}

const props = defineProps<Props>();

// Computed properties for constraints validation
const selectedSchool = computed(() => props.form[props.choice.choiceKey].schoolName);

// Validate thematic sequence
const validateThematicSequence = () => {
  const choiceKey = props.choice.choiceKey;
  const schoolObj = props.form[choiceKey];

  if (
    ['s9_centrale_supelec_gif', 's9_centrale_mediterranee'].includes(schoolObj.schoolName)
  ) {
    const thematicValue = schoolObj.academicPath;
    console.log('thematicValue = ', thematicValue);
    props.errors[choiceKey] = !thematicValue?.trim() ? 'Séquence thématique requise' : '';
  } else {
    props.errors[choiceKey] = '';
  }
};

// Watch for school changes and empty all fields
watch(selectedSchool, () => {
  // If switching to 'unset', clear all fields
  props.form[props.choice.choiceKey].academicPath = '';

  // Revalidate after school change to be ultra safe
  validateSchool();
  validateThematicSequence();
});

// Watch for thematic sequence changes
watch(() => props.form[props.choice.choiceKey].academicPath, validateThematicSequence);

const validateSchool = () => {
  const choiceKey = props.choice.choiceKey;
  const schoolObj = props.form[choiceKey];

  if (choiceKey === 'choice1' && schoolObj.schoolName == 'unset') {
    props.errors[choiceKey] = 'Le premier choix doit être mentionné';
    return;
  }
  props.errors[choiceKey] = '';
};
watch(() => props.form[props.choice.choiceKey].schoolName, validateSchool);

// Initialize validation on mount
watch(
  () => props.form,
  () => {
    validateSchool();
    validateThematicSequence();
  },
  { immediate: true }
);
</script>

<template>
  <div :class="choice.bgClass" class="rounded-lg border p-6">
    <h3 class="text-lg font-medium text-blue-200 mb-4 flex items-center">
      <span class="mr-2">{{ choice.emoji }}</span>
      {{ choice.text }}
    </h3>

    <div class="grid md:grid-cols-2 gap-6">
      <!-- School Selection -->
      <div>
        <label class="block text-blue-100 text-sm font-medium mb-2">École *</label>
        <select
          v-model="form[choice.choiceKey].schoolName"
          class="input-field"
          :class="{ 'border-red-500 focus:border-red-400': errors[choice.choiceKey] }"
        >
          <option
            v-for="school in props.schoolOptions"
            :key="school.value"
            :value="school.value"
          >
            {{ school.label }}
          </option>
        </select>
        <p v-if="errors[choice.choiceKey]" class="text-red-300 text-xs mt-1">
          {{ errors[choice.choiceKey] }}
        </p>
      </div>

      <div
        v-if="
          ['s9_centrale_supelec_gif', 's9_centrale_mediterranee'].includes(
            form[choice.choiceKey].schoolName
          )
        "
      >
        <label class="block text-blue-100 text-sm font-medium mb-2">
          {{
            form[choice.choiceKey].schoolName === 's9_centrale_supelec_gif'
              ? 'Séquence Thématique *'
              : 'Parcours *'
          }}
        </label>
        <input
          v-model="form[choice.choiceKey].academicPath"
          type="text"
          class="input-field"
          :class="{ 'border-red-500 focus:border-red-400': errors[choice.choiceKey] }"
          :placeholder="
            form[choice.choiceKey].schoolName === 's9_centrale_supelec_gif'
              ? 'Saisir la séquence thématique'
              : 'Saisir le parcours'
          "
        />
        <p v-if="errors[choice.choiceKey]" class="text-red-300 text-xs mt-1">
          {{ errors[choice.choiceKey] }}
        </p>
      </div>
    </div>
  </div>
</template>
