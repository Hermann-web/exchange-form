<!-- SchoolChoice.vue -->
<script setup lang="ts">
import { watch, computed } from 'vue';
import type { School, SubmissionForm } from '@/types/submissionapi';
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
const selectedSchool = computed(() => props.form[props.choice.schoolKey] as School);

// Validate thematic sequence
const validateThematicSequence = () => {
  const thematicKey = props.choice.thematicKey;
  const schoolKey = props.choice.schoolKey;
  const school = props.form[schoolKey];

  if (['centrale_supelec', 'centrale_mediterranee'].includes(school)) {
    const thematicValue = props.form[thematicKey];
    console.log('thematicValue = ', thematicValue);
    props.errors[thematicKey] = !thematicValue?.trim() ? 'Ce champ est requis' : '';
  } else {
    props.errors[thematicKey] = '';
  }
};

// Watch for school changes and empty all fields
watch(selectedSchool, () => {
  // If switching to 'unset', clear all fields
  props.form[props.choice.thematicKey] = '';

  // Revalidate after school change to be ultra safe
  validateSchool();
  validateThematicSequence();
});

// Watch for thematic sequence changes
watch(() => props.form[props.choice.thematicKey], validateThematicSequence);

const validateSchool = () => {
  const schoolKey = props.choice.schoolKey;
  const school = props.form[schoolKey];

  if (schoolKey === 'school1' && school == 'unset') {
    props.errors[schoolKey] = 'Le premier choix doit être mentionné';
    return;
  }
  props.errors[schoolKey] = '';
};
watch(() => props.form[props.choice.schoolKey], validateSchool);

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
      {{ choice.title === 'first_choice' ? 'Premier Choix' : 'Deuxième Choix' }}
    </h3>

    <div class="grid md:grid-cols-2 gap-6">
      <!-- School Selection -->
      <div>
        <label class="block text-blue-100 text-sm font-medium mb-2">École *</label>
        <select
          v-model="form[choice.schoolKey]"
          class="input-field"
          :class="{ 'border-red-500 focus:border-red-400': errors[choice.schoolKey] }"
        >
          <option
            v-for="school in props.schoolOptions"
            :key="school.value"
            :value="school.value"
          >
            {{ school.label }}
          </option>
        </select>
        <p v-if="errors[choice.schoolKey]" class="text-red-300 text-xs mt-1">
          {{ errors[choice.schoolKey] }}
        </p>
      </div>

      <!-- Thematic Sequence (conditional) -->
      <div
        v-if="
          ['centrale_supelec', 'centrale_mediterranee'].includes(form[choice.schoolKey])
        "
      >
        <label class="block text-blue-100 text-sm font-medium mb-2">
          {{
            form[choice.schoolKey] === 'centrale_supelec'
              ? 'Séquence Thématique *'
              : 'Parcours *'
          }}
        </label>
        <input
          v-model="form[choice.thematicKey]"
          type="text"
          class="input-field"
          :class="{ 'border-red-500 focus:border-red-400': errors[choice.thematicKey] }"
          :placeholder="
            form[choice.schoolKey] === 'centrale_supelec'
              ? 'Saisir la séquence thématique'
              : 'Saisir le parcours'
          "
        />
        <p v-if="errors[choice.thematicKey]" class="text-red-300 text-xs mt-1">
          {{ errors[choice.thematicKey] }}
        </p>
      </div>
    </div>
  </div>
</template>
