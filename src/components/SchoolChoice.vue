<!-- src/components/SchoolChoice.vue -->
<script setup lang="ts">
import { watch, computed } from 'vue';
import {
  type SubmissionForm,
  schoolAcademicPathKeyAndRequiredMap,
} from '@/types/submissionapi';
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

const schoolConfig = computed(
  () => schoolAcademicPathKeyAndRequiredMap[selectedSchool.value]
);

// Validate academic path
const validateAcademicPath = () => {
  const choiceKey = props.choice.choiceKey;
  const schoolObj = props.form[choiceKey];

  if (schoolConfig.value.academicPath.required) {
    const thematicValue = schoolObj.academicPath;
    props.errors[choiceKey] = !thematicValue?.trim()
      ? `${schoolConfig.value.academicPath.text} requis(e)`
      : '';
  } else {
    props.errors[choiceKey] = '';
  }
};

const validateCareerPath = () => {
  const choiceKey = props.choice.choiceKey;
  const schoolObj = props.form[choiceKey];

  if (schoolConfig.value.careerPath.required) {
    const careerValue = schoolObj.careerPath;
    props.errors[choiceKey] = !careerValue?.trim()
      ? `${schoolConfig.value.careerPath.text} requis(e)`
      : '';
  } else {
    props.errors[choiceKey] = '';
  }
};

// Watch for school changes and empty all fields
watch(selectedSchool, () => {
  // If changing school, clear all fields
  props.form[props.choice.choiceKey].academicPath = '';
  props.form[props.choice.choiceKey].careerPath = '';

  // Revalidate after school change to be ultra safe
  validateSchool();
  validateAcademicPath();
  validateCareerPath();
});

// Watch for academic path changes
watch(() => props.form[props.choice.choiceKey].academicPath, validateAcademicPath);
// Watch for career path changes
watch(() => props.form[props.choice.choiceKey].careerPath, validateCareerPath);

const validateSchool = () => {
  const choiceKey = props.choice.choiceKey;
  const schoolObj = props.form[choiceKey];

  // If first choice is unset, show error
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
    validateAcademicPath();
    validateCareerPath();
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

      <div v-if="schoolConfig.academicPath.required">
        <label class="block text-blue-100 text-sm font-medium mb-2">
          {{ schoolConfig.academicPath.text }} *
        </label>
        <input
          v-model="form[choice.choiceKey].academicPath"
          type="text"
          class="input-field"
          :class="{ 'border-red-500 focus:border-red-400': errors[choice.choiceKey] }"
          :placeholder="`Saisir : ${schoolConfig.academicPath.text}`"
        />
        <p v-if="errors[choice.choiceKey]" class="text-red-300 text-xs mt-1">
          {{ errors[choice.choiceKey] }}
        </p>
      </div>
      <div v-if="schoolConfig.careerPath.required">
        <label class="block text-blue-100 text-sm font-medium mb-2">
          {{ schoolConfig.careerPath.text }} *
        </label>
        <input
          v-model="form[choice.choiceKey].careerPath"
          type="text"
          class="input-field"
          :class="{ 'border-red-500 focus:border-red-400': errors[choice.choiceKey] }"
          :placeholder="`Saisir : ${schoolConfig.careerPath.text}`"
        />
        <p v-if="errors[choice.choiceKey]" class="text-red-300 text-xs mt-1">
          {{ errors[choice.choiceKey] }}
        </p>
      </div>
    </div>
  </div>
</template>
