<!-- src/components/SchoolChoice.vue -->
<script setup lang="ts">
import { watch, computed, reactive, ref } from 'vue';
import {
  type SubmissionForm,
  type SchoolChoice,
  type School,
} from '@/types/submissionapi';
import { schoolAcademicPathKeyAndRequiredMap, type SchoolConfig } from '@/types/mappings';
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
  electives: '',
});

// Constants for separator handling
const RAW_SEP = '/';
const ACADEMIC_SPLIT_SEPARATOR = ` ${RAW_SEP} `;

// Join a list of parts into a single string
function joinParts(parts: string[]): string {
  const cleaned = parts.map((v) => v.replace(new RegExp(`\\${RAW_SEP}`, 'g'), ''));
  return cleaned.join(ACADEMIC_SPLIT_SEPARATOR);
}

// Split a string into parts by separator
function splitString(value: string): string[] {
  if (!value) return [];
  return value.split(ACADEMIC_SPLIT_SEPARATOR);
}

// Computed: selected school name
const selectedSchool = computed<School>(
  () => props.form[props.choice.choiceKey].schoolName
);

// Computed: school config with fallback
const schoolConfig = computed<SchoolConfig>(() => {
  return schoolAcademicPathKeyAndRequiredMap[selectedSchool.value];
});

// Split values refs for each field
const academicSplitValues = ref<string[]>([]);
const careerSplitValues = ref<string[]>([]);
const electivesSplitValues = ref<string[]>([]);

// Sync split values from string form field value
function syncSplitValues(
  fieldSplitValues: typeof academicSplitValues,
  uiSplit: string[],
  formValue: string
): void {
  if (uiSplit.length === 0) {
    fieldSplitValues.value = [];
    return;
  }
  const parts = splitString(formValue);
  fieldSplitValues.value = uiSplit.map((_, i) => parts[i] || '');
}

// Watchers to sync split values with form values
watch(
  [schoolConfig, () => props.form[props.choice.choiceKey].academicPath],
  ([newConfig, newVal]) => {
    syncSplitValues(academicSplitValues, newConfig.academicPath.uiSplit, newVal);
  },
  { immediate: true }
);

watch(
  [schoolConfig, () => props.form[props.choice.choiceKey].careerPath],
  ([newConfig, newVal]) => {
    syncSplitValues(careerSplitValues, newConfig.careerPath.uiSplit, newVal);
  },
  { immediate: true }
);

watch(
  [schoolConfig, () => props.form[props.choice.choiceKey].electives],
  ([newConfig, newVal]) => {
    syncSplitValues(electivesSplitValues, newConfig.electives.uiSplit, newVal);
  },
  { immediate: true }
);

// Generic watcher for split values updating form fields and validating
function watchSplitValues(
  fieldSplitValues:
    | typeof academicSplitValues
    | typeof careerSplitValues
    | typeof electivesSplitValues,
  fieldKey: keyof SchoolConfig
): void {
  watch(
    fieldSplitValues,
    (newValues) => {
      const configField = schoolConfig.value[fieldKey];

      const currentUiSplit = configField.uiSplit;

      if (configField.required) {
        const missing = currentUiSplit.filter((_, i) => !newValues[i].trim());

        if (missing.length) {
          localErrors[fieldKey] =
            `${currentUiSplit.join(' / ')} requis(e)` +
            (currentUiSplit.length > 1 ? ' entièrement' : '');
          return;
        }
      }

      localErrors[fieldKey] = '';

      const joined = joinParts(newValues);
      if (props.form[props.choice.choiceKey][fieldKey] !== joined) {
        props.form[props.choice.choiceKey][fieldKey] = joined;
      }
    },
    { deep: true }
  );
}

watchSplitValues(academicSplitValues, 'academicPath');
watchSplitValues(careerSplitValues, 'careerPath');
watchSplitValues(electivesSplitValues, 'electives');

// Validation for schoolName (example for first choice)
function validateSchool(): void {
  const choiceKey = props.choice.choiceKey;
  const schoolObj = props.form[choiceKey];

  // If first choice is unset, show error
  if (choiceKey === 'choice1' && schoolObj.schoolName == 'unset') {
    localErrors.schoolName = 'Le premier choix doit être mentionné';
  } else {
    localErrors.schoolName = '';
  }
}

// Watch for schoolName changes
watch(() => props.form[props.choice.choiceKey].schoolName, validateSchool);

