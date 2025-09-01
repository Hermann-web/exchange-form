<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
</script>

<template id="app">
  <div
    class="min-h-screen relative overflow-hidden"
    :class="{
      'bg-gradient-animated': !authStore.initialized,
      'bg-gradient-static': authStore.initialized,
    }"
  >
    <RouterView v-if="authStore.initialized" />
  </div>
</template>

<style scoped>
@keyframes gradientRotate {
  0% {
    background: linear-gradient(45deg, #083344, #115e59, #172554);
  }
  4.1667% {
    background: linear-gradient(50deg, #083344, #115e59, #172554);
  }
  8.3333% {
    background: linear-gradient(55deg, #083344, #115e59, #172554);
  }
  12.5% {
    background: linear-gradient(60deg, #083344, #115e59, #172554);
  }
  16.6667% {
    background: linear-gradient(65deg, #083344, #115e59, #172554);
  }
  20.8333% {
    background: linear-gradient(70deg, #083344, #115e59, #172554);
  }
  25% {
    background: linear-gradient(75deg, #083344, #115e59, #172554);
  }
  29.1667% {
    background: linear-gradient(80deg, #083344, #115e59, #172554);
  }
  33.3333% {
    background: linear-gradient(85deg, #083344, #115e59, #172554);
  }
  37.5% {
    background: linear-gradient(90deg, #083344, #115e59, #172554);
  }
  41.6667% {
    background: linear-gradient(95deg, #083344, #115e59, #172554);
  }
  45.8333% {
    background: linear-gradient(100deg, #083344, #115e59, #172554);
  }
  50% {
    background: linear-gradient(105deg, #083344, #115e59, #172554);
  }
  54.1667% {
    background: linear-gradient(110deg, #083344, #115e59, #172554);
  }
  58.3333% {
    background: linear-gradient(115deg, #083344, #115e59, #172554);
  }
  62.5% {
    background: linear-gradient(120deg, #083344, #115e59, #172554);
  }
  66.6667% {
    background: linear-gradient(125deg, #083344, #115e59, #172554);
  }
  70.8333% {
    background: linear-gradient(130deg, #083344, #115e59, #172554);
  }
  75% {
    background: linear-gradient(135deg, #083344, #115e59, #172554);
  }
  79.1667% {
    background: linear-gradient(140deg, #083344, #115e59, #172554);
  }
  83.3333% {
    background: linear-gradient(145deg, #083344, #115e59, #172554);
  }
  87.5% {
    background: linear-gradient(150deg, #083344, #115e59, #172554);
  }
  91.6667% {
    background: linear-gradient(155deg, #083344, #115e59, #172554);
  }
  95.8333% {
    background: linear-gradient(160deg, #083344, #115e59, #172554);
  }
  100% {
    background: linear-gradient(165deg, #083344, #115e59, #172554);
  }
}

.bg-gradient-animated {
  animation: gradientRotate 12s linear infinite;
}

.bg-gradient-static {
  background: linear-gradient(to right, #083344, #115e59, #172554);
}
</style>
