<!-- src/components/SchoolChoice.vue -->
<script setup lang="ts">
import { watch, computed, reactive } from 'vue';
import {
  type SubmissionForm,
  schoolAcademicPathKeyAndRequiredMap,
  type SchoolChoice,
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

// Local errors for granular validation
const localErrors = reactive<Record<keyof SchoolChoice, string>>({
  schoolName: '',
  academicPath: '',
  careerPath: '',
});

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
    localErrors.academicPath = !thematicValue?.trim()
      ? `${schoolConfig.value.academicPath.text} requis(e)`
      : '';
  } else {
    localErrors.academicPath = '';
  }
};

const validateCareerPath = () => {
  const choiceKey = props.choice.choiceKey;
  const schoolObj = props.form[choiceKey];

  if (schoolConfig.value.careerPath.required) {
    const careerValue = schoolObj.careerPath;
    localErrors.careerPath = !careerValue?.trim()
      ? `${schoolConfig.value.careerPath.text} requis(e)`
      : '';
  } else {
    localErrors.careerPath = '';
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
    localErrors.schoolName = 'Le premier choix doit être mentionné';
    return;
  }
  localErrors.schoolName = '';
};
watch(() => props.form[props.choice.choiceKey].schoolName, validateSchool);

// Sync local errors to parent props.errors
watch(
  localErrors,
  () => {
    const choiceKey = props.choice.choiceKey;
    const anyError =
      localErrors.schoolName || localErrors.academicPath || localErrors.careerPath;
    props.errors[choiceKey] = anyError;
  },
  { deep: true }
);

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
          :class="{ 'border-red-500 focus:border-red-400': localErrors.schoolName }"
        >
          <option
            v-for="school in props.schoolOptions"
            :key="school.value"
            :value="school.value"
          >
            {{ school.label }}
          </option>
        </select>
        <p v-if="localErrors.schoolName" class="text-red-300 text-xs mt-1">
          {{ localErrors.schoolName }}
        </p>
      </div>

      <div v-if="schoolConfig.academicPath.required">
        <label class="block text-blue-100 text-sm font-medium mb-2">
          {{ schoolConfig.academicPath.text }} *
        </label>

        <!-- Select for Academic Path -->
        <select
          v-if="schoolConfig.academicPath.options"
          v-model="form[choice.choiceKey].academicPath"
          class="input-field"
          :class="{ 'border-red-500 focus:border-red-400': localErrors.academicPath }"
        >
          <option value="" disabled selected>Select an option</option>
          <option
            v-for="option in schoolConfig.academicPath.options"
            :key="option"
            :value="option"
          >
            {{ option }}
          </option>
        </select>

        <!-- Text Input for Academic Path -->
        <input
          v-else
          v-model="form[choice.choiceKey].academicPath"
          type="text"
          class="input-field"
          :class="{ 'border-red-500 focus:border-red-400': localErrors.academicPath }"
          :placeholder="`Saisir : ${schoolConfig.academicPath.text}`"
        />

        <p v-if="localErrors.academicPath" class="text-red-300 text-xs mt-1">
          {{ localErrors.academicPath }}
        </p>
      </div>
      <div v-if="schoolConfig.careerPath.required">
        <label class="block text-blue-100 text-sm font-medium mb-2">
          {{ schoolConfig.careerPath.text }} *
        </label>

        <!-- Select for Career Path -->
        <select
          v-if="schoolConfig.careerPath.options"
          v-model="form[choice.choiceKey].careerPath"
          class="input-field"
          :class="{ 'border-red-500 focus:border-red-400': localErrors.careerPath }"
        >
          <option value="" disabled selected>Select an option</option>
          <option
            v-for="option in schoolConfig.careerPath.options"
            :key="option"
            :value="option"
          >
            {{ option }}
          </option>
        </select>

        <!-- Text Input for Career Path -->
        <input
          v-else
          v-model="form[choice.choiceKey].careerPath"
          type="text"
          class="input-field"
          :class="{ 'border-red-500 focus:border-red-400': localErrors.careerPath }"
          :placeholder="`Saisir : ${schoolConfig.careerPath.text}`"
        />

        <p v-if="localErrors.careerPath" class="text-red-300 text-xs mt-1">
          {{ localErrors.careerPath }}
        </p>
      </div>
    </div>
  </div>
</template>
