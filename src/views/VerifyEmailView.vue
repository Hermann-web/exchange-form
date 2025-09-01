<!-- src/views/VerifyEmail.vue -->

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { DocumentTextIcon } from '@heroicons/vue/24/outline';

const authStore = useAuthStore();

const sendVerificationEmail = async () => {
  try {
    await authStore.sendVerificationEmail();
    alert('Email de vérification envoyé ! Veuillez vérifier votre boîte de réception.');
  } catch (err: any) {
    alert(err.message || "Échec de l'envoi de l'email de vérification.");
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
        Votre email ({{ authStore.user?.email }}) n'est pas vérifié. Veuillez vérifier
        votre boîte de réception.
      </p>
      <button @click="sendVerificationEmail" class="btn-primary inline-flex items-center">
        <DocumentTextIcon class="w-5 h-5 mr-2" />
        Renvoyer l'email de vérification
      </button>
    </div>
  </div>
</template>
