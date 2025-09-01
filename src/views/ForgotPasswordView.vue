<!-- src/views/ForgotPasswordView.vue -->
<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { ArrowLeftIcon, EnvelopeIcon } from '@heroicons/vue/24/outline';
import { testEmail } from '@/components/types';

const authStore = useAuthStore();

const form = reactive({
  email: '',
});

const isSubmitting = ref(false);
const success = ref(false);

const emailError = computed(() => {
  if (!form.email) return '';
  return !testEmail(form.email) ? 'Veuillez entrer un email valide' : '';
});

const isFormValid = computed(() => {
  return form.email && !emailError.value;
});

const handleSubmit = async () => {
  if (!isFormValid.value) return;

  isSubmitting.value = true;
  try {
    const result = await authStore.resetPasswordRequest(form.email);
    if (result) {
      success.value = true;
    }
  } catch (err) {
    // Error handled in store
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">Réinitialiser le Mot de Passe</h1>
        <p class="text-blue-100">
          Entrez votre email pour recevoir les instructions de réinitialisation
        </p>
      </div>

      <!-- Success State -->
      <div v-if="success" class="glass rounded-2xl p-8 text-center">
        <div class="mb-6">
          <EnvelopeIcon class="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h2 class="text-xl font-semibold text-white mb-2">Vérifiez Votre Email</h2>
          <p class="text-blue-100">
            Les instructions de réinitialisation ont été envoyées à
            <strong>{{ form.email }}</strong>
          </p>
        </div>

        <div class="space-y-4">
          <router-link
            to="/login"
            class="btn-primary w-full inline-flex items-center justify-center"
          >
            <ArrowLeftIcon class="h-5 w-5 mr-2" />
            Retour à la Connexion
          </router-link>

          <button
            @click="success = false"
            class="w-full text-blue-100 hover:text-white transition-colors text-sm"
          >
            Essayer un autre email
          </button>
        </div>
      </div>

      <!-- Form State -->
      <div v-else class="glass rounded-2xl p-8">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label for="email" class="block text-blue-100 text-sm font-medium mb-2">
              Adresse Email Institutionnelle
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="input-field"
              placeholder="etudiant@universite.ma"
              :class="{ 'border-red-400': emailError }"
            />
            <p v-if="emailError" class="text-red-300 text-xs mt-1">
              {{ emailError }}
            </p>
          </div>

          <div
            v-if="authStore.error"
            class="bg-red-500/20 border border-red-400/30 rounded-lg p-3"
          >
            <p class="text-red-300 text-sm">{{ authStore.error }}</p>
          </div>

          <button
            type="submit"
            :disabled="!isFormValid || isSubmitting"
            class="btn-primary w-full"
          >
            <span v-if="isSubmitting" class="flex items-center justify-center">
              <svg
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Envoi...
            </span>
            <span v-else>Envoyer les Instructions</span>
          </button>
        </form>

        <div class="mt-6 text-center">
          <router-link
            to="/login"
            class="inline-flex items-center text-blue-100 hover:text-white transition-colors text-sm"
          >
            <ArrowLeftIcon class="h-4 w-4 mr-1" />
            Retour à la Connexion
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
