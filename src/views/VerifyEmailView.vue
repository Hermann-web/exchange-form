// src/views/VerifyEmail.vue

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { DocumentTextIcon } from '@heroicons/vue/24/outline';
const authStore = useAuthStore();
const sendVerificationEmail = async () => {
  try {
    await authStore.sendVerificationEmail();
    alert('Verification email sent! Please check your inbox.');
  } catch (err: any) {
    alert(err.message || 'Failed to send verification email.');
  }
};
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
    <div
      v-if="authStore.isAuthenticated && !authStore.isVerified"
      class="glass rounded-2xl p-6 mb-8 text-center"
    >
      <p class="text-red-500 text-lg font-medium mb-4">
        Your email ({{ authStore.user?.email }}) is not verified. Please check your inbox.
      </p>
      <button @click="sendVerificationEmail" class="btn-primary inline-flex items-center">
        <DocumentTextIcon class="w-5 h-5 mr-2" />
        Resend Verification Email
      </button>
    </div>
  </div>
</template>