// Watch for school change to clear fields and reset splits
watch(selectedSchool, () => {
  const choiceKey = props.choice.choiceKey;
  props.form[choiceKey].academicPath = '';
  props.form[choiceKey].careerPath = '';
  props.form[choiceKey].electives = '';

  academicSplitValues.value = Array.from(
    { length: schoolConfig.value.academicPath.uiSplit.length },
    () => ''
  );
  careerSplitValues.value = Array.from(
    { length: schoolConfig.value.careerPath.uiSplit.length },
    () => ''
  );
  electivesSplitValues.value = Array.from(
    { length: schoolConfig.value.electives.uiSplit.length },
    () => ''
  );

  validateSchool();
});

// Sync localErrors to parent errors prop
watch(
  localErrors,
  () => {
    const choiceKey = props.choice.choiceKey;
    const anyError =
      localErrors.schoolName ||
      localErrors.academicPath ||
      localErrors.careerPath ||
      localErrors.electives;
    props.errors[choiceKey] = anyError;
  },
  { deep: true }
);

// Initialize validation on mount and form changes
watch(
  () => props.form,
  () => {
    validateSchool();
  },
  { immediate: true, deep: true }
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

      <!-- Academic Path -->
      <div v-if="schoolConfig.academicPath.required">
        <label class="block text-blue-100 text-sm font-medium mb-2">
          {{ schoolConfig.academicPath.uiSplit.join(' + ') }} *
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

        <!-- Split Text Input for Academic Path -->
        <div v-else-if="schoolConfig.academicPath.uiSplit.length > 0">
          <div
            v-for="(split, index) in schoolConfig.academicPath.uiSplit"
            :key="index"
            class="mb-2"
          >
            <label
              v-if="schoolConfig.academicPath.uiSplit.length > 1"
              class="block text-blue-100 text-xs font-medium mb-1"
              >{{ split }}</label
            >
            <input
              v-model="academicSplitValues[index]"
              type="text"
              class="input-field"
              :class="{ 'border-red-500 focus:border-red-400': localErrors.academicPath }"
              :placeholder="`Saisir : ${split}`"
            />
          </div>
        </div>

        <p v-if="localErrors.academicPath" class="text-red-300 text-xs mt-1">
          {{ localErrors.academicPath }}
        </p>
      </div>

      <!-- Career Path -->
      <div v-if="schoolConfig.careerPath.required">
        <label class="block text-blue-100 text-sm font-medium mb-2">
          {{ schoolConfig.careerPath.uiSplit.join(' + ') }} *
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

        <!-- Split Text Input for Career Path -->
        <div
          v-else-if="
            schoolConfig.careerPath.uiSplit && schoolConfig.careerPath.uiSplit.length > 0
          "
        >
          <div
            v-for="(split, index) in schoolConfig.careerPath.uiSplit"
            :key="index"
            class="mb-2"
          >
            <label
              v-if="schoolConfig.careerPath.uiSplit.length > 1"
              class="block text-blue-100 text-xs font-medium mb-1"
              >{{ split }}</label
            >
            <input
              v-model="careerSplitValues[index]"
              type="text"
              class="input-field"
              :class="{ 'border-red-500 focus:border-red-400': localErrors.careerPath }"
              :placeholder="`Saisir : ${split}`"
            />
          </div>
        </div>

        <p v-if="localErrors.careerPath" class="text-red-300 text-xs mt-1">
          {{ localErrors.careerPath }}
        </p>
      </div>

      <!-- Electives -->
      <div v-if="schoolConfig.electives.required">
        <label class="block text-blue-100 text-sm font-medium mb-2">
          {{ schoolConfig.electives.uiSplit.join(' + ') }} *
        </label>

        <!-- Select for Electives -->
        <select
          v-if="schoolConfig.electives.options"
          v-model="form[choice.choiceKey].electives"
          class="input-field"
          :class="{ 'border-red-500 focus:border-red-400': localErrors.electives }"
        >
          <option value="" disabled selected>Select an option</option>
          <option
            v-for="option in schoolConfig.electives.options"
            :key="option"
            :value="option"
          >
            {{ option }}
          </option>
        </select>

        <!-- Split Text Input for Electives -->
        <div
          v-else-if="
            schoolConfig.electives.uiSplit && schoolConfig.electives.uiSplit.length > 0
          "
        >
          <div
            v-for="(split, index) in schoolConfig.electives.uiSplit"
            :key="index"
            class="mb-2"
          >
            <label
              v-if="schoolConfig.electives.uiSplit.length > 1"
              class="block text-blue-100 text-xs font-medium mb-1"
              >{{ split }}</label
            >
            <input
              v-model="electivesSplitValues[index]"
              type="text"
              class="input-field"
              :class="{ 'border-red-500 focus:border-red-400': localErrors.electives }"
              :placeholder="`Saisir : ${split}`"
            />
          </div>
        </div>

        <p v-if="localErrors.electives" class="text-red-300 text-xs mt-1">
          {{ localErrors.electives }}
        </p>
      </div>
    </div>
  </div>
</template>
