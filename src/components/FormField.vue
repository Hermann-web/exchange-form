<!-- FormField.vue -->
<script setup lang="ts">
import type { SubmissionFormMeta } from '@/types/submissionapi';
import type { PersonalField } from './types';

interface Props {
  field: PersonalField<SubmissionFormMeta>;
  value: string;
  error?: string;
}

const { field, value, error } = defineProps<Props>();

const emit = defineEmits<{
  'update:value': [value: string];
  validate: [value: string];
}>();

const handleInput = (event: Event) => {
  const target = event.target as
    | HTMLInputElement
    | HTMLSelectElement
    | HTMLTextAreaElement;
  emit('update:value', target.value);
};

const handleBlur = (event: Event) => {
  const target = event.target as
    | HTMLInputElement
    | HTMLSelectElement
    | HTMLTextAreaElement;
  emit('validate', target.value);
};
</script>

<template>
  <div>
    <label class="block text-blue-100 text-sm font-medium mb-2">
      {{ field.label }}{{ field.required ? ' *' : '' }}
    </label>

    <!-- Text/Email Input -->
    <input
      v-if="field.type === 'text' || field.type === 'email'"
      :value="value"
      :type="field.type"
      :readonly="field.readonly"
      :placeholder="field.placeholder"
      class="input-field"
      :class="{ 'border-red-400': error }"
      @input="handleInput"
      @blur="handleBlur"
    />

    <!-- Select -->
    <select
      v-else-if="field.type === 'select'"
      :value="value"
      class="input-field"
      :class="{ 'border-red-400': error }"
      @change="handleInput"
      @blur="handleBlur"
    >
      <option v-for="option in field.options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>

    <!-- Textarea -->
    <textarea
      v-else-if="field.type === 'textarea'"
      :value="value"
      :rows="field.rows || 2"
      :placeholder="field.placeholder"
      class="input-field"
      :class="{ 'border-red-400': error }"
      @input="handleInput"
      @blur="handleBlur"
    ></textarea>

    <!-- Error Message -->
    <p v-if="error" class="text-red-300 text-xs mt-1">
      {{ error }}
    </p>
  </div>
</template>
