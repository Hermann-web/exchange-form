<!-- src/views/NotFoundView.vue -->
<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  router.push('/dashboard');
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-6">
    <div class="w-full max-w-lg text-center">
      <!-- Error Card -->
      <div class="glass rounded-2xl p-10">
        <h1 class="text-6xl font-extrabold text-white mb-4">404</h1>
        <p class="text-blue-100 text-lg mb-6">
          Oops! The page you're looking for doesn’t exist.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button @click="goHome" class="btn-primary w-full sm:w-auto">
            Back to Dashboard
          </button>

          <router-link to="/login" class="btn-secondary w-full sm:w-auto text-center">
            Go to Login
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
