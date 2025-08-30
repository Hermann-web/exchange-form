<!-- DocumentItem.vue -->
<script setup lang="ts">
import { ArrowDownTrayIcon } from '@heroicons/vue/24/outline';
import type { DocumentDisplay } from '@/components/types';

interface Props {
  document: DocumentDisplay;
  url: string;
  firstName?: string;
  lastName?: string;
  compact?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  download: [url: string, filename: string];
}>();

const handleDownload = () => {
  const filename =
    props.firstName && props.lastName
      ? `${props.firstName}-${props.lastName}-${props.document.filename}`
      : props.document.filename;

  emit('download', props.url, filename);
};
</script>

<template>
  <!-- Compact Version (for grids) -->
  <button
    v-if="compact"
    @click="handleDownload"
    class="bg-white/5 hover:bg-white/10 rounded-lg p-3 text-center transition-all duration-200 group"
  >
    <component
      :is="document.icon"
      class="w-5 h-5 text-blue-300 mx-auto mb-2 group-hover:text-white group-hover:scale-110 transition-all"
    />
    <span class="text-xs text-blue-200 group-hover:text-white block">
      {{ document.label }}
    </span>
  </button>

  <!-- Full Version (for lists) -->
  <div v-else class="flex items-center justify-between p-4 bg-white/5 rounded-lg">
    <div class="flex items-center">
      <component :is="document.icon" class="w-6 h-6 text-blue-300 mr-3" />
      <div>
        <p class="text-white font-medium">{{ document.label }}</p>
        <p class="text-blue-300 text-sm">{{ document.description }}</p>
      </div>
    </div>
    <button @click="handleDownload" class="btn-secondary flex items-center py-2 px-4">
      <ArrowDownTrayIcon class="w-4 h-4 mr-2" />
      Download
    </button>
  </div>
</template>
