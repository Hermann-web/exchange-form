<script setup lang="ts">
// import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
// import { useAuthStore } from '@/stores/auth';

// const authStore = useAuthStore();

// onMounted(() => {
//   // Try to fetch user on app load if token exists
//   if (authStore.token && !authStore.user) {
//     authStore.fetchUser();
//   }
// });
</script>

<template id="app">
  <div
    class="min-h-screen bg-gradient-to-r from-cyan-900 via-teal-800 to-blue-950 relative overflow-hidden"
  >
    <RouterView />
  </div>
</template>
