<!-- SchoolChoice.vue -->
<script setup lang="ts">
import type { School } from '@/types/submissionapi';

interface SchoolOption {
  value: School;
  label: string;
}

interface Choice {
  title: string;
  schoolKey: string;
  programKey: string;
  thematicKey: string;
  electivesKey: string;
}

interface Props {
  choice: Choice;
  form: any;
  errors: any;
  schoolOptions: SchoolOption[];
}

const props = defineProps<Props>();
// const { choice, form, errors, schoolOptions } = defineProps<Props>();

const emit = defineEmits<{
  'validate-program': [value: string];
}>();

const handleProgramBlur = () => {
  emit('validate-program', props.form[props.choice.programKey]);
};
</script>

<template>
  <div>
    <h3 class="text-lg font-medium text-blue-200 mb-4">{{ choice.title }}</h3>

    <div class="grid md:grid-cols-2 gap-6">
      <!-- School Selection -->
      <div>
        <label class="block text-blue-100 text-sm font-medium mb-2">School *</label>
        <select v-model="form[choice.schoolKey]" class="input-field">
          <option
            v-for="school in props.schoolOptions"
            :key="school.value"
            :value="school.value"
          >
            {{ school.label }}
          </option>
        </select>
      </div>

      <!-- Program -->
      <div>
        <label class="block text-blue-100 text-sm font-medium mb-2">Program *</label>
        <input
          v-model="form[choice.programKey]"
          @blur="handleProgramBlur"
          type="text"
          class="input-field"
          :class="{ 'border-red-400': props.errors[choice.programKey] }"
          placeholder="e.g., Qualité et statistique en production, Engineering..."
        />
        <p v-if="props.errors[choice.programKey]" class="text-red-300 text-xs mt-1">
          {{ props.errors[choice.programKey] }}
        </p>
      </div>

      <!-- Thematic Sequence (conditional) -->
      <div v-if="form[choice.schoolKey] === 'centrale_supelec'">
        <label class="block text-blue-100 text-sm font-medium mb-2">
          Thematic Sequence
        </label>
        <input
          v-model="form[choice.thematicKey]"
          type="text"
          class="input-field"
          placeholder="Enter thematic sequence"
        />
      </div>

      <!-- Electives -->
      <div>
        <label class="block text-blue-100 text-sm font-medium mb-2">
          Electives (separated by semicolon)
        </label>
        <textarea
          v-model="form[choice.electivesKey]"
          class="input-field"
          rows="2"
          :placeholder="
            choice.title === 'First Choice'
              ? 'Machine Learning; Data Science; AI Ethics'
              : 'Software Engineering; Web Development; Mobile Apps'
          "
        ></textarea>
      </div>
    </div>
  </div>
</template>
