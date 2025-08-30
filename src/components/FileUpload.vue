<!-- FileUpload.vue -->
<script setup lang="ts">
import { CheckCircleIcon } from '@heroicons/vue/24/outline';

interface FileConfig {
  key: string;
  label: string;
  accept: string;
  extensions: string[];
  errorKey: string;
  required: boolean;
  conditional?: () => boolean;
}

interface Props {
  config: FileConfig;
  file: File | null;
  error?: string;
}

const { file, config, error } = defineProps<Props>();

// const props = defineProps<Props>();
const emit = defineEmits<{
  'file-change': [file: File | null];
}>();

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0] || null;
  emit('file-change', file);
};
</script>

<template>
  <div>
    <label class="block text-blue-100 text-sm font-medium mb-2">
      {{ config.label }}{{ config.required ? ' *' : '' }}
    </label>

    <input
      :accept="config.accept"
      type="file"
      class="file-input"
      :class="{ 'border-red-400': error }"
      @change="handleFileChange"
    />

    <!-- Error Message -->
    <p v-if="error" class="text-red-300 text-xs mt-1">
      {{ error }}
    </p>

    <!-- Success Indicator -->
    <div v-if="file" class="flex items-center mt-2 text-green-400 text-sm">
      <CheckCircleIcon class="w-4 h-4 mr-1" />
      {{ file.name }}
    </div>
  </div>
</template>
