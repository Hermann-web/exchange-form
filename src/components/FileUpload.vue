<!-- FileUpload.vue -->
<script setup lang="ts">
import { CheckCircleIcon } from '@heroicons/vue/24/outline';

interface FileConfig {
  key: string;
  label: string;
  accept: string;
  extensions: string[];
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

    <!-- Styled button -->
    <label
      :class="[
        'inline-flex items-center px-4 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors',
        error
          ? 'bg-red-600 text-white hover:bg-red-700'
          : 'bg-blue-600 text-white hover:bg-blue-700',
      ]"
    >
      Choose File
      <input
        :accept="config.accept"
        type="file"
        class="hidden"
        @change="handleFileChange"
      />
    </label>

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
